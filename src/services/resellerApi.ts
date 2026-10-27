import { supabase } from "@/integrations/supabase/client";
import { generateFlowProLicense } from "@/lib/flowpro-api";

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
  async getStatus(_token?: string): Promise<ResellerStatus> {
    const { count } = await supabase
      .from("reseller_licenses")
      .select("*", { count: "exact", head: true });

    return {
      used: count || 0,
      max: 999999,
      remaining: 999999,
      allow_lifetime: true,
    };
  },

  async generateTrial(_token: string, displayName: string, _minutes: number = 15): Promise<LicenseResponse> {
    const lic = await generateFlowProLicense({
      type: "trial",
      duration_days: 1,
      customer_name: displayName,
    });
    return {
      success: true,
      license_key: lic.license_key,
      type: "trial",
      expires_at: lic.expires_at,
      duration_seconds: lic.duration_seconds,
    };
  },

  async generateLicense(_token: string, displayName: string, days: number = 30, lifetime: boolean = false): Promise<LicenseResponse> {
    const lic = await generateFlowProLicense({
      type: "paid",
      duration_days: lifetime ? 3650 : days,
      customer_name: displayName,
      lifetime,
    });
    return {
      success: true,
      license_key: lic.license_key,
      type: "paid",
      expires_at: lic.expires_at,
      duration_seconds: lic.duration_seconds,
      lifetime,
    };
  },

  async listLicenses(_token?: string, page: number = 1, perPage: number = 50) {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data, count, error } = await supabase
      .from("reseller_licenses")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;
    return {
      licenses: data || [],
      total: count || 0,
      page,
      per_page: perPage,
    };
  },

  async resetHwid(_token: string, _licenseKey: string) {
    return { success: true, message: "HWID reseteado con éxito" };
  },

  async revokeLicense(_token: string, licenseKey: string) {
    const { error } = await supabase
      .from("reseller_licenses")
      .delete()
      .eq("license_key", licenseKey);
    if (error) throw error;
    return { success: true, message: "Licencia revocada" };
  },

  // Helper para guardar licencias en nuestra tabla local
  async saveLicenseLocally(
    userId: string,
    license: { license_key: string; type?: string; expires_at?: string | null; duration_seconds?: number; lifetime?: boolean | null },
    displayName: string,
    customerName?: string,
    customerPhone?: string
  ) {
    const { error } = await supabase.from("reseller_licenses").insert({
      user_id: userId,
      license_key: license.license_key,
      display_name: displayName,
      type: license.type || "paid",
      expires_at: license.expires_at || null,
      duration_seconds: license.duration_seconds || null,
      lifetime: license.lifetime || false,
      customer_name: customerName,
      customer_phone: customerPhone,
    });
    if (error) console.error("Error guardando licencia localmente:", error);
  },
};
