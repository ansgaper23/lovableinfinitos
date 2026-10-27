const PlanesTab = () => {
  const navigate = useNavigate();
  const plans = [
    {
      planId: "diario",
      name: "Plan Diario",
      duration: "24 Horas",
      pricePen: "S/ 39.00",
      priceUsd: "≈ $10.50 USD",
      icon: <Flame className="w-5 h-5" />,
      tone: "violet" as const,
      features: [
        "Lovable ilimitado por 24 horas",
        "Sin consumo de créditos oficiales",
        "Acceso instantáneo al panel",
        "Soporte por WhatsApp en español",
      ],
    },
    {
      planId: "semanal",
      name: "Plan Semanal",
      duration: "7 Días",
      pricePen: "S/ 79.00",
      priceUsd: "≈ $21.00 USD",
      popular: true,
      icon: <Star className="w-5 h-5" />,
      tone: "fuchsia" as const,
      features: [
        "Lovable ilimitado por 7 días",
        "Sin consumo de créditos oficiales",
        "Acceso prioritario y panel exclusivo",
        "Soporte prioritario 24/7",
        "Guía de optimización de prompts",
      ],
    },
    {
      planId: "quincenal",
      name: "Plan Quincenal",
      duration: "15 Días",
      pricePen: "S/ 149.00",
      priceUsd: "≈ $39.50 USD",
      icon: <Crown className="w-5 h-5" />,
      tone: "pink" as const,
      features: [
        "Lovable ilimitado por 15 días continuos",
        "Sin consumo de créditos oficiales",
        "Acceso multi-proyecto sin restricciones",
        "Soporte VIP directo",
        "Actualizaciones de extensión garantizadas",
      ],
    },
  ];
  const toneRing: Record<string, string> = {
    violet: "from-violet-500/30 to-violet-500/0 text-violet-300",
    fuchsia: "from-fuchsia-500/30 to-fuchsia-500/0 text-fuchsia-300",
    pink: "from-pink-500/30 to-pink-500/0 text-pink-300",
  };

  return (
    <section className="space-y-6">
      <Header
        eyebrow="Planes activos en Soles"
        title="Elige el ritmo que necesitas"
        sub="Energía ilimitada para tus proyectos en Lovable. Paga en Soles (S/) vía Izipay, Yape o Tarjetas."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`relative rounded-3xl border bg-white/[0.03] backdrop-blur-xl p-6 transition hover:-translate-y-1 ${
              p.popular ? "border-violet-400/40 shadow-2xl shadow-violet-600/20" : "border-white/10"
            }`}
          >
            {p.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                Más popular
              </span>
            )}
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${toneRing[p.tone]} border border-white/10 flex items-center justify-center mb-5`}
            >
              {p.icon}
            </div>
            <h3 className="text-lg font-bold">{p.name}</h3>
            <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-4">{p.duration}</p>
            <div className="mb-1">
              <span className="text-4xl font-bold tracking-tight">{p.pricePen}</span>
            </div>
            <p className="text-xs text-zinc-500 mb-5 font-mono">
              {p.priceUsd} • Tarifa final en PEN
            </p>
            <ul className="space-y-2 mb-6">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                  <Check className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button
              onClick={() => navigate({ to: "/checkout/$plan", params: { plan: p.planId } })}
              className={`w-full rounded-full h-11 font-semibold ${
                p.popular
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-600/30"
                  : "bg-white/5 hover:bg-white/10 border border-white/10"
              }`}
            >
              Activar acceso
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
};