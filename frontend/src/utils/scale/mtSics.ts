// MT-SICS client for Mettler Toledo balances. Uses only Level 0/1 commands
// (S, @), which every MT-SICS device supports. Transport-agnostic: see ScaleTransport.
import {
  ParsedWeightResponse, ScaleErrorCode, ScaleLogDirection, ScaleTransport, WeightReading
} from './types';
import { ERROR_MESSAGES, ScaleError } from './ScaleError';

export { ERROR_MESSAGES, ScaleError };

const ERROR_LINES: Record<string, ScaleErrorCode> = {
  'S I': 'busy',
  'S +': 'overload',
  'S -': 'underload',
  ES: 'syntax',
  ET: 'transmission',
  EL: 'logic'
};

const isErrorLine = (line: string) => Object.hasOwn(ERROR_LINES, line.trim());

const noop = () => {};

const WEIGHT_LINE = /^S ([SD]) +(-?\d+(?:\.\d+)?) (\S{1,5})\s*$/;

/**
 * Parse one response line to the S / SI commands, e.g. `S S      123.45 g`.
 */
export const parseWeightResponse = (raw: string): ParsedWeightResponse => {
  // trimEnd rather than a regex: drops the CR LF (and any trailing spaces, which the
  // pattern below allows anyway) without a regex that Sonar flags as slow (S5852).
  const line = raw.trimEnd();
  const m = WEIGHT_LINE.exec(line);
  if (m) {
    return {
      ok: true, stable: m[1] === 'S', weight: m[2], unit: m[3], raw: line
    };
  }
  return { ok: false, error: ERROR_LINES[line.trim()] ?? 'unparseable', raw: line };
};

type Pending = {
  accepts: (line: string) => boolean;
  resolve: (line: string) => void;
  reject: (err: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

export type MtSicsClientOptions = {
  /** How long `S` may wait for a stable weight before it is cancelled. */
  timeoutMs?: number;
  onLog?: (direction: ScaleLogDirection, text: string) => void;
};

const RESET_TIMEOUT_MS = 2000;

// MT-SICS replies are well under 100 chars. Anything longer without a line break
// is a faulty device or wrong serial settings; drop it rather than grow forever.
export const MAX_LINE_LENGTH = 1024;

export class MtSicsClient {
  timeoutMs: number;

  onLog: (direction: ScaleLogDirection, text: string) => void;

  onDisconnect: (err?: Error) => void = noop;

  private readonly transport: ScaleTransport;

  private buffer = '';

  private pending: Pending | null = null;

  private queue: Promise<unknown> = Promise.resolve();

  private isConnected = false;

  constructor(transport: ScaleTransport, { timeoutMs = 5000, onLog = noop }: MtSicsClientOptions = {}) {
    this.transport = transport;
    this.timeoutMs = timeoutMs;
    this.onLog = onLog;
  }

  get connected(): boolean {
    return this.isConnected;
  }

  async connect(): Promise<void> {
    this.buffer = '';
    this.transport.onData = (chunk) => this.handleData(chunk);
    this.transport.onDisconnect = (err) => this.handleDisconnect(err);
    await this.transport.open();
    this.isConnected = true;
    this.onLog('info', 'Connected');
    // Reset clears any half-finished command on the balance. Its reply (I4 + serial
    // number) is nice to have; don't fail the connection if it doesn't come.
    await this.enqueue(async () => {
      try {
        const reply = await this.command('@', (l) => l.startsWith('I4') || isErrorLine(l), RESET_TIMEOUT_MS);
        this.onLog('info', `Reset OK: ${reply}`);
      } catch (e) {
        this.onLog('info', `Reset not acknowledged (${(e as ScaleError).code ?? (e as Error).message}); continuing`);
      }
    });
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.failPending(new ScaleError('disconnected'));
    await this.transport.close();
    this.onLog('info', 'Disconnected');
  }

  /**
   * Send `S` and wait for a stable weight.
   * @throws {ScaleError}
   */
  readStableWeight(): Promise<WeightReading> {
    return this.enqueue(async () => {
      let line: string;
      try {
        line = await this.command('S', (l) => l.startsWith('S ') || isErrorLine(l), this.timeoutMs);
      } catch (e) {
        if ((e as ScaleError).code === 'timeout' && this.isConnected) {
          // The balance is still waiting for stability: cancel the pending S. If the
          // cancel fails too, ignore it: the caller gets the original timeout error.
          await this.command('@', (l) => l.startsWith('I4'), RESET_TIMEOUT_MS).catch(noop);
        }
        throw e;
      }
      const r = parseWeightResponse(line);
      if (!r.ok) throw new ScaleError(r.error, r.raw);
      return { weight: r.weight, unit: r.unit, raw: r.raw };
    });
  }

  // Serialise commands so two quick reads (e.g. from two cells) can't interleave.
  private enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.queue.then(fn, fn);
    // The caller handles this command's error via `run`; the queue just moves on to
    // the next command, so it ignores it.
    this.queue = run.catch(noop);
    return run;
  }

  private async command(cmd: string, accepts: (line: string) => boolean, timeoutMs: number): Promise<string> {
    if (!this.isConnected) throw new ScaleError('disconnected');
    const reply = new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending = null;
        reject(new ScaleError('timeout'));
      }, timeoutMs);
      this.pending = {
        accepts, resolve, reject, timer
      };
    });
    this.onLog('tx', cmd);
    try {
      await this.transport.write(`${cmd}\r\n`);
    } catch (e) {
      this.failPending(e as Error);
    }
    return reply;
  }

  private handleData(chunk: string) {
    this.buffer += chunk;
    let i = this.buffer.indexOf('\n');
    while (i >= 0) {
      const line = this.buffer.slice(0, i).replace(/\r$/, '');
      this.buffer = this.buffer.slice(i + 1);
      if (line.trim()) this.handleLine(line);
      i = this.buffer.indexOf('\n');
    }
    if (this.buffer.length > MAX_LINE_LENGTH) {
      this.onLog('info', `Discarded ${this.buffer.length} chars with no line break (check the serial settings)`);
      this.buffer = '';
    }
  }

  private handleLine(line: string) {
    const p = this.pending;
    if (p?.accepts(line)) {
      clearTimeout(p.timer);
      this.pending = null;
      this.onLog('rx', line);
      p.resolve(line);
    } else {
      // e.g. someone pressed the balance's Print key
      this.onLog('rx', `${line}   (unsolicited, ignored)`);
    }
  }

  private failPending(err: Error) {
    if (!this.pending) return;
    clearTimeout(this.pending.timer);
    this.pending.reject(err);
    this.pending = null;
  }

  private handleDisconnect(err?: Error) {
    if (!this.isConnected) return;
    this.isConnected = false;
    this.failPending(new ScaleError('disconnected'));
    this.onLog('info', `Connection lost${err ? `: ${err.message}` : ''}`);
    this.onDisconnect(err);
  }
}
