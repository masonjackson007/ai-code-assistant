import { Agent, fetch as undiciFetch, type RequestInit as UndiciRequestInit } from 'undici';

/**
 * Optional dev-only fetch for networks that intercept HTTPS with a corporate CA
 * that Node does not trust. Enable with OPENROUTER_INSECURE_TLS=true in .env.local.
 *
 * Prefer fixing trust properly via NODE_EXTRA_CA_CERTS pointing at your org root CA.
 */
export function createOpenRouterFetch(): typeof fetch | undefined {
  if (process.env.OPENROUTER_INSECURE_TLS !== 'true') {
    return undefined;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'OPENROUTER_INSECURE_TLS cannot be enabled in production. Set NODE_EXTRA_CA_CERTS instead.',
    );
  }

  const agent = new Agent({
    connect: {
      rejectUnauthorized: false,
    },
  });

  const fetchWithAgent = async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const response = await undiciFetch(input as string | URL, {
      ...(init as UndiciRequestInit),
      dispatcher: agent,
    });
    return response as unknown as Response;
  };

  return fetchWithAgent as typeof fetch;
}
