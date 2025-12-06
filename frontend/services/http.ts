async function http(path: string, options: RequestInit = {}) {
  const res = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    let txt = "";
    try {
      txt = await res.text();
    } catch {}
    throw new Error(txt || "Request failed");
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}

export default http;
