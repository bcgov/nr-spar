/**
 * Byte stream to a balance. The MT-SICS client sets `onData` and `onDisconnect`
 * before calling `open()`.
 */
export interface ScaleTransport {
  onData: (chunk: string) => void;
  onDisconnect: (err?: Error) => void;
  open(): Promise<void>;
  close(): Promise<void>;
  write(text: string): Promise<void>;
}

export type ScaleLogDirection = 'tx' | 'rx' | 'info';

export type ScaleErrorCode =
  | 'busy'
  | 'overload'
  | 'underload'
  | 'syntax'
  | 'transmission'
  | 'logic'
  | 'timeout'
  | 'unparseable'
  | 'disconnected';

export type WeightReading = {
  /** Kept as a string so the balance's decimal places are preserved exactly. */
  weight: string;
  unit: string;
  raw: string;
};

export type ParsedWeightResponse =
  | (WeightReading & { ok: true; stable: boolean })
  | { ok: false; error: ScaleErrorCode; raw: string };
