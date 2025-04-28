import { User } from "./interface";

export function getUser(): null | User {
  const item = localStorage.getItem("user");
  if (!item) return null;

  return JSON.parse(item) as User;
}
