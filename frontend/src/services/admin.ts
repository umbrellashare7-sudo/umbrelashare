import http from "./http";

export async function loginAdmin(email: string, password: string) {
  return http("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getInventory(token: string) {
  return http("/api/inventory", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function addUmbrella(data: any, token: string) {
  return http("/api/inventory", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export async function getActiveCodes(token: string) {
  return http("/api/transactions/active-codes", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getRecentTransactions(token: string) {
  return http("/api/transactions/recent", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
