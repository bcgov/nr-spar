import {
  afterEach, beforeEach, describe, expect, it, vi
} from 'vitest';

import {
  MAX_LINE_LENGTH, MtSicsClient, ScaleError, parseWeightResponse
} from '../../utils/scale/mtSics';
import { MockTransport } from '../__mocks__/MockTransport';
import { ScaleTransport } from '../../utils/scale/types';

describe('parseWeightResponse', () => {
  it('parses a stable weight and keeps it as a string', () => {
    expect(parseWeightResponse('S S      123.45 g\r\n')).toEqual({
      ok: true, stable: true, weight: '123.45', unit: 'g', raw: 'S S      123.45 g'
    });
  });

  it('keeps trailing zeros exactly as sent', () => {
    const r = parseWeightResponse('S S     12.3400 g');
    expect(r.ok && r.weight).toBe('12.3400');
  });

  it('parses negative and dynamic weights and longer units', () => {
    expect(parseWeightResponse('S D     -0.0012 mg')).toMatchObject({
      ok: true, stable: false, weight: '-0.0012', unit: 'mg'
    });
    expect(parseWeightResponse('S S         42 ozt')).toMatchObject({ ok: true, weight: '42', unit: 'ozt' });
  });

  it('parses a weight that fills the whole 10-character field', () => {
    expect(parseWeightResponse('S S 1234567.89 g')).toMatchObject({ ok: true, weight: '1234567.89' });
  });

  it.each([
    ['S I', 'busy'],
    ['S +', 'overload'],
    ['S -', 'underload'],
    ['ES', 'syntax'],
    ['ET', 'transmission'],
    ['EL', 'logic'],
    ['I4 A "123"', 'unparseable'],
    ['S S   abc g', 'unparseable']
  ])('maps %s to %s', (line, error) => {
    expect(parseWeightResponse(line)).toEqual({ ok: false, error, raw: line });
  });
});

describe('MtSicsClient with MockTransport', () => {
  let mock: MockTransport;
  let client: MtSicsClient;
  let log: Array<[string, string]>;

  const connect = async () => {
    const p = client.connect();
    await vi.advanceTimersByTimeAsync(100);
    await p;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    mock = new MockTransport({ weight: '12.3456', randomize: false, settleMs: 300 });
    log = [];
    client = new MtSicsClient(mock, { timeoutMs: 1000, onLog: (d, t) => log.push([d, t]) });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('sends @ on connect and logs the serial number', async () => {
    await connect();
    expect(client.connected).toBe(true);
    expect(log).toContainEqual(['tx', '@']);
    expect(log).toContainEqual(['info', 'Reset OK: I4 A "SIM0001"']);
  });

  it('still connects when the balance does not answer @', async () => {
    const silent: ScaleTransport = {
      onData: () => {},
      onDisconnect: () => {},
      open: async () => {},
      close: async () => {},
      write: async () => {}
    };
    client = new MtSicsClient(silent, { onLog: (d, t) => log.push([d, t]) });
    const p = client.connect();
    await vi.advanceTimersByTimeAsync(2500);
    await p;
    expect(client.connected).toBe(true);
    expect(log.some(([, t]) => t.startsWith('Reset not acknowledged (timeout)'))).toBe(true);
  });

  it('reads a stable weight', async () => {
    await connect();
    const p = client.readStableWeight();
    await vi.advanceTimersByTimeAsync(300);
    await expect(p).resolves.toEqual({ weight: '12.3456', unit: 'g', raw: 'S S    12.3456 g' });
    expect(log).toContainEqual(['tx', 'S']);
  });

  it.each([
    ['busy', 'busy'],
    ['overload', 'overload'],
    ['underload', 'underload']
  ] as const)('rejects with %s when the balance reports it', async (mode, code) => {
    await connect();
    mock.mode = mode;
    const p = client.readStableWeight();
    const assertion = expect(p).rejects.toMatchObject({ code });
    await vi.advanceTimersByTimeAsync(300);
    await assertion;
  });

  it('times out when the weight never settles, then cancels with @', async () => {
    await connect();
    mock.mode = 'unstable';
    log = [];
    const p = client.readStableWeight();
    const assertion = expect(p).rejects.toBeInstanceOf(ScaleError);
    await vi.advanceTimersByTimeAsync(1000 + 100);
    await assertion;
    await expect(p).rejects.toMatchObject({ code: 'timeout' });
    expect(log.filter(([d]) => d === 'tx').map(([, t]) => t)).toEqual(['S', '@']);
  });

  it('takes a Print-key line during a pending S as the reply and ignores the late S reply', async () => {
    // A Print-key line looks exactly like an S reply, so it can't be told apart.
    // What matters is that each line is used once and the extra one is ignored.
    await connect();
    mock.weight = '7.0000';
    const p = client.readStableWeight(); // S reply (7.0000) arrives after settleMs
    await vi.advanceTimersByTimeAsync(0); // let the queued S go out
    mock.weight = '99.9999';
    mock.pressPrintKey(); // arrives immediately
    await vi.advanceTimersByTimeAsync(300);
    await expect(p).resolves.toMatchObject({ weight: '99.9999' });
    expect(log).toContainEqual(['rx', 'S S     7.0000 g   (unsolicited, ignored)']);
  });

  it('logs a Print-key line as unsolicited when nothing is pending', async () => {
    await connect();
    mock.pressPrintKey();
    await vi.advanceTimersByTimeAsync(0);
    expect(log).toContainEqual(['rx', 'S S    12.3456 g   (unsolicited, ignored)']);
  });

  it('queues a double read so the second S is sent after the first reply', async () => {
    await connect();
    log = [];
    mock.weight = '1.0000';
    const first = client.readStableWeight();
    const second = client.readStableWeight();
    await vi.advanceTimersByTimeAsync(0);
    expect(log.filter(([d]) => d === 'tx')).toHaveLength(1);
    mock.weight = '2.0000';
    await vi.advanceTimersByTimeAsync(300);
    await expect(first).resolves.toMatchObject({ weight: '1.0000' });
    await vi.advanceTimersByTimeAsync(300);
    await expect(second).resolves.toMatchObject({ weight: '2.0000' });
    expect(log.filter(([d]) => d === 'tx').map(([, t]) => t)).toEqual(['S', 'S']);
  });

  it('handles replies split across chunks', async () => {
    const chunks: ScaleTransport = {
      onData: () => {},
      onDisconnect: () => {},
      open: async () => {},
      close: async () => {},
      write: async (text) => {
        if (text === 'S\r\n') {
          setTimeout(() => {
            chunks.onData('S S   ');
            chunks.onData('   5.5 g\r');
            chunks.onData('\n');
          }, 10);
        }
      }
    };
    client = new MtSicsClient(chunks, { timeoutMs: 1000 });
    const c = client.connect();
    await vi.advanceTimersByTimeAsync(2000);
    await c;
    const p = client.readStableWeight();
    await vi.advanceTimersByTimeAsync(10);
    await expect(p).resolves.toMatchObject({ weight: '5.5', unit: 'g' });
  });

  it('fails a pending read and calls onDisconnect when the cable is pulled', async () => {
    await connect();
    const onDisconnect = vi.fn();
    client.onDisconnect = onDisconnect;
    const p = client.readStableWeight();
    const assertion = expect(p).rejects.toMatchObject({ code: 'disconnected' });
    mock.unplug();
    await assertion;
    expect(onDisconnect).toHaveBeenCalledOnce();
    expect(client.connected).toBe(false);
    await expect(client.readStableWeight()).rejects.toMatchObject({ code: 'disconnected' });
  });

  it('discards runaway data with no line break and still reads afterwards', async () => {
    await connect();
    mock.onData('x'.repeat(MAX_LINE_LENGTH + 1));
    expect(log.some(([d, t]) => d === 'info' && t.startsWith(`Discarded ${MAX_LINE_LENGTH + 1} chars`))).toBe(true);

    const p = client.readStableWeight();
    await vi.advanceTimersByTimeAsync(300);
    await expect(p).resolves.toMatchObject({ weight: '12.3456' });
  });

  it('rejects reads before connect', async () => {
    await expect(client.readStableWeight()).rejects.toMatchObject({ code: 'disconnected' });
  });
});
