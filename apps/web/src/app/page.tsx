"use client";

import { useEffect, useState } from "react";
import {
  Car,
  Users,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  ArrowRight,
  ShieldAlert,
  Wallet,
  XCircle,
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
  const [activeTab, setActiveTab] = useState<"passenger" | "driver" | "pool">("passenger");
  const [selectedUser, setSelectedUser] = useState<string>("nusrat");
  const [passengers, setPassengers] = useState<Passenger[]>(INITIAL_PASSENGERS);
  const [poolState, setPoolState] = useState<"MATCHED" | "DRIVER_ARRIVED" | "STARTED" | "COMPLETED">("MATCHED");
  const [isDriverOnline, setIsDriverOnline] = useState<boolean>(true);
  const [capacityNotice, setCapacityNotice] = useState<string | null>(null);

  // Form states
  const [pickup, setPickup] = useState("Banani Road 11");
  const [destination, setDestination] = useState("Mohakhali");
  const [seats, setSeats] = useState(1);

  // Calculate total occupied seats in current pool (matched or active)
  const activePassengers = passengers.filter(
    (p) => p.status === "MATCHED" || p.status === "DRIVER_ARRIVED" || p.status === "STARTED"
  );
  const occupiedSeats = activePassengers.reduce((sum, p) => sum + p.seats, 0);
  const capacity = 3; // Jashim's Bullet 3-wheeler Tesla

  // Fare model helper: base 80 BDT + 40-60 distance - 20% pool discount
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

  // Handle passenger request submission
  const handleRequestRide = (e: React.FormEvent) => {
    e.preventDefault();
    if (occupiedSeats + seats > capacity) {
      setCapacityNotice(
        `[CONCURRENCY BLOCKED] Bullet's 3-seat capacity exceeded! Current occupied: ${occupiedSeats}/3. Cannot add ${seats} seat(s).`
      );
      setTimeout(() => setCapacityNotice(null), 5000);
      return;
    }

    const currentPassengerName =
      selectedUser === "nusrat" ? "Nusrat" : selectedUser === "rafiq" ? "Rafiq" : "Shirin";
    const fare = calculateFarePreview(pickup, destination, seats);

    const newReq: Passenger = {
      id: `req_${Date.now()}`,
      name: currentPassengerName,
      email: `${selectedUser}@teslapool.bd`,
      origin: pickup,
      destination,
      status: "MATCHED",
      seats,
      fareBDT: fare.totalBDT,
      farePoysha: fare.poysha,
    };

    setPassengers((prev) => [...prev.filter((p) => p.name !== currentPassengerName), newReq]);
    setCapacityNotice(`Ride matched successfully into Jashim's Bullet! Fare: ৳${fare.totalBDT}`);
    setTimeout(() => setCapacityNotice(null), 4000);
  };

  // Driver state transitions
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

  // Cancel ride
  const handleCancel = (passengerId: string) => {
    setPassengers((prev) =>
      prev.map((p) => (p.id === passengerId ? { ...p, status: "CANCELLED" } : p))
    );
  };

  const activePassenger = passengers.find(
    (p) => p.name.toLowerCase() === selectedUser.toLowerCase()
  ) || passengers[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center font-bold text-white shadow-lg">
            <Zap className="w-6 h-6 fill-current text-yellow-300" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-white flex items-center gap-2">
              Dhaka Tesla Pool
              <span className="text-xs bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded-full">
                Bullet 3-Wheeler MVP
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Share a seat. Split the fare. Survive Dhaka traffic.
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveTab("passenger")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "passenger"
                ? "bg-red-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Passenger Portal
          </button>
          <button
            onClick={() => setActiveTab("driver")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "driver"
                ? "bg-amber-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Car className="w-3.5 h-3.5" /> Driver (Jashim)
          </button>
          <button
            onClick={() => setActiveTab("pool")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "pool"
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> Live Pool Manifest
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Banner Alert for Concurrency / System Notifications */}
        {capacityNotice && (
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 text-sm animate-fade-in ${
              capacityNotice.includes("BLOCKED")
                ? "bg-red-950/80 border-red-700 text-red-200"
                : "bg-emerald-950/80 border-emerald-700 text-emerald-200"
            }`}
          >
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <div className="font-semibold">{capacityNotice}</div>
          </div>
        )}

        {/* PASSENGER VIEW */}
        {activeTab === "passenger" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Story Cast Selector & Request Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  1. Select Passenger Persona
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["nusrat", "rafiq", "shirin"].map((userKey) => (
                    <button
                      key={userKey}
                      onClick={() => {
                        setSelectedUser(userKey);
                        if (userKey === "rafiq") {
                          setDestination("Gulshan 1");
                        } else if (userKey === "shirin") {
                          setDestination("Farmgate");
                        } else {
                          setDestination("Mohakhali");
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        selectedUser === userKey
                          ? "bg-red-950 border-red-600 text-white font-bold"
                          : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <div className="text-sm capitalize">{userKey}</div>
                      <div className="text-[10px] text-slate-400">
                        {userKey === "nusrat"
                          ? "Banani → Mohakhali"
                          : userKey === "rafiq"
                          ? "Banani → Gulshan 1"
                          : "Banani → Farmgate"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ride Request Form */}
              <form onSubmit={handleRequestRide} className="space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" /> Book Ride / Request Pool
                </h3>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Pickup Location</label>
                  <select
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-red-500"
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-red-500"
                  >
                    {DHAKA_ZONES.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Seats Needed</label>
                  <input
                    type="number"
                    min="1"
                    max="3"
                    value={seats}
                    onChange={(e) => setSeats(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* Fare Model Calculation Card */}
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
                    <span>Estimated Fare:</span>
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
                  className="w-full py-3 bg-red-600 hover:bg-red-500 font-bold rounded-xl text-white shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-current text-yellow-300" />
                  Request Pool Ride
                </button>
              </form>
            </div>

            {/* Active Ride Status Tracker */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    Active Trip for {activePassenger?.name || selectedUser}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Individual Fare: ৳{activePassenger?.fareBDT || 112} ({activePassenger?.farePoysha || 11200} Poysha)
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    activePassenger?.status === "COMPLETED"
                      ? "bg-emerald-950 border-emerald-700 text-emerald-400"
                      : activePassenger?.status === "CANCELLED"
                      ? "bg-slate-800 border-slate-700 text-slate-400"
                      : "bg-amber-950 border-amber-700 text-amber-400"
                  }`}
                >
                  {activePassenger?.status || "MATCHED"}
                </span>
              </div>

              {/* Ride Lifecycle Stepper */}
              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                {[
                  { key: "REQUESTED", label: "1. Requested" },
                  { key: "MATCHED", label: "2. Matched" },
                  { key: "DRIVER_ARRIVED", label: "3. Driver Arrived" },
                  { key: "STARTED", label: "4. In Progress" },
                  { key: "COMPLETED", label: "5. Completed" },
                ].map((step, idx) => {
                  const isCurrent = activePassenger?.status === step.key;
                  const isPast =
                    ["REQUESTED", "MATCHED", "DRIVER_ARRIVED", "STARTED", "COMPLETED"].indexOf(
                      activePassenger?.status || "MATCHED"
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
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          isPast ? "text-emerald-400" : "text-slate-600"
                        }`}
                      />
                      <span className="text-[11px] leading-tight">{step.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Ride Details Card */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-slate-200">Vehicle: Jashim's "Bullet" (3-Wheeler Tesla)</span>
                  </div>
                  <span className="text-xs text-slate-400">License: DHAKA-TA-9912</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-400" />
                    <span>
                      {activePassenger?.origin || "Banani Road 11"} → {activePassenger?.destination || "Mohakhali"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    <span>TeslaPay / Cash: ৳{activePassenger?.fareBDT}</span>
                  </div>
                </div>

                {activePassenger?.status !== "COMPLETED" && activePassenger?.status !== "CANCELLED" && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => activePassenger && handleCancel(activePassenger.id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-red-900/50 text-slate-300 hover:text-red-300 text-xs font-semibold rounded-lg border border-slate-700 transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancel Ride
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DRIVER VIEW (Jashim - Bullet) */}
        {activeTab === "driver" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">Driver Console (Jashim)</h2>
                  <p className="text-xs text-slate-400">Tesla 3-Wheeler "Bullet"</p>
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

              {/* Vehicle Capacity Meter */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-400">Bullet Seat Capacity:</span>
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

              {/* Trip Lifecycle Controls for Jashim */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Advance Pool Trip Lifecycle
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => advanceTripState("DRIVER_ARRIVED")}
                    disabled={poolState === "DRIVER_ARRIVED" || poolState === "STARTED" || poolState === "COMPLETED"}
                    className="p-3 bg-amber-900/40 hover:bg-amber-800/60 border border-amber-700 text-amber-200 rounded-xl text-xs font-bold text-left flex items-center justify-between disabled:opacity-40"
                  >
                    <span>1. Mark Arrived at Banani Road 11</span>
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

            {/* Passengers & Pool Manifest Table */}
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

        {/* LIVE POOL MANIFEST VIEW */}
        {activeTab === "pool" && (
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
                <div className="text-base font-bold text-white mt-1">Jashim's Bullet</div>
                <div className="text-xs text-slate-500">Tesla 3-Wheeler (Capacity 3)</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400">Occupied Seats</span>
                <div className="text-base font-bold text-amber-400 mt-1">
                  {occupiedSeats} / 3 Seats
                </div>
                <div className="text-xs text-emerald-400 font-semibold">
                  {3 - occupiedSeats} seat available
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
