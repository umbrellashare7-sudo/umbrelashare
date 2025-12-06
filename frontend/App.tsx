import React, { useState, useEffect } from "react";
import { User } from "./types";

import Home from "./views/Home";
import Dashboard from "./views/Dashboard";
import Login from "./views/Login";
import Admin from "./views/Admin";

import { Umbrella, User as UserIcon } from "lucide-react";

// REAL SERVICES (replace MockService)
import { getMe } from "./services/auth.service";

const App: React.FC = () => {
  const [view, setView] = useState<"home" | "dashboard" | "login" | "admin">(
    "home"
  );
  const [user, setUser] = useState<User | null>(null);

  // -----------------------------
  // LOAD USER FROM TOKEN
  // -----------------------------
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const me = await getMe(); // backend: /api/auth/me
      setUser(me);

      if (me.role === "admin") setView("admin");
      else setView("dashboard");
    } catch (err) {
      console.error("Failed to refresh user:", err);
      localStorage.removeItem("auth_token");
    }
  };

  // -----------------------------
  // LOGIN
  // -----------------------------
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);

    if (loggedInUser.role === "admin") setView("admin");
    else setView("dashboard");
  };

  // -----------------------------
  // LOGOUT
  // -----------------------------
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("auth_token");
    setView("home");
  };

  // -----------------------------
  // USER UPDATED (after borrow/return)
  // -----------------------------
  const handleUserUpdate = async () => {
    await loadUser();
  };

  // -----------------------------
  // NAVIGATION
  // -----------------------------
  const navigateTo = (target: "home" | "dashboard" | "login" | "admin") => {
    if ((target === "dashboard" || target === "admin") && !user)
      return setView("login");

    if (target === "admin" && user?.role !== "admin") {
      alert("Unauthorized");
      return;
    }

    setView(target);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* NAVBAR */}
      {view !== "login" && view !== "admin" && (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div
              onClick={() => setView("home")}
              className="flex items-center space-x-2 cursor-pointer text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Umbrella size={28} strokeWidth={2.5} />
              <span className="font-bold text-xl tracking-tight text-slate-800">
                UmbrellaShare
              </span>
            </div>

            <div className="flex items-center space-x-6">
              <button
                onClick={() => setView("home")}
                className={`text-sm font-medium transition-colors ${
                  view === "home"
                    ? "text-blue-600"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Home
              </button>

              <button
                onClick={() => navigateTo("dashboard")}
                className={`text-sm font-medium transition-colors ${
                  view === "dashboard"
                    ? "text-blue-600"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Rentals
              </button>

              {user ? (
                <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                    {user?.name?.charAt(0) ?? ""}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setView("login")}
                  className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-md flex items-center space-x-2"
                >
                  <UserIcon size={16} />
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-grow">
        {view === "home" && <Home onNavigate={navigateTo} />}

        {view === "dashboard" && user && (
          <Dashboard
            user={user}
            onLogout={handleLogout}
            onUserUpdate={handleUserUpdate}
          />
        )}

        {view === "login" && (
          <Login onLogin={handleLogin} onBack={() => setView("home")} />
        )}

        {view === "admin" && <Admin onLogout={handleLogout} />}
      </main>

      {/* FOOTER */}
      {view !== "login" && (
        <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} UmbrellaShare Campus System. Stay
              Dry.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
