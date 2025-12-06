import http from "./http";

export async function borrowUmbrella(data: {
  umbrellaId: string;
  studentId: string;
  studentName: string;
  pickupLocation: string;
}) {
  return http("/api/transactions/borrow", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function returnUmbrella(data: {
  umbrellaId: string;
  studentId: string;
  code: string;
  returnLocation: string;
}) {
  return http("/api/transactions/return", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
