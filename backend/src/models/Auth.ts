export type UserRole = "user" | "admin";

export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  password: string;
  role: UserRole;
  name: string;
  phone?: string;
  gender?: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: UserRole;
  id: number;
  name?: string;
}

export interface UserInfo {
  username: string;
  role: UserRole;
  id: number;
}

export interface AccountMeta {
  accountTable: "customeraccounts" | "adminaccounts";
  joinTable: "customer" | "employees";
  idField: "customer_id" | "id";
  nameField: "customer_name" | "name";
  infoIdField: "customer_id" | "employ_id";
}
