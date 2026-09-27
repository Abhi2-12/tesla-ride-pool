export interface CreateVehicleInput {
  ownerId: string;
  type: string;
  capacity: number;
}

export interface UpdateVehicleInput {
  type?: string | undefined;
  capacity?: number | undefined;
}