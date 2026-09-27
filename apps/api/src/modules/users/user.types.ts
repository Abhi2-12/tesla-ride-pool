export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  role: string;
}

export interface UpdateUserInput {
  name?: string | undefined;
  email?: string | undefined;
  role?: string | undefined;
}
