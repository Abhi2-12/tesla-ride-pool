export interface CreatePoolInput {
  vehicleId: string;
  creatorId: string;
  capacity: number;
  state: string;
}

export interface UpdatePoolInput {
  capacity?: number | undefined;
  state?: string | undefined;
}