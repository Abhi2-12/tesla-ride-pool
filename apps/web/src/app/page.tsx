"use client";

import { useState } from "react";
import {
  Car,
  Users,
  MapPin,
  CheckCircle2,
  Zap,
  ArrowRight,
  ShieldAlert,
  Wallet,
  XCircle,
  PlusCircle,
  UserPlus,
  CarFront,
  LogOut,
  ShieldCheck,
} from "lucide-react";

const DHAKA_ZONES = [
  "Banani Road 11",
  "Banani",
  "Gulshan 1",
  "Gulshan 2",
  "Mohakhali",
  "Farmgate",
  "Dhanmondi",
  "Mirpur",
  "Uttara",
  "Bashundhara",
];

interface Passenger {
  id: string;
  name: string;
  email: string;
  origin: string;
  destination: string;
  status: "REQUESTED" | "MATCHED" | "DRIVER_ARRIVED" | "STARTED" | "COMPLETED" | "CANCELLED";
  seats: number;
  fareBDT: number;
  farePoysha: number;
}

interface CustomUser {
  id: string;
  name: string;
  email: string;
  role: "RIDER" | "DRIVER";
}

interface CustomVehicle {
  id: string;
  name: string;
  type: string;
  capacity: number;
  ownerName: string;
}

const INITIAL_USERS: CustomUser[] = [
  { id: "u_nusrat", name: "Nusrat", email: "nusrat@teslapool.bd", role: "RIDER" },
  { id: "u_rafiq", name: "Rafiq", email: "rafiq@teslapool.bd", role: "RIDER" },
  { id: "u_shirin", name: "Shirin", email: "shirin@teslapool.bd", role: "RIDER" },
  { id: "u_jashim", name: "Jashim", email: "jashim@teslapool.bd", role: "DRIVER" },
];

const INITIAL_VEHICLES: CustomVehicle[] = [
  {
    id: "v_bullet",
    name: "Bullet",
    type: "Tesla 3-Wheeler Electric",
    capacity: 3,
    ownerName: "Jashim",
  },
];

const INITIAL_PASSENGERS: Passenger[] = [
  {
    id: "req_nusrat_001",
    name: "Nusrat",
    email: "nusrat@teslapool.bd",
    origin: "Banani Road 11",
    destination: "Mohakhali",
    status: "MATCHED",
    seats: 1,
    fareBDT: 112,
    farePoysha: 11200,
  },
  {
    id: "req_rafiq_001",
    name: "Rafiq",
    email: "rafiq@teslapool.bd",
    origin: "Banani Road 11",
    destination: "Gulshan 1",
    status: "MATCHED",
    seats: 1,
    fareBDT: 96,
    farePoysha: 9600,
  },
  {
    id: "req_shirin_001",
    name: "Shirin",
    email: "shirin@teslapool.bd",
    origin: "Banani Road 11",
    destination: "Farmgate",
    status: "REQUESTED",
    seats: 1,
    fareBDT: 140,
    farePoysha: 14000,
  },
];

export default function DhakaTeslaPoolApp() {
  const [usersList, setUsersList] = useState<CustomUser[]>(INITIAL_USERS);
  const [vehiclesList, setVehiclesList] = useState<CustomVehicle[]>(INITIAL_VEHICLES);
  
  // Currently authenticated user session (Default: Nusrat)
  const [activeUser, setActiveUser] = useState<CustomUser>(INITIAL_USERS[0]);
  const [activeTab, setActiveTab] = useState<"passenger" | "driver" | "admin" | "pool">("passenger");
  
  const [passengers, setPassengers] = useState<Passenger[]>(INITIAL_PASSENGERS);
  const [poolState, setPoolState] = useState<"MATCHED" | "DRIVER_ARRIVED" | "STARTED" | "COMPLETED">("MATCHED");
  const [isDriverOnline, setIsDriverOnline] = useState<boolean>(true);
  const [capacityNotice, setCapacityNotice] = useState<string | null>(null);

  // Ride booking states
  const [pickup, setPickup] = useState("Banani Road 11");
  const [destination, setDestination] = useState("Mohakhali");
  const [seats, setSeats] = useState(1);

  // New User Form State
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"RIDER" | "DRIVER">("RIDER");

  // New Vehicle Form State
  const [newVehicleName, setNewVehicleName] = useState("");
  const [newVehicleCapacity, setNewVehicleCapacity] = useState(3);
  const [newVehicleDriver, setNewVehicleDriver] = useState("Jashim");

  const selectedVehicle = vehiclesList[0] || INITIAL_VEHICLES[0];
  const capacity = selectedVehicle.capacity;

  const activePassengers = passengers.filter(
    (p) => p.status === "MATCHED" || p.status === "DRIVER_ARRIVED" || p.status === "STARTED"
  );
  const occupiedSeats = activePassengers.reduce((sum, p) => sum + p.seats, 0);

  // Switch authenticated session persona (Nusrat, Rafiq, Shirin, or Jashim)
  const switchUserSession = (user: CustomUser) => {
    setActiveUser(user);
    if (user.role === "DRIVER") {
      setActiveTab("driver");
    } else {
      setActiveTab("passenger");
    }
    setCapacityNotice(`Authenticated session changed: Signed in as ${user.name} (${user.role})`);
    setTimeout(() => setCapacityNotice(null), 3000);
  };

  const calculateFarePreview = (originStr: string, destStr: string, seatCount: number) => {
    const base = 80;
    const distance = destStr === "Gulshan 1" ? 40 : destStr === "Mohakhali" ? 60 : 80;
    const isPooled = occupiedSeats > 0;
    const discount = isPooled ? Math.round((base + distance) * 0.2) : 0;
    const totalBDT = (base + distance - discount) * seatCount;
    return {
      totalBDT,
      poysha: totalBDT * 100,
      base,
      distance,
      discount,
    };
  };

  const currentFarePreview = calculateFarePreview(pickup, destination, seats);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    const newUser: CustomUser = {
      id: `u_${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
    };
    setUsersList((prev) => [...prev, newUser]);
    setNewUserName("");
    setNewUserEmail("");
    setCapacityNotice(`Created ${newUserRole} account for "${newUser.name}"!`);
    setTimeout(() => setCapacityNotice(null), 4000);
  };

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicleName.trim()) return;
    const newVeh: CustomVehicle = {
      id: `v_${Date.now()}`,
      name: newVehicleName.trim(),
      type: "Tesla Electric 3-Wheeler",
      capacity: newVehicleCapacity,
      ownerName: newVehicleDriver,
    };
    setVehiclesList((prev) => [...prev, newVeh]);
    setNewVehicleName("");
    setCapacityNotice(`Registered vehicle "${newVeh.name}" (${newVeh.capacity} Seats)!`);
    setTimeout(() => setCapacityNotice(null), 4000);
  };

  const handleRequestRide = (e: React.FormEvent) => {
    e.preventDefault();
    if (occupiedSeats + seats > capacity) {
      setCapacityNotice(
        `[CAPACITY ENFORCED] ${selectedVehicle.name}'s ${capacity}-seat capacity exceeded! Current occupied: ${occupiedSeats}/${capacity}. Cannot add ${seats} seat(s).`
      );
      setTimeout(() => setCapacityNotice(null), 5000);
      return;
    }

    const fare = calculateFarePreview(pickup, destination, seats);

    const newReq: Passenger = {
      id: `req_${Date.now()}`,
      name: activeUser.name,
      email: activeUser.email,
      origin: pickup,
      destination,
      status: "MATCHED",
      seats,
      fareBDT: fare.totalBDT,
      farePoysha: fare.poysha,
    };

    setPassengers((prev) => [...prev.filter((p) => p.name !== activeUser.name), newReq]);
    setCapacityNotice(`Ride matched into ${selectedVehicle.name}! Individual Fare: ৳${fare.totalBDT}`);
    setTimeout(() => setCapacityNotice(null), 4000);
  };

  const advanceTripState = (nextState: "DRIVER_ARRIVED" | "STARTED" | "COMPLETED") => {
    setPoolState(nextState);
    setPassengers((prev) =>
      prev.map((p) =>
        p.status !== "CANCELLED" && p.status !== "REQUESTED"
          ? { ...p, status: nextState }
          : p
      )
    );
  };

  const handleCancel = (passengerId: string) => {
    setPassengers((prev) =>
      prev.map((p) => (p.id === passengerId ? { ...p, status: "CANCELLED" } : p))
    );
  };

  // Restrict passenger view so each passenger sees ONLY their own ride and fare
  const currentPassengerRide = passengers.find(
    (p) => p.name.toLowerCase() === activeUser.name.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header & Authentication Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center font-bold text-white shadow-lg">
            <Zap className="w-6 h-6 fill-current text-yellow-300" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-white flex items-center gap-2">
              Dhaka Tesla Pool
              <span className="text-xs bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded-full">
                {selectedVehicle.name} ({capacity} Seats)
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Share a seat. Split the fare. Survive Dhaka traffic.
            </p>
          </div>
        </div>

        {/* Dynamic Navigation Tabs based on Authenticated Role */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700 flex-wrap gap-1">
            {activeUser.role === "RIDER" && (
              <button
                onClick={() => setActiveTab("passenger")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === "passenger"
                    ? "bg-red-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Passenger Portal ({activeUser.name})
              </button>
            )}

            {activeUser.role === "DRIVER" && (
              <button
                onClick={() => setActiveTab("driver")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === "driver"
                    ? "bg-amber-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Car className="w-3.5 h-3.5" /> Driver Console ({activeUser.name})
              </button>
            )}

            <button
              onClick={() => setActiveTab("admin")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "admin"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" /> Register Account / Vehicle
            </button>

            {activeUser.role === "DRIVER" && (
              <button
                onClick={() => setActiveTab("pool")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === "pool"
                    ? "bg-emerald-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Zap className="w-3.5 h-3.5" /> Pool Inspector
              </button>
            )}
          </div>

          {/* Authenticated Persona Switcher Dropdown */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Signed In:</span>
            <select
              value={activeUser.id}
              onChange={(e) => {
                const target = usersList.find((u) => u.id === e.target.value);
                if (target) switchUserSession(target);
              }}
              className="bg-slate-950 text-white font-bold px-2 py-1 rounded border border-slate-700 focus:outline-none focus:border-red-500 text-xs"
            >
              {usersList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {capacityNotice && (
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 text-sm animate-fade-in ${
              capacityNotice.includes("ENFORCED")
                ? "bg-red-950/80 border-red-700 text-red-200"
                : "bg-emerald-950/80 border-emerald-700 text-emerald-200"
            }`}
          >
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <div className="font-semibold">{capacityNotice}</div>
          </div>
        )}

        {/* PASSENGER PORTAL (FOR RIDER ROLE ONLY) */}
        {activeUser.role === "RIDER" && activeTab === "passenger" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Passenger Ride Request Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-red-500" /> Passenger Session: {activeUser.name}
                  </h3>
                  <p className="text-xs text-slate-400">{activeUser.email}</p>
                </div>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  AUTHENTICATED RIDER
                </span>
              </div>

              <form onSubmit={handleRequestRide} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Pickup Location</label>
                  <select
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white"
                  >
                    {DHAKA_ZONES.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Destination Zone</label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white"
                  >
                    {DHAKA_ZONES.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Seats Requested</label>
                  <input
                    type="number"
                    min="1"
                    max="3"
                    value={seats}
                    onChange={(e) => setSeats(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white"
                  />
                </div>

                {/* Individual Fare Breakdown */}
                <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between font-medium text-slate-300">
                    <span>Base Fare:</span>
                    <span>৳{currentFarePreview.base}</span>
                  </div>
                  <div className="flex justify-between font-medium text-slate-300">
                    <span>Distance Charge ({destination}):</span>
                    <span>৳{currentFarePreview.distance}</span>
                  </div>
                  <div className="flex justify-between font-medium text-emerald-400">
                    <span>Dhaka Pool Discount (20%):</span>
                    <span>-৳{currentFarePreview.discount}</span>
                  </div>
                  <div className="border-t border-slate-800 pt-1 flex justify-between font-bold text-sm text-yellow-400">
                    <span>Your Individual Fare:</span>
                    <span>
                      ৳{currentFarePreview.totalBDT}{" "}
                      <span className="text-[10px] text-slate-500 font-normal">
                        ({currentFarePreview.poysha} Poysha)
                      </span>
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 hover:bg-red-500 font-bold rounded-xl text-white shadow-lg flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-current text-yellow-300" />
                  Request & Match Into Pool
                </button>
              </form>
            </div>

            {/* Individual Ride Tracker (Each Passenger Sees ONLY Their Own Fare & Status) */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    Private Status & Fare for {activeUser.name}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {currentPassengerRide
                      ? `Your Fare: ৳${currentPassengerRide.fareBDT} (${currentPassengerRide.farePoysha} Poysha)`
                      : "No active trip requested yet."}
                  </p>
                </div>
                {currentPassengerRide && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      currentPassengerRide.status === "COMPLETED"
                        ? "bg-emerald-950 border-emerald-700 text-emerald-400"
                        : currentPassengerRide.status === "CANCELLED"
                        ? "bg-slate-800 border-slate-700 text-slate-400"
                        : "bg-amber-950 border-amber-700 text-amber-400"
                    }`}
                  >
                    {currentPassengerRide.status}
                  </span>
                )}
              </div>

              {currentPassengerRide ? (
                <>
                  <div className="grid grid-cols-5 gap-2 text-center text-xs">
                    {[
                      { key: "REQUESTED", label: "1. Requested" },
                      { key: "MATCHED", label: "2. Matched" },
                      { key: "DRIVER_ARRIVED", label: "3. Driver Arrived" },
                      { key: "STARTED", label: "4. In Progress" },
                      { key: "COMPLETED", label: "5. Completed" },
                    ].map((step, idx) => {
                      const isCurrent = currentPassengerRide.status === step.key;
                      const isPast =
                        ["REQUESTED", "MATCHED", "DRIVER_ARRIVED", "STARTED", "COMPLETED"].indexOf(
                          currentPassengerRide.status
                        ) >= idx;

                      return (
                        <div
                          key={step.key}
                          className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                            isCurrent
                              ? "bg-red-950 border-red-600 text-white font-bold ring-2 ring-red-500/50"
                              : isPast
                              ? "bg-slate-800/80 border-slate-700 text-slate-300"
                              : "bg-slate-950/40 border-slate-850 text-slate-600"
                          }`}
                        >
                          <CheckCircle2 className={`w-4 h-4 ${isPast ? "text-emerald-400" : "text-slate-600"}`} />
                          <span className="text-[11px] leading-tight">{step.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-amber-400" />
                        <span className="font-semibold text-slate-200">
                          Assigned Tesla: Jashim's "{selectedVehicle.name}"
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">Seats Booked: {currentPassengerRide.seats}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-400" />
                        <span>
                          {currentPassengerRide.origin} → {currentPassengerRide.destination}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Wallet className="w-4 h-4 text-emerald-400" />
                        <span>Your Individual Fare: ৳{currentPassengerRide.fareBDT}</span>
                      </div>
                    </div>

                    {currentPassengerRide.status !== "COMPLETED" && currentPassengerRide.status !== "CANCELLED" && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => handleCancel(currentPassengerRide.id)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-red-900/50 text-slate-300 hover:text-red-300 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Cancel My Ride
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">
                  Use the form on the left to submit a ride request as {activeUser.name}.
                </div>
              )}
            </div>
          </div>
        )}

        {/* DRIVER CONSOLE (FOR DRIVER ROLE ONLY) */}
        {activeUser.role === "DRIVER" && activeTab === "driver" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">Driver Console ({activeUser.name})</h2>
                  <p className="text-xs text-slate-400">{selectedVehicle.name} ({selectedVehicle.type})</p>
                </div>
                <button
                  onClick={() => setIsDriverOnline(!isDriverOnline)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    isDriverOnline
                      ? "bg-emerald-950 border-emerald-600 text-emerald-300"
                      : "bg-slate-800 border-slate-700 text-slate-500"
                  }`}
                >
                  {isDriverOnline ? "● ONLINE" : "○ OFFLINE"}
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-400">{selectedVehicle.name} Seat Capacity:</span>
                  <span className="text-amber-400 font-bold">
                    {occupiedSeats} / {capacity} Seats Occupied
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      occupiedSeats === capacity ? "bg-red-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${(occupiedSeats / capacity) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  {capacity - occupiedSeats} seat(s) remaining for new pool matches.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Advance Shared Pool Lifecycle
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => advanceTripState("DRIVER_ARRIVED")}
                    disabled={poolState === "DRIVER_ARRIVED" || poolState === "STARTED" || poolState === "COMPLETED"}
                    className="p-3 bg-amber-900/40 hover:bg-amber-800/60 border border-amber-700 text-amber-200 rounded-xl text-xs font-bold text-left flex items-center justify-between disabled:opacity-40"
                  >
                    <span>1. Mark Arrived at Pickup</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => advanceTripState("STARTED")}
                    disabled={poolState === "STARTED" || poolState === "COMPLETED"}
                    className="p-3 bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700 text-blue-200 rounded-xl text-xs font-bold text-left flex items-center justify-between disabled:opacity-40"
                  >
                    <span>2. Start Shared Trip</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => advanceTripState("COMPLETED")}
                    disabled={poolState === "COMPLETED"}
                    className="p-3 bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-700 text-emerald-200 rounded-xl text-xs font-bold text-left flex items-center justify-between disabled:opacity-40"
                  >
                    <span>3. Complete Trip & Collect Fares</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" /> Assigned Passenger Manifest
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Passenger</th>
                      <th className="p-3">Route</th>
                      <th className="p-3">Seats</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Individual Fare</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {passengers.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-white">{p.name}</td>
                        <td className="p-3">
                          {p.origin} → {p.destination}
                        </td>
                        <td className="p-3">{p.seats}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.status === "MATCHED"
                                ? "bg-amber-950 text-amber-400"
                                : p.status === "COMPLETED"
                                ? "bg-emerald-950 text-emerald-400"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-yellow-400">
                          ৳{p.fareBDT} ({p.farePoysha} Poysha)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ACCOUNT & VEHICLE REGISTRATION FORM */}
        {activeTab === "admin" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-400" /> Register New Account
              </h2>
              <form onSubmit={handleCreateUser} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Tanvir"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="tanvir@teslapool.bd"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Account Type</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as "RIDER" | "DRIVER")}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="RIDER">Passenger (RIDER)</option>
                    <option value="DRIVER">Driver (DRIVER)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-lg text-xs text-white"
                >
                  Create User
                </button>
              </form>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <CarFront className="w-4 h-4 text-amber-400" /> Register Vehicle & Capacity
              </h2>
              <form onSubmit={handleCreateVehicle} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Vehicle Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Bullet"
                    value={newVehicleName}
                    onChange={(e) => setNewVehicleName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Assigned Driver</label>
                  <select
                    value={newVehicleDriver}
                    onChange={(e) => setNewVehicleDriver(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    {usersList
                      .filter((u) => u.role === "DRIVER")
                      .map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name} ({d.email})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={newVehicleCapacity}
                    onChange={(e) => setNewVehicleCapacity(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-amber-600 hover:bg-amber-500 font-bold rounded-lg text-xs text-white"
                >
                  Register Vehicle
                </button>
              </form>
            </div>
          </div>
        )}

        {/* POOL INSPECTOR TAB */}
        {activeUser.role === "DRIVER" && activeTab === "pool" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-white">Live Pool State & Capacity Inspector</h2>
                <p className="text-xs text-slate-400">
                  Banani Road 11 → Mohakhali / Gulshan 1 Corridor
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Total Pool Revenue:</span>
                <span className="text-lg font-bold text-emerald-400">
                  ৳{activePassengers.reduce((sum, p) => sum + p.fareBDT, 0)} BDT
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400">Vehicle</span>
                <div className="text-base font-bold text-white mt-1">{selectedVehicle.name}</div>
                <div className="text-xs text-slate-500">{selectedVehicle.type} (Capacity {capacity})</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400">Occupied Seats</span>
                <div className="text-base font-bold text-amber-400 mt-1">
                  {occupiedSeats} / {capacity} Seats
                </div>
                <div className="text-xs text-emerald-400 font-semibold">
                  {capacity - occupiedSeats} seat(s) available
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400">Dhaka Matching Rule</span>
                <div className="text-base font-bold text-white mt-1">Pickup Zone Compatible</div>
                <div className="text-xs text-slate-400">Banani Corridor Shared Route</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 py-4 px-6 text-center text-xs text-slate-500">
        Dhaka Tesla Pool MVP — Built with Next.js, Fastify, PostgreSQL & Prisma
      </footer>
    </div>
  );
}
