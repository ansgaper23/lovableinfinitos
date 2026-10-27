// Catálogo de planes – fuente única de verdad según plan.md
export type PlanId = "diario" | "semanal" | "quincenal" | "basico" | "pro" | "premium";

export interface PlanInfo {
  id: PlanId;
  name: string;
  duration: string;
  days: number;
  pricePen: number; // S/
  priceUsd: number;
  amountCents: number; // céntimos de PEN para Izipay
  popular?: boolean;
}

export const PLANS: Record<string, PlanInfo> = {
  diario: {
    id: "diario",
    name: "Plan Diario",
    duration: "24 Horas",
    days: 1,
    pricePen: 39.0,
    priceUsd: 10.5,
    amountCents: 3900,
  },
  semanal: {
    id: "semanal",
    name: "Plan Semanal",
    duration: "7 Días",
    days: 7,
    pricePen: 79.0,
    priceUsd: 21.0,
    amountCents: 7900,
    popular: true,
  },
  quincenal: {
    id: "quincenal",
    name: "Plan Quincenal",
    duration: "15 Días",
    days: 15,
    pricePen: 149.0,
    priceUsd: 39.5,
    amountCents: 14900,
  },
  // Retrocompatibilidad con ids previos
  basico: {
    id: "basico",
    name: "Plan Diario",
    duration: "24 Horas",
    days: 1,
    pricePen: 39.0,
    priceUsd: 10.5,
    amountCents: 3900,
  },
  pro: {
    id: "pro",
    name: "Plan Semanal",
    duration: "7 Días",
    days: 7,
    pricePen: 79.0,
    priceUsd: 21.0,
    amountCents: 7900,
    popular: true,
  },
  premium: {
    id: "premium",
    name: "Plan Quincenal",
    duration: "15 Días",
    days: 15,
    pricePen: 149.0,
    priceUsd: 39.5,
    amountCents: 14900,
  },
};

export const isPlanId = (v: string): v is PlanId =>
  v === "diario" ||
  v === "semanal" ||
  v === "quincenal" ||
  v === "basico" ||
  v === "pro" ||
  v === "premium";
