// Catálogo de planes – fuente única de verdad
export type PlanId = "basico" | "pro" | "premium";

export interface PlanInfo {
  id: PlanId;
  name: string;
  duration: string;
  days: number;
  priceUsd: number;
  pricePen: number; // S/. — tipo de cambio fijo 3.75
  amountCents: number; // céntimos de PEN para Izipay
}

export const PLANS: Record<PlanId, PlanInfo> = {
  basico: {
    id: "basico",
    name: "Plan Básico",
    duration: "1 Día",
    days: 1,
    priceUsd: 5.99,
    pricePen: 22.5,
    amountCents: 2250,
  },
  pro: {
    id: "pro",
    name: "Plan Pro",
    duration: "7 Días",
    days: 7,
    priceUsd: 13.99,
    pricePen: 52.5,
    amountCents: 5250,
  },
  premium: {
    id: "premium",
    name: "Plan Premium",
    duration: "30 Días",
    days: 30,
    priceUsd: 18.99,
    pricePen: 71.5,
    amountCents: 7150,
  },
};

export const isPlanId = (v: string): v is PlanId =>
  v === "basico" || v === "pro" || v === "premium";
