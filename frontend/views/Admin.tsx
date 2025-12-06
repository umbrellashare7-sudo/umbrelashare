import React, { useEffect, useState } from "react";
import { Transaction, Umbrella, LocationType } from "../types";

import {
  getInventory,
  addUmbrella as apiAddUmbrella,
  generateCode, // ← ADD THIS
} from "../services/inventory.service";

import { getAllLogs } from "../services/transactions.service";



import {
  BarChart,
  Activity,
  AlertTriangle,
  Sparkles,
  LogOut,
  Umbrella as UmbrellaIcon,
  Plus,
  X,
  MapPin,
  ChevronDown,
  CheckCircle,
} from "lucide-react";

interface AdminProps {
  onLogout: () => void;
}

const Admin: React.FC<AdminProps> = ({ onLogout }) => {
  const [logs, setLogs] = useState<Transaction[]>([]);
  const [umbrellas, setUmbrellas] = useState<Umbrella[]>([]);
  const [insight, setInsight] = useState<string>("Generating AI analysis...");

  // Add Umbrella Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newId, setNewId] = useState("");
  const [newCondition, setNewCondition] = useState("New");
  const [newLocation, setNewLocation] = useState<LocationType>("Main Gate");
  const LOCATIONS: LocationType[] = [
    "Main Gate",
    "Library",
    "Canteen",
    "Science Block",
  ];
  const CONDITIONS = ["New", "Good", "Fair", "Poor"];


  // ------------------------
  // LOAD DATA FROM BACKEND
  // ------------------------
  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      try {
        // ---------- INVENTORY ----------
        const inv = await getInventory(token);
        const normalized = inv.map((u: any) => ({
          id: u.umbrellaId,
          condition: u.condition,
          status: u.isAvailable ? "available" : "rented",
          location: u.currentLocation,
          borrowCode: u.activeBorrowCode || null,
          returnCode: u.activeReturnCode || null,
        }));

        setUmbrellas(normalized);

        // ---------- LOGS ----------
        const allLogs = await getAllLogs(token);
        setLogs(allLogs);

        // ---------- INSIGHTS ----------
        setInsight("AI insights unavailable (module not installed).");

      } catch (err) {
        console.error("ADMIN LOAD FAILED:", err);
      }
    };

    loadData();
  }, []);


  const handleGenerateCode = async (
    umbrellaId: string,
    type: "borrow" | "return"
  ) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const result = await generateCode(umbrellaId, type, token);

      alert(`${type.toUpperCase()} CODE: ${result.code}`);

      // Refresh inventory to show new code
      const inv = await getInventory(token);
      const normalized = inv.map((u: any) => ({
        id: u.umbrellaId,
        condition: u.condition,
        status: u.isAvailable ? "available" : "rented",
        location: u.currentLocation,
        borrowCode: u.activeBorrowCode || null,
        returnCode: u.activeReturnCode || null,
      }));
      setUmbrellas(normalized);
    } catch (err: any) {
      alert(err.message || "Failed to generate code");
    }
  };

  

  

  // ------------------------
  // ADD UMBRELLA (BACKEND)
  // ------------------------
  const handleAddUmbrella = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      await apiAddUmbrella(
        {
          umbrellaId: newId,
          condition: newCondition,
          initialLocation: newLocation,
        },
        token
      );

      


      // refresh inventory
      const inv = await getInventory(token);
      const normalized = inv.map((u: any) => ({
        id: u.umbrellaId,
        condition: u.condition,
        status: u.isAvailable ? "available" : "rented",
        location: u.currentLocation,
      }));
      setUmbrellas(normalized);

      // reset modal
      setShowAddModal(false);
      setNewId("");
      setNewCondition("New");
      setNewLocation("Main Gate");

      alert("Umbrella added successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to add umbrella");
    }
  };

  // ------------------------
  // STATS
  // ------------------------
  const totalStock = umbrellas.length;
  const rentedCount = umbrellas.filter((u) => u.status === "rented").length;
  const maintenanceCount = umbrellas.filter(
    (u) => u.status === "maintenance"
  ).length;
  const activeRate = Math.round((rentedCount / totalStock) * 100) || 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6 relative">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Console</h1>
          <p className="text-slate-500">System Overview & Management</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center space-x-2 text-slate-600 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-sm font-medium">
              Total Stock
            </span>
            <UmbrellaIcon size={20} className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{totalStock}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-sm font-medium">
              Currently Rented
            </span>
            <Activity size={20} className="text-green-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{rentedCount}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-sm font-medium">
              Utilization
            </span>
            <BarChart size={20} className="text-indigo-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{activeRate}%</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-sm font-medium">
              Maintenance
            </span>
            <AlertTriangle size={20} className="text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-slate-800">
            {maintenanceCount}
          </p>
        </div>
      </div>

      {/* AI Insight */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-6 text-white mb-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles size={20} className="text-yellow-300" />
            <h3 className="font-bold text-lg">AI System Insight</h3>
          </div>
          <p className="text-indigo-100 leading-relaxed italic">"{insight}"</p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/2 translate-x-1/4">
          <Sparkles size={200} />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-slate-800 text-lg">
              Inventory Management
            </h2>
            <p className="text-slate-500 text-sm">
              Manage stock and add new umbrellas
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-sm"
          >
            <Plus size={18} />
            <span>Add Umbrella</span>
          </button>
        </div>

        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 sticky top-0">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Condition</th>
                <th className="px-6 py-4">Borrow Code</th>
                <th className="px-6 py-4">Return Code</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {(umbrellas ?? []).map((umb) => (
                <tr
                  key={umb.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 font-mono font-medium text-slate-900">
                    {umb.id}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        umb.status === "available"
                          ? "bg-green-100 text-green-800"
                          : umb.status === "rented"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {umb.status === "available" && <CheckCircle size={12} />}
                      <span>{umb.status.toUpperCase()}</span>
                    </span>
                  </td>

                  <td className="px-6 py-4 flex items-center">
                    <MapPin size={14} className="mr-1 text-slate-400" />
                    {umb.location}
                  </td>

                  <td className="px-6 py-4">{umb.condition}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleGenerateCode(umb.id, "borrow")}
                      className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                    >
                      Generate Borrow Code
                    </button>

                    {umb.borrowCode && (
                      <p className="text-xs font-mono text-blue-800 mt-1">
                        Code: {umb.borrowCode}
                      </p>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleGenerateCode(umb.id, "return")}
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-xs"
                    >
                      Generate Return Code
                    </button>

                    {umb.returnCode && (
                      <p className="text-xs font-mono text-indigo-800 mt-1">
                        Code: {umb.returnCode}
                      </p>
                    )}
                  </td>
                </tr>
              ))}

              {umbrellas.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    No umbrellas in inventory.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Logs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-100">
          <h2 className="font-bold text-slate-800">Recent Transactions</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Umbrella ID</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Location</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {(logs ?? []).map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-xs">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {log.userName}
                  </td>
                  <td className="px-6 py-4">{log.umbrellaId}</td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.action === "borrow"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {log.action === "borrow" ? "Borrowed" : "Returned"}
                    </span>
                  </td>

                  <td className="px-6 py-4">{log.location}</td>
                  {/* BORROW CODE BUTTON */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Umbrella Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">
                Add New Umbrella
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddUmbrella} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Umbrella ID / Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UMB-099"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                />
              </div>

              {/* Initial Location - modern dropdown */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Initial Location
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-3 text-slate-400 pointer-events-none"
                    size={18}
                  />
                  <ChevronDown
                    className="absolute right-3 top-3.5 text-slate-400 pointer-events-none"
                    size={16}
                  />
                  <select
                    required
                    value={newLocation}
                    onChange={(e) =>
                      setNewLocation(e.target.value as LocationType)
                    }
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <option value="" disabled>
                      Select location
                    </option>
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Condition - modern dropdown */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Condition
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400 pointer-events-none font-mono text-xs">
                    ●
                  </span>
                  <ChevronDown
                    className="absolute right-3 top-3.5 text-slate-400 pointer-events-none"
                    size={16}
                  />
                  <select
                    required
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <option value="" disabled>
                      Select condition
                    </option>
                    {CONDITIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Add to Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
