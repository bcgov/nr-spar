/**
 * Simulated Mettler MT-SICS balance, for tests and for debugging scale screens
 * locally without hardware. It implements the same ScaleTransport interface as
 * WebSerialTransport, so MtSicsClient can't tell the difference.
 *
 * What it does
 * - Answers `S` (stable weight) after `settleMs`, `@` (reset), `SI` and `I2`;
 *   anything else gets `ES` (syntax error), like a real balance.
 * - `mode` picks the behaviour of `S`:
 *     ok        -> `S S    12.3456 g` (random weight each read if `randomize`)
 *     busy      -> `S I`
 *     overload  -> `S +`
 *     underload -> `S -`
 *     unstable  -> never answers, so the client times out and sends `@`
 * - `pressPrintKey()` sends a weight line nobody asked for (the balance's Print key).
 * - `unplug()` simulates the cable being pulled.
 * - Every property can be changed while connected; the next command uses the new value.
 *
 * In unit tests
 *   Use fake timers, since replies arrive on setTimeout:
 *
 *     vi.useFakeTimers();
 *     const mock = new MockTransport({ weight: '5.0000', randomize: false, settleMs: 300 });
 *     const client = new MtSicsClient(mock, { timeoutMs: 1000 });
 *     const connecting = client.connect();
 *     await vi.advanceTimersByTimeAsync(100);   // let the @ reply arrive
 *     await connecting;
 *     const reading = client.readStableWeight();
 *     await vi.advanceTimersByTimeAsync(300);   // settleMs
 *     await expect(reading).resolves.toMatchObject({ weight: '5.0000', unit: 'g' });
 *
 *   See src/__test__/utils/MtSics.test.ts for busy, timeout, Print-key and unplug cases.
 *
 * Debugging a screen locally (no balance needed)
 *   No code changes: screens get their connection from createScaleTransport()
 *   (src/utils/scale/createScaleTransport.ts), which picks this simulator up locally.
 *
 *   1. COPY this file to src/utils/scale/MockTransport.ts. That path is gitignored
 *      (src/utils/scale/.gitignore), so the copy can never be committed. Keep this
 *      original here: the unit tests import it.
 *   2. Add VITE_SCALE_MOCK=true to frontend/.env (also gitignored) and restart
 *      `npm start`. The console logs "[scale] Using the simulated balance".
 *   3. Use the screen as normal (Connect skips the port picker), and drive the
 *      simulator from the DevTools console:
 *
 *     scaleMock.mode = 'overload'      // next read shows the overload error
 *     scaleMock.mode = 'unstable'      // next read times out
 *     scaleMock.mode = 'ok'
 *     scaleMock.randomize = false; scaleMock.weight = '0.1234'   // fixed weight
 *     scaleMock.settleMs = 3000        // slow balance: check the "reading" state
 *     scaleMock.pressPrintKey()        // unsolicited line: should be ignored
 *     scaleMock.unplug()               // screen should show disconnected
 *
 *   4. To use a real balance again, remove VITE_SCALE_MOCK from .env and restart.
 *      The copy can stay. If you change the mock, change this original and re-copy
 *      (the copy is throwaway).
 *
 *   Never deployed: createScaleTransport only looks for the simulator in local dev
 *   (`import.meta.env.DEV`), and Vite strips that code from production builds.
 */
// '@/' alias (not a relative path) so this file works unchanged when copied to src/utils/scale/.
import { ScaleTransport } from '@/utils/scale/types';

export const MOCK_MODES = ['ok', 'busy', 'overload', 'underload', 'unstable'] as const;

export type MockMode = typeof MOCK_MODES[number];

export type MockTransportOptions = {
  weight?: string;
  unit?: string;
  settleMs?: number;
  /** New random weight on each read, like placing a new sample. */
  randomize?: boolean;
};

const QUICK_REPLY_MS = 50;

const noop = () => {};

export class MockTransport implements ScaleTransport {
  onData: (chunk: string) => void = noop;

  onDisconnect: (err?: Error) => void = noop;

  weight: string;

  unit: string;

  settleMs: number;

  randomize: boolean;

  mode: MockMode = 'ok';

  serial = 'SIM0001';

  private isOpen = false;

  private rx = '';

  constructor({
    weight = '12.3456', unit = 'g', settleMs = 600, randomize = true
  }: MockTransportOptions = {}) {
    this.weight = weight;
    this.unit = unit;
    this.settleMs = settleMs;
    this.randomize = randomize;
  }

  async open(): Promise<void> {
    this.isOpen = true;
    this.rx = '';
  }

  async close(): Promise<void> {
    this.isOpen = false;
  }

  async write(text: string): Promise<void> {
    if (!this.isOpen) throw new Error('Port not open');
    this.rx += text;
    let i = this.rx.indexOf('\r\n');
    while (i >= 0) {
      const cmd = this.rx.slice(0, i).trim();
      this.rx = this.rx.slice(i + 2);
      this.handle(cmd);
      i = this.rx.indexOf('\r\n');
    }
  }

  /** Simulate someone pressing the balance's Print key (unsolicited output). */
  pressPrintKey(): void {
    this.send(this.weightLine('S'), 0);
  }

  /** Simulate the cable being pulled. */
  unplug(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.onDisconnect(new Error('Device unplugged'));
  }

  private handle(cmd: string) {
    switch (cmd) {
      case 'S':
        this.handleS();
        break;
      case 'SI':
        this.send(this.weightLine(this.mode === 'unstable' ? 'D' : 'S'), QUICK_REPLY_MS);
        break;
      case '@':
        this.send(`I4 A "${this.serial}"`, QUICK_REPLY_MS);
        break;
      case 'I2':
        this.send('I2 A "Simulated balance"', QUICK_REPLY_MS);
        break;
      default:
        this.send('ES', QUICK_REPLY_MS);
    }
  }

  private handleS() {
    switch (this.mode) {
      case 'unstable':
        // A real S waits for stability, so it never answers.
        break;
      case 'busy':
        this.send('S I', QUICK_REPLY_MS);
        break;
      case 'overload':
        this.send('S +', this.settleMs);
        break;
      case 'underload':
        this.send('S -', this.settleMs);
        break;
      default:
        if (this.randomize) this.weight = (Math.random() * 40 + 1).toFixed(4);
        this.send(this.weightLine('S'), this.settleMs);
    }
  }

  private weightLine(status: 'S' | 'D') {
    return `S ${status} ${this.weight.padStart(10)} ${this.unit}`;
  }

  private send(line: string, delayMs: number) {
    setTimeout(() => {
      if (this.isOpen) this.onData(`${line}\r\n`);
    }, delayMs);
  }
}
