import { http } from "./http";

/* -----------------------------
   ADMIN — GET FULL INVENTORY
----------------------------- */
export async function getInventory(token: string) {
  return http("/api/inventory", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/* -----------------------------
   STUDENT — GET PUBLIC INVENTORY
----------------------------- */
export async function getPublicInventory(token: string) {
  return http("/api/inventory/public", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/* -----------------------------
   ADMIN — ADD NEW UMBRELLA
----------------------------- */
export async function addUmbrella(data: any, token: string) {
  return http("/api/inventory", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

/* -----------------------------
   ADMIN — GENERATE CODES
----------------------------- */
export async function generateCode(
  umbrellaId: string,
  type: "borrow" | "return",
  token: string
) {
  return http(`/api/inventory/${umbrellaId}/generate-code`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type }),
  });
}
