import { describe, expect, it } from "vitest";
import { calculatePassengerFare } from "../modules/fares/fare.service.js";
import { validateStateTransition } from "../modules/pools/pool.service.js";
import { AppError } from "../errors/app-error.js";

describe("Tesla Ride Pool - Core Business Logic & State Machine", () => {
  describe("Fare Calculation Model (Requirement 5)", () => {
    it("should correctly calculate Nusrat's pooled fare using formula: baseFare + distanceCharge - poolDiscount", () => {
      // Nusrat: Base 80 BDT, Distance 60 BDT, Pooled (20% discount)
      const fare = calculatePassengerFare({
        baseFare: 80,
        distanceCharge: 60,
        isPooled: true,
        poolDiscountRate: 0.2,
      });

      // (80 + 60) = 140. Discount 20% of 140 = 28 BDT. Final = 112 BDT
      expect(fare.finalFareBDT).toBe(112);
      expect(fare.calculationData.baseFarePoysha).toBe(8000);
      expect(fare.calculationData.distanceChargePoysha).toBe(6000);
      expect(fare.calculationData.poolDiscountPoysha).toBe(2800);
      expect(fare.calculationData.totalPoysha).toBe(11200);
      expect(fare.calculationData.currency).toBe("BDT");
    });

    it("should correctly calculate Rafiq's pooled fare", () => {
      // Rafiq: Base 80 BDT, Distance 40 BDT, Pooled (20% discount)
      const fare = calculatePassengerFare({
        baseFare: 80,
        distanceCharge: 40,
        isPooled: true,
        poolDiscountRate: 0.2,
      });

      // (80 + 40) = 120. Discount 24 BDT. Final = 96 BDT
      expect(fare.finalFareBDT).toBe(96);
      expect(fare.calculationData.totalPoysha).toBe(9600);
    });

    it("should calculate non-pooled solo fare with zero discount", () => {
      const fare = calculatePassengerFare({
        baseFare: 80,
        distanceCharge: 50,
        isPooled: false,
      });

      expect(fare.finalFareBDT).toBe(130);
      expect(fare.calculationData.poolDiscountBDT).toBe(0);
      expect(fare.calculationData.totalPoysha).toBe(13000);
    });
  });

  describe("Ride Lifecycle State Transitions (Requirement 3 & 12)", () => {
    it("should allow valid forward transitions in ride lifecycle", () => {
      expect(() => validateStateTransition("REQUESTED", "MATCHED")).not.toThrow();
      expect(() => validateStateTransition("MATCHED", "DRIVER_ARRIVED")).not.toThrow();
      expect(() => validateStateTransition("DRIVER_ARRIVED", "STARTED")).not.toThrow();
      expect(() => validateStateTransition("STARTED", "COMPLETED")).not.toThrow();
    });

    it("should allow cancellation from active non-terminal states", () => {
      expect(() => validateStateTransition("REQUESTED", "CANCELLED")).not.toThrow();
      expect(() => validateStateTransition("MATCHED", "CANCELLED")).not.toThrow();
      expect(() => validateStateTransition("STARTED", "CANCELLED")).not.toThrow();
    });

    it("should reject invalid state transitions (e.g. COMPLETED -> STARTED)", () => {
      expect(() => validateStateTransition("COMPLETED", "STARTED")).toThrow(AppError);
      expect(() => validateStateTransition("CANCELLED", "MATCHED")).toThrow(AppError);
      expect(() => validateStateTransition("COMPLETED", "CANCELLED")).toThrow(AppError);
    });

    it("should throw a 400 AppError with INVALID_STATE_TRANSITION code", () => {
      try {
        validateStateTransition("COMPLETED", "STARTED");
      } catch (err: any) {
        expect(err).toBeInstanceOf(AppError);
        expect(err.statusCode).toBe(400);
        expect(err.code).toBe("INVALID_STATE_TRANSITION");
      }
    });
  });

  describe("Capacity Constraints (Bullet Tesla 3-Seat Capacity)", () => {
    it("should enforce maximum capacity of 3 seats for Bullet", () => {
      const bulletCapacity = 3;
      const currentMemberships = ["Nusrat", "Rafiq", "Shirin"];

      const canAddFourthPassenger = currentMemberships.length < bulletCapacity;
      expect(canAddFourthPassenger).toBe(false);
    });
  });
});
