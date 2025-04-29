import { User } from "./interface";

export function getUser(): null | User {
  const item = localStorage.getItem("user");
  if (!item) return null;

  return JSON.parse(item) as User;
}

export function getPhoto(photo: string) {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  return baseURL + photo;
}
