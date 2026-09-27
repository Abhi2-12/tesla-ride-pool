export interface CreateMembershipInput {
  poolId: string;
  userId: string;
  rideRequestId: string;
  status: string;
}

export interface UpdateMembershipInput {
  status?: string | undefined;
}
