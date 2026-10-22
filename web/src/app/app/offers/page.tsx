"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageSquare, Pencil, X } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  PageHeader,
  Textarea,
} from "@/components/ui";
import { useToast } from "@/components/Toast";
import { ChatPanel } from "@/components/ChatPanel";
import { Stagger, StaggerItem } from "@/components/motion-ui";
import { formatDate, formatTL, offerStatusLabel } from "@/lib/format";

type Offer = {
  id: string;
  title: string;
  budget: number;
  counterBudget?: number;
  counterNote?: string | null;
  brandNote?: string | null;
  status: "pending" | "countered" | "accepted" | "rejected" | "cancelled";
  brandName: string;
  influencerName: string;
  influencerHandle: string;
  contentType: string;
  dueDate: string;
  usageRightsDays: number;
  revisions: number;
  brief: string;
  createdAt: string;
};

const tone = {
  pending: "warn" as const,
  countered: "blue" as const,
  accepted: "accent" as const,
  rejected: "danger" as const,
  cancelled: "neutral" as const,
};

export default function OffersPage() {
  const { user } = useAuth();
  const { push } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [counterId, setCounterId] = useState<string | null>(null);
  const [counterBudget, setCounterBudget] = useState(0);
  const [counterNote, setCounterNote] = useState("");
  const [editForm, setEditForm] = useState({
    title: "",
    budget: 0,
    contentType: "",
    dueDate: "",
    usageRightsDays: 90,
    revisions: 2,
    brief: "",
    brandNote: "",
  });

  async function load() {
    const res = await fetch("/api/offers");
    const data = await res.json();
    setOffers(data.offers ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function respond(
    id: string,
    action: "accept" | "reject" | "counter" | "accept_counter",
    extra?: { counterBudget?: number; counterNote?: string },
  ) {
    const res = await fetch(`/api/offers/${id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    const data = await res.json();
    if (!res.ok) {
      push(data.error || "İşlem başarısız", "err");
      return;
    }
    push(
      action === "accept" || action === "accept_counter"
        ? "Teklif kabul · sözleşme oluşturuldu"
        : action === "reject"
          ? "Teklif reddedildi"
          : "Karşı teklif gönderildi",
    );
    setCounterId(null);
    await load();
  }

  async function saveEdit(id: string) {
    const res = await fetch(`/api/offers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    const data = await res.json();
    if (!res.ok) {
      push(data.error || "Güncellenemedi", "err");
      return;
    }
    push("Teklif güncellendi");
    setEditId(null);
    await load();
  }

  async function cancel(id: string) {
    const res = await fetch(`/api/offers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    const data = await res.json();
    if (!res.ok) {
      push(data.error || "İptal edilemedi", "err");
      return;
    }
    push("Teklif iptal edildi", "info");
    await load();
  }

  return (
    <div>
      <PageHeader
        kicker="Teklifler"
        title="Teklif kutusu"
        subtitle="Düzenle, karşı teklif ver, sohbet et — kabul edilen teklif otomatik sözleşmeye dönüşür."
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-36" />
          ))}
        </div>
      ) : offers.length === 0 ? (
        <EmptyState
          title="Henüz teklif yok"
          body="Marka hesabından üretici profiline girerek ilk teklifi oluşturabilirsiniz."
        />
      ) : (
        <Stagger className="space-y-3" fast>
          {offers.map((o) => (
            <StaggerItem key={o.id}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Avatar
                      name={
                        user?.role === "brand" ? o.influencerName : o.brandName
                      }
                      size={40}
                    />
                    <div>
                      <p className="text-[15px] font-semibold text-ink">{o.title}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {o.brandName} → @{o.influencerHandle}
                      </p>
                    </div>
                  </div>
                  <Badge tone={tone[o.status]}>{offerStatusLabel(o.status)}</Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-wash px-3 py-3 text-sm sm:grid-cols-4">
                  <div>
                    <p className="text-[11px] text-muted">Bütçe</p>
                    <p className="font-semibold text-ink">{formatTL(o.budget)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted">İçerik</p>
                    <p className="font-semibold text-ink">{o.contentType}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted">Teslim</p>
                    <p className="font-semibold text-ink">{formatDate(o.dueDate)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted">Revizyon</p>
                    <p className="font-semibold text-ink">{o.revisions}</p>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-slate">{o.brief}</p>
                {o.brandNote ? (
                  <p className="mt-2 text-xs text-muted">Not: {o.brandNote}</p>
                ) : null}

                {o.status === "countered" && o.counterBudget ? (
                  <div className="mt-3 rounded-xl border border-blue-200 bg-blue-wash px-3 py-2 text-sm">
                    <span className="font-semibold text-ink">
                      Karşı teklif: {formatTL(o.counterBudget)}
                    </span>
                    {o.counterNote ? (
                      <p className="mt-1 text-xs text-muted">{o.counterNote}</p>
                    ) : null}
                  </div>
                ) : null}

                {editId === o.id ? (
                  <div className="mt-4 space-y-3 rounded-xl border border-line bg-wash p-4">
                    <Input
                      label="Başlık"
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Bütçe"
                        type="number"
                        value={editForm.budget}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            budget: Number(e.target.value),
                          })
                        }
                      />
                      <Input
                        label="Teslim"
                        type="date"
                        value={editForm.dueDate}
                        onChange={(e) =>
                          setEditForm({ ...editForm, dueDate: e.target.value })
                        }
                      />
                    </div>
                    <Input
                      label="İçerik türü"
                      value={editForm.contentType}
                      onChange={(e) =>
                        setEditForm({ ...editForm, contentType: e.target.value })
                      }
                    />
                    <Textarea
                      label="Brief"
                      rows={3}
                      value={editForm.brief}
                      onChange={(e) =>
                        setEditForm({ ...editForm, brief: e.target.value })
                      }
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => void saveEdit(o.id)}>
                        Kaydet
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditId(null)}
                      >
                        Vazgeç
                      </Button>
                    </div>
                  </div>
                ) : null}

                {counterId === o.id ? (
                  <div className="mt-4 space-y-3 rounded-xl border border-line bg-wash p-4">
                    <Input
                      label="Karşı bütçe (TL)"
                      type="number"
                      value={counterBudget}
                      onChange={(e) => setCounterBudget(Number(e.target.value))}
                    />
                    <Textarea
                      label="Açıklama"
                      rows={2}
                      value={counterNote}
                      onChange={(e) => setCounterNote(e.target.value)}
                      placeholder="Neden bu tutar?"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          void respond(o.id, "counter", {
                            counterBudget,
                            counterNote,
                          })
                        }
                      >
                        Karşı teklifi gönder
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setCounterId(null)}
                      >
                        Vazgeç
                      </Button>
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setChatId(chatId === o.id ? null : o.id)
                    }
                  >
                    <MessageSquare size={14} /> Sohbet
                  </Button>
                  <Link href={`/app/messages?thread=${encodeURIComponent(`offer:${o.id}`)}`}>
                    <Button size="sm" variant="ghost">
                      Mesajlarda aç
                    </Button>
                  </Link>

                  {user?.role === "influencer" && o.status === "pending" ? (
                    <>
                      <Button size="sm" onClick={() => void respond(o.id, "accept")}>
                        Kabul et
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setCounterId(o.id);
                          setCounterBudget(Math.round(o.budget * 1.15));
                          setCounterNote("");
                        }}
                      >
                        Karşı teklif
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void respond(o.id, "reject")}
                      >
                        Reddet
                      </Button>
                    </>
                  ) : null}

                  {user?.role === "brand" && o.status === "countered" ? (
                    <Button
                      size="sm"
                      onClick={() => void respond(o.id, "accept_counter")}
                    >
                      Karşı teklifi kabul et
                    </Button>
                  ) : null}

                  {user?.role === "brand" &&
                  (o.status === "pending" || o.status === "countered") ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditId(o.id);
                          setEditForm({
                            title: o.title,
                            budget: o.budget,
                            contentType: o.contentType,
                            dueDate: o.dueDate.slice(0, 10),
                            usageRightsDays: o.usageRightsDays,
                            revisions: o.revisions,
                            brief: o.brief,
                            brandNote: o.brandNote ?? "",
                          });
                        }}
                      >
                        <Pencil size={14} /> Düzenle
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => void cancel(o.id)}
                      >
                        <X size={14} /> İptal
                      </Button>
                    </>
                  ) : null}

                  {user?.role === "agency" && o.status === "pending" ? (
                    <Button size="sm" onClick={() => void respond(o.id, "accept")}>
                      Ajans adına kabul et
                    </Button>
                  ) : null}
                </div>

                {chatId === o.id ? (
                  <div className="mt-4">
                    <ChatPanel
                      threadId={`offer:${o.id}`}
                      title={`${o.title} · sohbet`}
                      compact
                    />
                  </div>
                ) : null}
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
