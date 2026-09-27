export interface CreateRideRequestInput {
  userId: string;
  origin: string;
  destination: string;
  status: string;
}

export interface UpdateRideRequestInput {
  origin?: string | undefined;
  destination?: string | undefined;
  status?: string | undefined;
}