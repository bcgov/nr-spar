// Real balance over the Web Serial API (Chrome / Edge, https:// or http://localhost only).
// Serial settings MUST match the balance's interface menu; confirm on-site.
import { ScaleTransport } from './types';

// Standard serial rates that Mettler balances offer. Limits baudRate to these so a
// typo like 2401 doesn't compile.
export const BAUD_RATES = [1200, 2400, 4800, 9600, 19200, 38400] as const;
export type BaudRate = typeof BAUD_RATES[number];

export type SerialParity = 'none' | 'even' | 'odd';
// Web Serial has no software (Xon/Xoff) flow control. If the balance is set to
// Xon/Xoff, change it to "none" in the balance's interface menu.
export type SerialFlowControl = 'none' | 'hardware';

export type SerialOptions = {
  baudRate: BaudRate;
  dataBits: 7 | 8;
  parity: SerialParity;
  stopBits: 1 | 2;
  flowControl: SerialFlowControl;
};

// Typings for navigator.serial (the Web Serial API). TypeScript's built-in browser
// types don't include Web Serial yet, since it's Chrome/Edge only and not a finished
// standard, so `navigator.serial` would fail to compile. These describe only the parts
// this file uses. The full official types are in the @types/w3c-web-serial package
// if more is ever needed.

/** One serial (COM) port: open/close it, plus the incoming and outgoing byte streams. */
interface SerialPortLike {
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;
  open(options: SerialOptions): Promise<void>;
  close(): Promise<void>;
}

/** navigator.serial itself: shows the port picker and fires the "disconnect" event on unplug. */
interface SerialLike extends EventTarget {
  requestPort(): Promise<SerialPortLike>;
}

/**
 * Returns navigator.serial typed as SerialLike, or undefined where Web Serial
 * doesn't exist (Firefox, Safari, or no browser at all, e.g. some test runners).
 */
const getSerial = (): SerialLike | undefined => (
  typeof navigator === 'undefined'
    ? undefined
    : (navigator as Navigator & { serial?: SerialLike }).serial
);

/**
 * Taken from the COM1 port settings on a TSC workstation:
 * 2400 baud, 7 data bits, even parity, 1 stop bit, no flow control.
 * Confirm against the balance on the first on-site connect.
 */
export const DEFAULT_SERIAL_OPTIONS: Readonly<SerialOptions> = {
  baudRate: 2400,
  dataBits: 7,
  parity: 'even',
  stopBits: 1,
  flowControl: 'none'
};

export const isWebSerialSupported = (): boolean => getSerial() !== undefined;

const noop = () => {};

export class WebSerialTransport implements ScaleTransport {
  onData: (chunk: string) => void = noop;

  onDisconnect: (err?: Error) => void = noop;

  readonly options: SerialOptions;

  private port: SerialPortLike | null = null;

  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

  private readLoop: Promise<void> | null = null;

  private closing = false;

  constructor(options: Partial<SerialOptions> = {}) {
    this.options = { ...DEFAULT_SERIAL_OPTIONS, ...options };
  }

  private readonly onUsbDisconnect = (e: Event) => {
    if (e.target === this.port) this.onDisconnect(new Error('Device unplugged'));
  };

  async open(): Promise<void> {
    const serial = getSerial();
    if (!serial) {
      throw new Error('Web Serial is not available. Use Chrome or Edge over https:// or http://localhost.');
    }
    // Must be called from a user gesture (click) the first time.
    this.port = await serial.requestPort();
    await this.port.open(this.options);
    this.closing = false;
    serial.addEventListener('disconnect', this.onUsbDisconnect);
    this.readLoop = this.read();
  }

  async close(): Promise<void> {
    this.closing = true;
    getSerial()?.removeEventListener('disconnect', this.onUsbDisconnect);
    // Errors are ignored on purpose in the three steps below: closing must always
    // finish, and the port may already be gone (e.g. unplugged).
    // Stop the read so the port's stream is unlocked (port.close() fails otherwise).
    await this.reader?.cancel().catch(noop);
    await this.readLoop?.catch(noop);
    await this.port?.close().catch(noop);
    this.port = null;
  }

  async write(text: string): Promise<void> {
    if (!this.port?.writable) throw new Error('Port not open');
    // MT-SICS is 8-bit ASCII: one byte per char (TextEncoder would emit UTF-8).
    const bytes = Uint8Array.from(text, (c) => c.charCodeAt(0) % 256);
    const writer = this.port.writable.getWriter();
    try {
      await writer.write(bytes);
    } finally {
      writer.releaseLock();
    }
  }

  // Reads until the stream ends (port closed, or close() cancels the reader).
  private async read() {
    // The balance sends 8-bit text (chars 32-255), not UTF-8.
    const decoder = new TextDecoder('windows-1252');
    while (this.port?.readable && !this.closing) {
      const reader = this.port.readable.getReader();
      this.reader = reader;
      try {
        // eslint-disable-next-line no-await-in-loop
        let result = await reader.read();
        while (!result.done) {
          this.onData(decoder.decode(result.value, { stream: true }));
          // eslint-disable-next-line no-await-in-loop
          result = await reader.read();
        }
      } catch (err) {
        // Non-fatal errors (framing/parity) give the port a new `readable`, and the
        // outer loop carries on reading from it. A null `readable` means the port is gone.
        if (!this.closing && !this.port?.readable) this.onDisconnect(err as Error);
      } finally {
        reader.releaseLock();
        this.reader = null;
      }
    }
  }
}
