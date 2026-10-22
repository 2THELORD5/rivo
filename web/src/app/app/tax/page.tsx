"use client";

import { Badge, Card, PageHeader } from "@/components/ui";

const steps = [
  {
    title: "İstisna hesabı",
    body: "GVK 20/B kapsamında ayrı bir banka hesabı açılır. 2026 için yıllık istisna limiti 5,3 milyon TL’dir.",
  },
  {
    title: "Ödeme yönlendirme",
    body: "Rivo, işbirliği ödemesini istisna hesabınıza yönlendirir. Stopaj banka tarafından otomatik kesilir.",
  },
  {
    title: "Belge ve limit",
    body: "Limite yaklaştığınızda uyarı alırsınız. Markaya gereken evrak akışı sistem üzerinden üretilir.",
  },
];

export default function TaxPage() {
  return (
    <div>
      <PageHeader
        kicker="Uyumluluk"
        title="Vergi asistanı"
        subtitle="Bilgilendirme amaçlıdır; mali müşavir görüşünün yerini tutmaz."
      />
      <Badge tone="blue" className="mb-5">
        GVK 20/B · stopaj bankada
      </Badge>
      <div className="grid gap-3 md:grid-cols-3">
        {steps.map((s, i) => (
          <Card key={s.title}>
            <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
              Adım {i + 1}
            </p>
            <h3 className="font-display mt-2 text-xl text-ink">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-4">
        <h3 className="font-display text-xl text-ink">Örnek dağılım</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          18.000 TL brüt işbirliğinde yaklaşık 2.700 TL stopaj bankada kesilir;
          kalan tutar istisna hesabına geçer. Platform hizmet bedeli markadan
          ayrıca tahsil edilir.
        </p>
      </Card>
    </div>
  );
}
