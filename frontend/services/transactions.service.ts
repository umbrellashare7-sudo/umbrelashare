import axios from "axios";

const API = import.meta.env.VITE_BACKEND_URL;

// STUDENT — Borrow umbrella
export const borrowUmbrella = async (payload: {
  umbrellaId: string;
  pickupLocation: string;
  code: string;
}) => {
  const token = localStorage.getItem("auth_token");

  const res = await axios.post(`${API}/api/transactions/borrow`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

// STUDENT — Return umbrella
export const returnUmbrella = async (payload: {
  umbrellaId: string;
  returnLocation: string;
  code: string;
}) => {
  const token = localStorage.getItem("auth_token");

  const res = await axios.post(`${API}/api/transactions/return`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

// ADMIN — Recent logs
export const getAllLogs = async (token?: string) => {
  const auth = token || localStorage.getItem("auth_token");

  const res = await axios.get(`${API}/api/transactions/recent`, {
    headers: { Authorization: `Bearer ${auth}` },
  });

  return res.data; // <-- FIX
};

// ADMIN — Active verification codes
export const getActiveCodes = async (token?: string) => {
  const auth = token || localStorage.getItem("auth_token");

  const res = await axios.get(`${API}/api/transactions/active-codes`, {
    headers: { Authorization: `Bearer ${auth}` },
  });

  return res.data; // <-- FIX
};

