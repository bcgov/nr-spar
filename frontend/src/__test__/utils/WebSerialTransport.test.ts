import {
  afterEach, beforeEach, describe, expect, it, vi
} from 'vitest';

import {
  DEFAULT_SERIAL_OPTIONS, SerialOptions, WebSerialTransport, isWebSerialSupported
} from '../../utils/scale/WebSerialTransport';

/**
 * Stand-in for a Web Serial port. Like Chrome's, it gives a new `readable` after a
 * non-fatal read error, sets `readable` to null when the device is gone, and
 * refuses to close while its stream is still locked by a reader.
 */
class FakePort {
  readable: ReadableStream<Uint8Array> | null = null;

  writable: WritableStream<Uint8Array> | null = null;

  openedWith?: SerialOptions;

  written: number[] = [];

  closed = false;

  private controller?: ReadableStreamDefaultController<Uint8Array>;

  async open(options: SerialOptions) {
    this.openedWith = options;
    this.newReadable();
    this.writable = new WritableStream({ write: (chunk) => { this.written.push(...chunk); } });
  }

  async close() {
    if (this.readable?.locked) throw new Error('Cannot close a locked stream');
    this.closed = true;
    this.readable = null;
    this.writable = null;
  }

  /** Bytes arriving from the balance. */
  receive(bytes: number[]) {
    this.controller?.enqueue(Uint8Array.from(bytes));
  }

  /** A framing/parity error: this stream errors, the port carries on with a new one. */
  glitch() {
    const old = this.controller;
    this.newReadable();
    old?.error(new Error('Framing error'));
  }

  /** The device is gone: the stream errors and there is no new one. */
  lose() {
    const old = this.controller;
    this.readable = null;
    old?.error(new Error('The device has been lost'));
  }

  private newReadable() {
    this.readable = new ReadableStream({ start: (c) => { this.controller = c; } });
  }
}

/** Stand-in for navigator.serial. Disconnect events carry the port as their target. */
class FakeSerial {
  port = new FakePort();

  listeners = new Set<(e: { target: unknown }) => void>();

  requestPort = vi.fn(async () => this.port);

  addEventListener(_type: string, fn: (e: { target: unknown }) => void) { this.listeners.add(fn); }

  removeEventListener(_type: string, fn: (e: { target: unknown }) => void) { this.listeners.delete(fn); }

  unplug(target: unknown = this.port) {
    this.listeners.forEach((fn) => fn({ target }));
  }
}

const flush = () => new Promise((resolve) => { setTimeout(resolve, 0); });

let serial: FakeSerial;

const installSerial = () => {
  serial = new FakeSerial();
  Object.defineProperty(navigator, 'serial', { value: serial, configurable: true });
};

const openTransport = async (options: Partial<SerialOptions> = {}) => {
  const transport = new WebSerialTransport(options);
  transport.onData = vi.fn();
  transport.onDisconnect = vi.fn();
  await transport.open();
  return transport;
};

describe('WebSerialTransport', () => {
  beforeEach(installSerial);

  afterEach(() => {
    delete (navigator as Navigator & { serial?: unknown }).serial;
  });

  describe('when Web Serial is not available (Firefox, Safari)', () => {
    beforeEach(() => {
      delete (navigator as Navigator & { serial?: unknown }).serial;
    });

    it('reports it as unsupported', () => {
      expect(isWebSerialSupported()).toBe(false);
    });

    it('fails to open with a message the user can act on', async () => {
      await expect(new WebSerialTransport().open()).rejects.toThrow('Use Chrome or Edge');
    });
  });

  it('reports Web Serial as supported when the browser has it', () => {
    expect(isWebSerialSupported()).toBe(true);
  });

  it('asks the user for a port and opens it with the default settings', async () => {
    await openTransport();
    expect(serial.requestPort).toHaveBeenCalledOnce();
    expect(serial.port.openedWith).toEqual(DEFAULT_SERIAL_OPTIONS);
  });

  it('opens with overridden settings merged over the defaults', async () => {
    await openTransport({ baudRate: 9600 });
    expect(serial.port.openedWith).toEqual({ ...DEFAULT_SERIAL_OPTIONS, baudRate: 9600 });
  });

  it('writes one byte per character, not UTF-8', async () => {
    const transport = await openTransport();
    await transport.write('S\r\n');
    await transport.write('é'); // 0xE9 in windows-1252; UTF-8 would be two bytes
    expect(serial.port.written).toEqual([0x53, 0x0d, 0x0a, 0xe9]);
  });

  it('refuses to write before the port is open', async () => {
    await expect(new WebSerialTransport().write('S\r\n')).rejects.toThrow('Port not open');
  });

  it('passes incoming bytes on as windows-1252 text', async () => {
    const transport = await openTransport();
    serial.port.receive([...'S S  1.2 g'].map((c) => c.charCodeAt(0)));
    serial.port.receive([0xb5, 0x0d, 0x0a]); // µ CR LF
    await flush();
    expect(transport.onData).toHaveBeenNthCalledWith(1, 'S S  1.2 g');
    expect(transport.onData).toHaveBeenNthCalledWith(2, 'µ\r\n');
  });

  it('keeps reading after a non-fatal read error', async () => {
    const transport = await openTransport();
    serial.port.glitch();
    await flush();
    serial.port.receive([0x41]); // "A"
    await flush();
    expect(transport.onDisconnect).not.toHaveBeenCalled();
    expect(transport.onData).toHaveBeenCalledWith('A');
  });

  it('reports a disconnect when the device is lost mid-read', async () => {
    const transport = await openTransport();
    serial.port.lose();
    await flush();
    expect(transport.onDisconnect).toHaveBeenCalledWith(expect.objectContaining({ message: 'The device has been lost' }));
  });

  it('reports a disconnect when its own device is unplugged', async () => {
    const transport = await openTransport();
    serial.unplug();
    expect(transport.onDisconnect).toHaveBeenCalledWith(expect.objectContaining({ message: 'Device unplugged' }));
  });

  it('ignores another device being unplugged', async () => {
    const transport = await openTransport();
    serial.unplug(new FakePort());
    expect(transport.onDisconnect).not.toHaveBeenCalled();
  });

  it('closes cleanly: stops reading, closes the port and stops listening for unplugs', async () => {
    const transport = await openTransport();
    await transport.close();
    expect(serial.port.closed).toBe(true); // would throw if the reader still held the stream
    expect(serial.listeners.size).toBe(0);
    expect(transport.onDisconnect).not.toHaveBeenCalled();
    await expect(transport.write('S\r\n')).rejects.toThrow('Port not open');
  });

  it('can be closed without ever being opened', async () => {
    await expect(new WebSerialTransport().close()).resolves.toBeUndefined();
  });
});
