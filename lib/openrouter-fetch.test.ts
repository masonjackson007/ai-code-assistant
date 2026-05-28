import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const agentInstances: unknown[] = [];

const AgentMock = vi.fn(function MockAgent(this: Record<string, unknown>, opts: unknown) {
  this.opts = opts;
  agentInstances.push(this);
});

const undiciFetchMock = vi.fn();

vi.mock('undici', () => ({
  Agent: AgentMock,
  fetch: undiciFetchMock,
}));

async function loadModule() {
  vi.resetModules();
  return await import('./openrouter-fetch');
}

beforeEach(() => {
  agentInstances.length = 0;
  AgentMock.mockClear();
  undiciFetchMock.mockReset();
  vi.unstubAllEnvs();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('createOpenRouterFetch', () => {
  it('returns undefined when OPENROUTER_INSECURE_TLS is not set', async () => {
    vi.stubEnv('OPENROUTER_INSECURE_TLS', '');
    const { createOpenRouterFetch } = await loadModule();
    expect(createOpenRouterFetch()).toBeUndefined();
    expect(AgentMock).not.toHaveBeenCalled();
  });

  it('returns undefined when OPENROUTER_INSECURE_TLS is set to a non-"true" value', async () => {
    vi.stubEnv('OPENROUTER_INSECURE_TLS', 'yes');
    const { createOpenRouterFetch } = await loadModule();
    expect(createOpenRouterFetch()).toBeUndefined();
    expect(AgentMock).not.toHaveBeenCalled();
  });

  it('throws when NODE_ENV=production and the flag is enabled', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('OPENROUTER_INSECURE_TLS', 'true');
    const { createOpenRouterFetch } = await loadModule();
    expect(() => createOpenRouterFetch()).toThrow(
      /OPENROUTER_INSECURE_TLS cannot be enabled in production/,
    );
    expect(AgentMock).not.toHaveBeenCalled();
  });

  it('returns a custom fetch in development when the flag is enabled', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('OPENROUTER_INSECURE_TLS', 'true');

    const { createOpenRouterFetch } = await loadModule();
    const customFetch = createOpenRouterFetch();

    expect(customFetch).toBeTypeOf('function');
    expect(AgentMock).toHaveBeenCalledTimes(1);
    expect(AgentMock).toHaveBeenCalledWith({
      connect: { rejectUnauthorized: false },
    });
  });

  it('forwards calls through undici.fetch with the insecure dispatcher', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('OPENROUTER_INSECURE_TLS', 'true');

    const fakeResponse = { ok: true, status: 200 } as unknown as Response;
    undiciFetchMock.mockResolvedValue(fakeResponse);

    const { createOpenRouterFetch } = await loadModule();
    const customFetch = createOpenRouterFetch();
    expect(customFetch).toBeTypeOf('function');

    const url = 'https://openrouter.ai/api/v1/chat';
    const init: RequestInit = {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ hello: 'world' }),
    };

    const response = await customFetch!(url, init);

    expect(response).toBe(fakeResponse);
    expect(undiciFetchMock).toHaveBeenCalledTimes(1);

    const [calledUrl, calledInit] = undiciFetchMock.mock.calls[0] as [
      string,
      Record<string, unknown>,
    ];
    expect(calledUrl).toBe(url);
    expect(calledInit.method).toBe('POST');
    expect(calledInit.body).toBe(init.body);
    expect(calledInit.dispatcher).toBe(agentInstances[0]);
  });
});
