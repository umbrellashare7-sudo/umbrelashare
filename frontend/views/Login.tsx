import React, { useState } from "react";
import { User } from "../types";

import { loginAdmin } from "../services/auth.service";
import { loginStudent, registerStudent } from "../services/studentAuth.service";

import {
  UserCheck,
  Shield,
  UserPlus,
  ArrowRight,
  Lock,
  ArrowLeft,
} from "lucide-react";

interface LoginProps {
  onLogin: (user: User) => void;
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isSignUp) {
      handleRegister();
    } else {
      handleLogin();
    }
  };

  // ---------------------------
  // LOGIN HANDLER
  // ---------------------------
  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    // ---------------------------
    // ADMIN LOGIN
    // ---------------------------
    if (isAdmin) {
      try {
        const res = await loginAdmin(email, password);

        if (!res.admin || !res.token) {
          throw new Error("Invalid server response.");
        }

        const user: User = {
          id: res.admin.id,
          name: res.admin.name,
          email: res.admin.email,
          role: "admin",
          balance: 0,
          borrowedUmbrellaId: null,
        };

        localStorage.setItem("auth_token", res.token);
        onLogin(user);
      } catch (err: any) {
        setError(err.response?.data?.message || "Invalid admin credentials.");
      }
      return;
    }

    // ---------------------------
    // STUDENT LOGIN
    // ---------------------------
    try {
      const res = await loginStudent(email, password);

      if (!res.student || !res.token) {
        throw new Error("Invalid server response.");
      }

      const user: User = {
        id: res.student.id,
        name: res.student.name,
        email: res.student.email,
        role: "student",
        balance: res.student.balance ?? 0,
        borrowedUmbrellaId: res.student.borrowedUmbrellaId ?? null,
      };

      localStorage.setItem("auth_token", res.token);
      onLogin(user);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password.");
    }
  };

  // ---------------------------
  // REGISTER HANDLER
  // ---------------------------
  const handleRegister = async () => {
    if (!fullName.trim() || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (isAdmin) {
      setError("Admin accounts cannot be created from this form.");
      return;
    }

    try {
      const res = await registerStudent(fullName, email, password);

      const newUser: User = {
        id: res.id,
        name: res.name,
        email: res.email,
        role: "student",
        balance: 0,
        borrowedUmbrellaId: null,
      };

      onLogin(newUser);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 relative">
      <button
        onClick={onBack}
        className="absolute top-6 left-6 text-slate-500 hover:text-slate-800 flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all"
      >
        <ArrowLeft size={18} />
        <span className="font-medium text-sm">Back to Home</span>
      </button>

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md transition-all">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-slate-500">
            {isSignUp
              ? "Join UmbrellaShare today"
              : "Sign in to access rentals"}
          </p>
        </div>

        {/* Role Toggle */}
        {!isSignUp && (
          <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                !isAdmin ? "bg-white shadow-sm text-blue-600" : "text-slate-500"
              }`}
              onClick={() => setIsAdmin(false)}
            >
              Student
            </button>

            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                isAdmin
                  ? "bg-white shadow-sm text-indigo-600"
                  : "text-slate-500"
              }`}
              onClick={() => setIsAdmin(true)}
            >
              Admin
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Jane Doe"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder={isAdmin ? "admin@uni.edu" : "student@uni.edu"}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock
                size={18}
                className="absolute right-3 top-3.5 text-slate-400"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center animate-pulse">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          <button
            type="submit"
            className={`w-full py-3 rounded-lg text-white font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 ${
              isAdmin
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSignUp ? (
              <>
                <UserPlus size={18} />
                <span>Sign Up</span>
              </>
            ) : (
              <>
                {isAdmin ? <Shield size={18} /> : <UserCheck size={18} />}
                <span>{isAdmin ? "Access Panel" : "Sign In"}</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          {isSignUp ? (
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <button
                onClick={() => {
                  setIsSignUp(false);
                  setError("");
                }}
                className="text-blue-600 font-semibold hover:underline"
              >
                Log in
              </button>
            </p>
          ) : (
            <>
              {!isAdmin && (
                <p className="text-sm text-slate-600">
                  New to UmbrellaShare?{" "}
                  <button
                    onClick={() => {
                      setIsSignUp(true);
                      setError("");
                    }}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Create an account
                  </button>
                </p>
              )}

              <div className="mt-4 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="font-semibold mb-2 text-slate-700">
                  Demo Credentials:
                </p>
                <div className="grid grid-cols-1 gap-1 text-left">
                  <div className="flex justify-between">
                    <span>
                      Student:{" "}
                      <span className="font-mono text-slate-800">
                        alice@uni.edu
                      </span>
                    </span>
                    <span className="font-mono text-slate-400">
                      pass: password
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      Admin:{" "}
                      <span className="font-mono text-slate-800">
                        admin@uni.edu
                      </span>
                    </span>
                    <span className="font-mono text-slate-400">
                      pass: admin
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
