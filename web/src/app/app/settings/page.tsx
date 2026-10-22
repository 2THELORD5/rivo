"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, MessageSquare, Shield } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Avatar, Badge, Button, Card, Input, PageHeader } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { BRAND } from "@/lib/brand";

export default function SettingsPage() {
  const { user, refresh, logout } = useAuth();
  const { push } = useToast();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? "");
    setPhone(user.phone ?? "");
    setCity(user.city ?? "");
  }, [user]);

  if (!user) return null;

  return (
    <div>
      <PageHeader
        kicker="Hesap"
        title="Ayarlar"
        subtitle={`${BRAND.name} çalışma alanı tercihlerin.`}
      />

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="flex flex-col items-center text-center">
            <Avatar name={user.name} size={72} />
            <p className="mt-4 text-lg font-semibold text-ink">{user.name}</p>
            <p className="text-sm text-muted">{user.email}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Badge tone="accent">{user.role}</Badge>
              {user.authProvider ? (
                <Badge tone="blue">{user.authProvider}</Badge>
              ) : (
                <Badge tone="neutral">demo</Badge>
              )}
              {user.subscriptionTier ? (
                <Badge tone="ink">{user.subscriptionTier}</Badge>
              ) : null}
            </div>
            {typeof user.tokens === "number" ? (
              <p className="mt-4 text-xs text-muted">
                Teklif jetonu:{" "}
                <span className="font-semibold text-ink tabular">{user.tokens}</span>
              </p>
            ) : null}
          </Card>
        </motion.div>

        <Card className="space-y-3">
          <h3 className="font-display text-xl text-ink">Profil bilgileri</h3>
          <Input label="Ad" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label="Telefon"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+90 …"
          />
          <Input
            label="Şehir"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="İstanbul"
          />
          <Input label="E-posta" value={user.email} disabled />
          {user.brandName ? (
            <Input label="Marka" value={user.brandName} disabled />
          ) : null}
          {user.agencyName ? (
            <Input label="Ajans" value={user.agencyName} disabled />
          ) : null}
          <Button
            disabled={saving || !name.trim()}
            onClick={async () => {
              setSaving(true);
              const res = await fetch("/api/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  role: user.role,
                  name: name.trim(),
                  phone,
                  city,
                  brandName: user.brandName,
                  agencyName: user.agencyName,
                  handle: user.handle,
                  niche: user.niche,
                  bio: user.bio,
                  industry: user.industry,
                  website: user.website,
                  taxId: user.taxId,
                }),
              });
              setSaving(false);
              if (res.ok) {
                await refresh();
                push("Ayarlar kaydedildi");
              } else {
                const data = await res.json().catch(() => ({}));
                push(data.error || "Kayıt başarısız", "err");
              }
            }}
          >
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </Button>
        </Card>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Card className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink">Mesajlar</p>
            <p className="text-xs text-muted">Teklif ve iş sohbetleri</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push("/app/messages")}
          >
            <MessageSquare size={14} /> Aç
          </Button>
        </Card>
        <Card className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink">Güvenlik</p>
            <p className="text-xs text-muted">Oturum ve erişim</p>
          </div>
          <Shield size={18} className="text-muted" />
        </Card>
        <Card className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink">Oturumu kapat</p>
            <p className="text-xs text-muted">Bu cihazdan çıkış</p>
          </div>
          <Button
            size="sm"
            variant="danger"
            onClick={async () => {
              await logout();
              router.push("/");
            }}
          >
            <LogOut size={14} /> Çıkış yap
          </Button>
        </Card>
      </div>
    </div>
  );
}
