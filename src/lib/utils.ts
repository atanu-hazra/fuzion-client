import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function enhanceAvatarResolution(avatarUrl: string | undefined | null): string {
  if (!avatarUrl) return String(process.env.NEXT_PUBLIC_DEFAULT_USER_AVATAR || "");
  let url = String(avatarUrl);
  if (url.includes("googleusercontent.com") && url.includes("=")) {
    url = url.split("=")[0] + "=s400-c";
  }
  return url;
}
