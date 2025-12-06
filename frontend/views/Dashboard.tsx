import React, { useState, useEffect } from 'react';
import { User, Umbrella, LocationType } from '../types';
import { getPublicInventory } from "../services/inventory.service";
import {
  borrowUmbrella,
  returnUmbrella,
} from "../services/transactions.service";

import UmbrellaCard from '../components/UmbrellaCard';
import { Filter, LogOut, RefreshCcw, Umbrella as UmbrellaIcon, Lock, X, Hash, MapPin, ChevronDown } from 'lucide-react';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onUserUpdate: () => void;
}

const LOCATIONS: LocationType[] = ['Main Gate', 'Library', 'Canteen', 'Science Block'];

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onUserUpdate }) => {
  const [umbrellas, setUmbrellas] = useState<Umbrella[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationType>('Main Gate');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available'>('all');
  const [refresh, setRefresh] = useState(0);

  // Modal State
  const [activeModal, setActiveModal] = useState<{ type: 'borrow' | 'return', umbrellaId?: string } | null>(null);
  const [returnLocation, setReturnLocation] = useState<LocationType>('Main Gate');
  const [securityCode, setSecurityCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) return;

        const data = await getPublicInventory(token);


        // map backend → UI Umbrella type
        const normalized = data.map((u: any) => ({
          id: u.umbrellaId,
          condition: u.condition,
          status: u.isAvailable ? "available" : "unavailable",
          location: u.currentLocation,
        }));

        setUmbrellas(normalized);
      } catch (err) {
        console.error("Failed to load umbrellas:", err);
      }
    };

    load();
  }, [refresh]);

  const initiateBorrow = (umbrellaId: string) => {
    setActiveModal({ type: 'borrow', umbrellaId });
    setSecurityCode('');
    setError('');
  };

  const initiateReturn = () => {
    setReturnLocation(selectedLocation); // Default to current view
    setActiveModal({ type: 'return' });
    setSecurityCode('');
    setError('');
  };

  const handleConfirmAction = async (e: React.FormEvent) => {
    e.preventDefault();

    // Temporary validation until backend uses real codes
    if (securityCode !== "1234") {
      setError("Invalid code. (Hint: Use 1234 for demo)");
      return;
    }

    // ✅ BORROW
    if (activeModal?.type === "borrow" && activeModal.umbrellaId) {
      try {
        await borrowUmbrella({
          studentId: user.id,
          studentName: user.name,
          umbrellaId: activeModal.umbrellaId,
          pickupLocation: selectedLocation,
          code: securityCode,
        });

        // refresh dashboard
        setRefresh((p) => p + 1);
        onUserUpdate();
      } catch (err: any) {
        setError(err.message || "Borrow failed");
        return;
      }
    }

    // ✅ RETURN
    else if (activeModal?.type === "return") {
      try {
        await returnUmbrella({
          studentId: user.id,
          umbrellaId: user.borrowedUmbrellaId,
          returnLocation,
          code: securityCode,
        });



        setRefresh((p) => p + 1);
        onUserUpdate();
      } catch (err: any) {
        setError(err.message || "Return failed");
        return;
      }
    }

    // Close modal
    setActiveModal(null);
  };

  if (user.role !== "student") {
    return (
      <div className="p-6 text-red-600 font-bold">
        Admin cannot access the student dashboard.
      </div>
    );
  }


  // Filter Logic
  const filteredUmbrellas = umbrellas.filter(u => {
      const matchesLoc = u.location === selectedLocation;
      const matchesStatus = filterStatus === 'all' ? true : u.status === 'available';
      return matchesLoc && matchesStatus;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Rental Dashboard
          </h1>
          <p className="text-slate-500">Welcome back, {user.name}</p>
        </div>

        <div className="flex items-center space-x-4 bg-white p-2 rounded-lg shadow-sm border border-slate-200">
          <div className="text-right px-2">
            <p className="text-xs text-slate-400">Balance</p>
            <p className="font-bold text-green-600">
              ${(user.balance ?? 0).toFixed(2)}
            </p>
          </div>
          <div className="h-8 w-[1px] bg-slate-200"></div>
          <button
            onClick={onLogout}
            className="text-slate-400 hover:text-red-500 p-2"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Active Rental Status */}
      {user.borrowedUmbrellaId && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <div className="bg-indigo-600 text-white p-3 rounded-full">
              <UmbrellaIcon size={24} />
            </div>
            <div>
              <h3 className="font-bold text-indigo-900">Active Rental</h3>
              <p className="text-indigo-600 text-sm">
                You are currently renting{" "}
                <span className="font-mono font-bold">
                  {user.borrowedUmbrellaId}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={initiateReturn}
            className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center space-x-2"
          >
            <Lock size={16} />
            <span>Return Umbrella</span>
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Location Selector */}
        <div className="flex-1 overflow-x-auto pb-2 md:pb-0">
          <div className="flex space-x-2">
            {LOCATIONS.map((loc) => (
              <button
                key={loc}
                onClick={() => setSelectedLocation(loc)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedLocation === loc
                    ? "bg-slate-800 text-white shadow-md"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() =>
              setFilterStatus((prev) => (prev === "all" ? "available" : "all"))
            }
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium border ${
              filterStatus === "available"
                ? "bg-blue-50 border-blue-200 text-blue-600"
                : "bg-white border-slate-200 text-slate-600"
            }`}
          >
            <Filter size={16} />
            <span>Only Available</span>
          </button>
          <button
            onClick={() => setRefresh((p) => p + 1)}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50"
          >
            <RefreshCcw size={18} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredUmbrellas.map((umb) => (
          <UmbrellaCard
            key={umb.id}
            umbrella={umb}
            userLocation={selectedLocation}
            onBorrow={initiateBorrow}
            canBorrow={!user.borrowedUmbrellaId}
          />
        ))}
        {filteredUmbrellas.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400">
            <UmbrellaIcon size={48} className="mx-auto mb-3 opacity-20" />
            <p>No umbrellas found at this location matching your filters.</p>
          </div>
        )}
      </div>

      {/* Security Code Verification Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">
                {activeModal.type === "borrow"
                  ? "Confirm Rental"
                  : "Confirm Return"}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmAction} className="p-6">
              <div className="text-center mb-6">
                <div
                  className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
                    activeModal.type === "borrow"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-indigo-100 text-indigo-600"
                  }`}
                >
                  <Hash size={32} />
                </div>

                {activeModal.type === "return" ? (
                  <p className="text-slate-600 text-sm">
                    Please select the location where you are returning the
                    umbrella.
                  </p>
                ) : (
                  <p className="text-slate-600 text-sm">
                    Enter the code displayed on umbrella{" "}
                    <span className="font-bold">{activeModal.umbrellaId}</span>{" "}
                    to unlock it.
                  </p>
                )}
              </div>

              {activeModal.type === "return" && (
                <div className="mb-5 text-left">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Return Station
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
                      value={returnLocation}
                      onChange={(e) => setReturnLocation(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer hover:bg-white transition-colors"
                    >
                      {LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                  {activeModal.type === "return"
                    ? "Station Security Code"
                    : "Umbrella Security Code"}
                </label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="0000"
                  className="w-full text-center text-3xl tracking-[0.5em] font-mono font-bold py-3 border-b-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
                  value={securityCode}
                  onChange={(e) => {
                    setSecurityCode(e.target.value.replace(/[^0-9]/g, ""));
                    setError("");
                  }}
                  autoFocus
                />
                {error ? (
                  <p className="text-red-500 text-xs text-center mt-2 font-medium">
                    {error}
                  </p>
                ) : (
                  <p className="text-slate-400 text-xs text-center mt-2 italic">
                    {activeModal.type === "return"
                      ? "(Enter the code shown on the Station Screen: 1234)"
                      : "(Enter code 1234 for demo)"}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-lg text-white font-bold shadow-md hover:shadow-lg transition-all ${
                  activeModal.type === "borrow"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {activeModal.type === "borrow"
                  ? "Unlock & Borrow"
                  : "Confirm Return"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;