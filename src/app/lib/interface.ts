export type Role =
  | "SUPER_ADMIN"
  | "INVENTORY_MANAGER"
  | "PURCHASER"
  | "SALES"
  | "WAREHOUSE_STAFF"
  | "ANALYST"
  | "GUEST";

export const ROLES = [
  "SUPER_ADMIN",
  "INVENTORY_MANAGER",
  "PURCHASER",
  "SALES",
  "WAREHOUSE_STAFF",
  "ANALYST",
  "GUEST",
];

export interface User {
  userId: string;
  name: string;
  email: string;
  photo: string | null;
  role: Role;
}
