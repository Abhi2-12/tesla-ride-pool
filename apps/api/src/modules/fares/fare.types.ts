export interface CreateFareInput {
  poolId: string;
  userId: string;
  amount: string;
  calculationData: unknown;
}

export interface UpdateFareInput {
  amount?: string | undefined;
  calculationData?: unknown;
}