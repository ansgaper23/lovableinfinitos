import React from "react";
import { Key, Clock, CreditCard, RefreshCw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface ExtendedProfile {
  id: string;
  email?: string | null;
  role?: string | null;
  credits?: number;
  trial_requested?: boolean;
  trial_requested_at?: string | null;
  trial_expires_at?: string | null;
  has_assigned_license?: boolean;
  assigned_expires_at?: string | null;
  licenses_total?: number;
  licenses_trial?: number;
  licenses_assigned?: number;
  licenses_paid?: number;
  signup_ip?: string | null;
  phone?: string | null;
  created_at: string;
}

export const roleStyles = (role: string) => {
  if (role === "superadmin") return "border-destructive/30 bg-destructive/10 text-destructive";
  if (role === "reseller") return "border-primary/30 bg-primary/10 text-primary";
  if (role === "blocked") return "border-red-500/30 bg-red-500/10 text-red-400";
  return "border-amber-500/30 bg-amber-500/10 text-amber-400";
};

export const roleLabelOf = (role: string) =>
  role === "user" ? "pendiente" : role === "blocked" ? "bloqueado" : role;

export const TrialBadge = ({ user }: { user: ExtendedProfile }) => {
  if (!user.trial_requested) {
    return <Badge variant="outline" className="text-[10px] border-zinc-700 bg-zinc-950 text-zinc-500">No solicitada</Badge>;
  }
  const expiresAt = user.trial_expires_at ? new Date(user.trial_expires_at).getTime() : null;
  const expired = expiresAt !== null && expiresAt < Date.now();
  return (
    <Badge variant="outline" className={`text-[10px] gap-1 ${expired ? "border-zinc-700 bg-zinc-950 text-zinc-400" : "border-blue-500/30 bg-blue-500/10 text-blue-400"}`}>
      <Clock className="w-3 h-3" />
      {expired ? "Prueba expirada" : "Prueba activa"}
    </Badge>
  );
};

export const LicenseCountBadge = ({ user }: { user: ExtendedProfile }) => {
  const total = user.licenses_total ?? 0;
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <Key className="w-3.5 h-3.5 text-primary" />
      <span className="tabular-nums text-white">{total}</span>
    </div>
  );
};

export interface UserActionProps {
  user: ExtendedProfile;
  onRecharge: () => void;
  onToggleActivation: () => void;
  onAssignLicense: () => void;
  onBlockToggle: () => void;
  onDelete: () => void;
  toggling: boolean;
}

export const UserActions = ({ user, onRecharge, onToggleActivation, onAssignLicense, onBlockToggle, onDelete, toggling }: UserActionProps) => {
  const isReseller = user.role === "reseller";
  const isSuper = user.role === "superadmin";
  const isBlocked = user.role === "blocked";
  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-end gap-1.5 w-full">
      {!isSuper && !isBlocked && (
        <Button onClick={onToggleActivation} disabled={toggling} size="sm" variant="outline" className={`h-8 px-2 text-[11px] sm:text-xs border-zinc-700 bg-zinc-950 ${isReseller ? "text-amber-400" : "text-green-400"}`}>
          {toggling ? <RefreshCw className="w-3 h-3 animate-spin" /> : isReseller ? "Quitar reseller" : "Hacer reseller"}
        </Button>
      )}
      {!isSuper && !isReseller && !isBlocked && (
        <Button onClick={onAssignLicense} size="sm" variant="outline" className="h-8 px-2 text-[11px] sm:text-xs border-zinc-700 bg-zinc-950 text-destructive">
          <Key className="w-3 h-3 mr-1" /> Asignar
        </Button>
      )}
      {!isSuper && (
        <Button onClick={onBlockToggle} disabled={toggling} size="sm" variant="outline" className={`h-8 px-2 text-[11px] sm:text-xs border-zinc-700 bg-zinc-950 ${isBlocked ? "text-green-400" : "text-red-400"}`}>
          {isBlocked ? "Desbloquear" : "Bloquear"}
        </Button>
      )}
      {!isSuper && (
        <Button onClick={onDelete} size="sm" variant="outline" className="h-8 px-2 text-[11px] sm:text-xs border-zinc-700 bg-zinc-950 text-zinc-400 hover:text-destructive">
          <Trash2 className="w-3 h-3 mr-1" /> Eliminar
        </Button>
      )}
    </div>
  );
};
