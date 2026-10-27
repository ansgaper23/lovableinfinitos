const FLOW_PRO_API_URL = "https://flow-pro.online/api/admin/licenses/generate";
const DEFAULT_API_KEY = "fp_adm_live_9a7d3c8e1f5b24608c02e4d6a1b8c9f0";

export interface GenerateLicenseParams {
  type?: "paid" | "trial" | string;
  duration_days?: number;
  customer_name?: string;
  duration_minutes?: number;
  lifetime?: boolean;
  apiKey?: string;
}

export interface GeneratedLicenseResult {
  success: boolean;
  license_key: string;
  expires_at: string | null;
  type: string;
  customer_name?: string;
  duration_days?: number;
  duration_seconds?: number;
  raw: any;
}

/**
 * Genera una licencia usando la API oficial de Flow-Pro:
 * POST https://flow-pro.online/api/admin/licenses/generate
 * Headers:
 *   Content-Type: application/json
 *   x-admin-api-key: fp_adm_live_9a7d3c8e1f5b24608c02e4d6a1b8c9f0
 */
export async function generateFlowProLicense(params: GenerateLicenseParams): Promise<GeneratedLicenseResult> {
  const apiKey =
    params.apiKey ||
    (typeof process !== "undefined" && process.env?.FLOW_PRO_ADMIN_API_KEY) ||
    DEFAULT_API_KEY;

  const rawType = (params.type || "paid").toLowerCase();
  const type = rawType === "test" ? "trial" : rawType;

  // Si es trial por defecto 1 día o lo especificado; si es paid por defecto 30 días
  let duration_days = params.duration_days;
  if (!duration_days || duration_days <= 0) {
    if (params.lifetime) {
      duration_days = 3650; // ~10 años
    } else if (type === "trial") {
      duration_days = 1;
    } else {
      duration_days = 30;
    }
  }

  const customer_name = (params.customer_name || "Cliente VIP").trim();

  const payload = {
    type,
    duration_days,
    customer_name,
  };

  const response = await fetch(FLOW_PRO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Respuesta inválida de Flow-Pro (${response.status}): ${text.slice(0, 200)}`);
  }

  if (!response.ok) {
    const errorMsg =
      json?.message ||
      json?.error ||
      json?.detail ||
      `Error ${response.status} al generar licencia en Flow-Pro`;
    throw new Error(errorMsg);
  }

  // Extraer la clave de licencia según posibles respuestas
  const licenseKey =
    json?.license_key ||
    json?.license?.license_key ||
    json?.license?.key ||
    json?.license?.code ||
    json?.key ||
    json?.code ||
    json?.data?.license_key ||
    json?.data?.key ||
    json?.data?.code ||
    (typeof json === "string" ? json : "");

  if (!licenseKey) {
    console.error("Respuesta de Flow-Pro sin clave de licencia:", json);
    throw new Error("La API de Flow-Pro no retornó una clave de licencia válida.");
  }

  const expiresAt =
    json?.expires_at ||
    json?.license?.expires_at ||
    json?.data?.expires_at ||
    null;

  const durationSeconds =
    json?.duration_seconds ||
    (duration_days ? duration_days * 86400 : undefined);

  return {
    success: true,
    license_key: licenseKey,
    expires_at: expiresAt,
    type,
    customer_name,
    duration_days,
    duration_seconds: durationSeconds,
    raw: json,
  };
}
