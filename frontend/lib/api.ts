const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(
  path: string,
  token: string,
  options: RequestInit = {}
) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}
