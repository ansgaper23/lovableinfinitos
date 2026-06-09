import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const BASE_URL = "https://itsgcyiyemstpfafxrpq.supabase.co/functions/v1/reseller-api";

export interface ResellerStatus {
  used: number;
  max: number;
  remaining: number;
  allow_lifetime: boolean;
}

export interface LicenseResponse {
  success: boolean;
  license_key: string;
  type: string;
  expires_at: string | null;
  duration_seconds?: number;
  lifetime?: boolean;
  message?: string;
}

export const resellerApi = {
  async getStatus(token: string): Promise<ResellerStatus> {
    const response = await fetch(`${BASE_URL}/status`, {
      method: "POST",
      headers: {
        "x-api-token": token,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al obtener estado");
    }
    return response.json();
  },

  async generateTrial(token: string, displayName: string, minutes: number = 15): Promise<LicenseResponse> {
    const response = await fetch(`${BASE_URL}/generate-trial`, {
      method: "POST",
      headers: {
        "x-api-token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        display_name: displayName,
        minutes: Math.max(1, Math.min(minutes, 30)),
        seconds: 0,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error al generar prueba");
    return data;
  },

  async generateLicense(token: string, displayName: string, days: number = 30, lifetime: boolean = false): Promise<LicenseResponse> {
    const body: any = { display_name: displayName };
    if (lifetime) {
      body.lifetime = true;
    } else {
      body.days = days;
    }

    const response = await fetch(`${BASE_URL}/generate-license`, {
      method: "POST",
      headers: {
        "x-api-token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error al generar licencia");
    return data;
  },

  async listLicenses(token: string, page: number = 1, perPage: number = 50) {
    const response = await fetch(`${BASE_URL}/list-licenses`, {
      method: "POST",
      headers: {
        "x-api-token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ page, per_page: perPage }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error al listar licencias");
    return data;
  },

  async resetHwid(token: string, licenseKey: string) {
    const response = await fetch(`${BASE_URL}/reset-hwid`, {
      method: "POST",
      headers: {
        "x-api-token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ license_key: licenseKey }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error al resetear HWID");
    return data;
  },

  async revokeLicense(token: string, licenseKey: string) {
    const response = await fetch(`${BASE_URL}/revoke-license`, {
      method: "POST",
      headers: {
        "x-api-token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ license_key: licenseKey }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error al revocar licencia");
    return data;
  },

  // Helper to save license locally in our DB
  async saveLicenseLocally(userId: string, license: LicenseResponse, displayName: string) {
    const { error } = await supabase.from("reseller_licenses").insert({
      user_id: userId,
      license_key: license.license_key,
      display_name: displayName,
      type: license.type,
      expires_at: license.expires_at,
      duration_seconds: license.duration_seconds,
      lifetime: license.lifetime || false,
    });
    if (error) console.error("Error saving license locally:", error);
  }
};
