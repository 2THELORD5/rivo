"use client";

import { useState } from "react";
import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { Badge, Button, Card, PageHeader, Textarea } from "@/components/ui";
import { useToast } from "@/components/Toast";

type Risk = {
  clause: string;
  severity: "low" | "medium" | "high";
  explanation: string;
};

const sample = `İşbu sözleşme kapsamında üretici, içeriğin süresiz kullanım hakkını markaya devreder.
Münhasırlık: 12 ay boyunca rakip kozmetik markalarıyla çalışılamaz.
Gecikme halinde 50.000 TL cezai şart uygulanır.
Ödeme, içerik tesliminden sonra net 60 gün içinde yapılacaktır.
Marka içeriği dilediği gibi düzenleme hakkına sahiptir.`;

export default function ContractScanPage() {
  const { push } = useToast();
  const [text, setText] = useState(sample);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function scan() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/contract/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      push(data.error || "Tarama başarısız", "err");
      return;
    }
    setRisks(data.risks);
    push(`${data.risks?.length ?? 0} risk maddesi bulundu`, "info");
  }

  const icon = { high: ShieldAlert, medium: AlertTriangle, low: Info };
  const tone = {
    high: "danger" as const,
    medium: "warn" as const,
    low: "accent" as const,
  };

  return (
    <div>
      <PageHeader
        kicker="Araçlar"
        title="Sözleşme risk tarayıcı"
        subtitle="Riskli maddeleri işaretler. Hukuki görüş değildir; gerektiğinde avukata danışın."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <Textarea
            label="Sözleşme metni"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={14}
          />
          {error ? <p className="mt-2 text-sm text-rose">{error}</p> : null}
          <Button className="mt-4" disabled={loading} onClick={scan}>
            {loading ? "Taranıyor…" : "Riskleri tara"}
          </Button>
          <p className="mt-3 text-[12px] text-muted">
            TCKN, adres ve IBAN gibi kişisel verileri göndermeden önce maskeleyin.
          </p>
        </Card>
        <div className="space-y-3">
          {risks.length === 0 ? (
            <Card className="py-12 text-center">
              <p className="text-sm text-muted">
                Soldaki metni tarayın veya kendi sözleşmenizi yapıştırın. Sonuçlar
                madde madde listelenir.
              </p>
            </Card>
          ) : (
            risks.map((r, i) => {
              const Icon = icon[r.severity];
              return (
                <Card key={`${r.clause}-${i}`}>
                  <div className="flex items-start gap-3">
                    <Icon size={18} className="mt-0.5 text-slate" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-ink">{r.clause}</p>
                        <Badge tone={tone[r.severity]}>{r.severity}</Badge>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {r.explanation}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
