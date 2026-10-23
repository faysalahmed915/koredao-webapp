export interface PlatformSettingValue {
  key: string;
  value: string;
  description?: string;
}

export interface UpdatePlatformSettingDto {
  key: string;
  value: string;
  description?: string;
}

import { BACKEND_URL, getApiHeaders } from "./api-client";
const NEXT_PUBLIC_BACKEND_URL = BACKEND_URL;

export async function fetchSettings(): Promise<PlatformSettingValue[]> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/settings`, {
    method: "GET",
    headers: getApiHeaders(),
    credentials: "include",
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to load platform settings");
  }

  return Array.isArray(envelope?.data) ? envelope.data : [];
}

export async function fetchSetting(key: string): Promise<PlatformSettingValue> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/settings/${key}`, {
    method: "GET",
    headers: getApiHeaders(),
    credentials: "include",
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || `Setting '${key}' not found`);
  }

  return envelope.data;
}

export async function updateSetting(
  key: string,
  payload: UpdatePlatformSettingDto,
): Promise<PlatformSettingValue> {
  const res = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/settings/${key}`, {
    method: "PATCH",
    headers: getApiHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || `Failed to update setting '${key}'`);
  }

  return envelope.data;
}
