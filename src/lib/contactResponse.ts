export interface ContactApiResult {
  ok: boolean;
  error?: string;
}

export async function readContactResponse(response: Response): Promise<ContactApiResult> {
  const text = await response.text();

  if (!text) {
    return {
      ok: response.ok,
      error: response.ok ? undefined : "Message could not be sent.",
    };
  }

  try {
    const parsed = JSON.parse(text) as ContactApiResult;
    return {
      ok: Boolean(parsed.ok),
      error: parsed.error,
    };
  } catch {
    return {
      ok: false,
      error: response.ok
        ? "Contact service returned an invalid response."
        : "Contact service failed on the server. Check Vercel Function logs.",
    };
  }
}
