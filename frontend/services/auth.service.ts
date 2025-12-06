import axios from "axios";

const API = import.meta.env.VITE_BACKEND_URL;

// -----------------------------
// ADMIN LOGIN  ✔ FIXED
// -----------------------------
export async function loginAdmin(email: string, password: string) {
  const res = await axios.post(`${API}/api/auth/login`, {
    email,
    password,
  });
  return res.data;
}



// -----------------------------
// STUDENT LOGIN  ✔ FIXED
// -----------------------------
export async function loginStudent(email: string, password: string) {
  const res = await axios.post(`${API}/api/students/login`, {
    email,
    password,
  });

  return res.data;
}

// -----------------------------
// STUDENT REGISTER  ✔ FIXED
// -----------------------------
export async function registerStudent(
  name: string,
  email: string,
  password: string
) {
  const res = await axios.post(`${API}/api/students/register`, {
    name,
    email,
    password,
  });

  return res.data;
}

// -----------------------------
// GET CURRENT USER (ADMIN ONLY FOR NOW)
// -----------------------------
export async function getMe() {
  const token = localStorage.getItem("auth_token");
  if (!token) throw new Error("No auth token stored");

  const res = await axios.get(`${API}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}
