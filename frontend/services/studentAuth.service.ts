import http from "./http";

export async function registerStudent(
  name: string,
  email: string,
  password: string
) {
  return http("/api/student/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function loginStudent(email: string, password: string) {
  return http("/api/student/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
