import { vi } from "vitest";

const authContextMock = {
  signed: true,
  user: null,
  isCurrentAuthUser: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  provider: 'idir',
  token: 'anything'
};

export default authContextMock;
