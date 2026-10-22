# Influencer Kariyer Yönetimi ve Güvenli İşbirliği Platformu
## Fizibilite, Strateji ve Uygulama Raporu

*Hazırlanma: 8 Ekim 2026. Kaynak: Verilen fikir dokümanı ve web araştırması (resmi API dokümanları, TCMB/6493 sayılı Kanun, GİB rehberleri, iyzico/PayTR, rakip fiyat sayfaları, TBB yapay zeka rehberi).*

---

## 0. Yönetici Özeti (TL;DR)

1. **Fikir uygulanabilir, ama pazar boş değil.** Türkiye'de Teamfluencer (500K+ nano/mikro influencer, AI arama), CreatorTR (AI marka uyum eşleşmesi, standart sözleşme, teslim garantisi), Infrozer, Winfluencer var; globalde Collabstr, Passionfroot, Aspire, CreatorIQ var. Bunların neredeyse hepsi **marka tarafına hizmet eden** araçlar. Sizin gerçek farkınız **"üreticinin tarafında duran dijital menajer"** olmak (Gatekeeper + sözleşme kalkanı + garantili ödeme). Konumlandırmayı buna kilitleyin.
2. **Önerilen %3-5 komisyon sürdürülebilir değil.** Sadece ödeme altyapısı maliyeti iyzico'da **%4,29 + 0,25 TL** (kurumsal, BSMV dahil), PayTR'de 7 gün valörle **%2,19'dan başlayan** oran. %3-5 komisyon ile her işlemde zarar veya sıfıra yakın marj çıkar. Rakipler: Collabstr marka %10 + üretici %15; Passionfroot %5 (kendi işin) / %15 (platformun getirdiği iş). **Öneri: marka tarafına %8-12 hizmet bedeli, üreticiye %0-5.**
3. **Parayı kendiniz tutamazsınız.** Escrow (güvenli havuz), 6493 sayılı Kanun kapsamında ödeme hizmetidir; TCMB izni, anonim şirket ve en az 1-2 milyon TL ödenmiş sermaye ister. **Çözüm: iyzico Pazaryeri veya PayTR Pazaryeri** altyapısı. Para onlarda bekler, onay gelince alt üye (influencer) IBAN'ına geçer. Lisans gerekmez.
4. **"Tüm platformlardan anlık veri" vaadi kısmen gerçekçi.** Instagram ve YouTube'dan demografi dahil zengin veri alınabilir (üretici OAuth ile bağlarsa). **TikTok'un geliştirici API'si kitle demografisi vermiyor; Twitch de vermiyor.** Medya kiti ve Collab-Match bu kısıtla tasarlanmalı.
5. **AI Sözleşme Tarayıcı'da hukuki risk var.** Avukatlık Kanunu m.35'e göre somut olaya özel hukuki mütalaa vermek avukatlara ait. Ürün "hukuki danışman" değil **"risk işaretleme ve bilgilendirme aracı"** olarak sunulmalı; kişisel veriler (KVKK) maskelenmeli.
6. **Yol haritasında sıralama hatası var.** Önerilen planda gelir getiren her şey (Pro abonelik = sözleşme tarayıcı, escrow komisyonu) 6.-12. aya bırakılmış. Sözleşme tarayıcı bugün LLM'lerle 2-4 haftada yapılabiliyor ve **en iyi üye kazanma kancası**. Öne çekin.
7. **Ekip sorusu cevabı: Hibrit model.** Çekirdek ürün (eşleşme, ödeme akışı, AI) şirketin asıl varlığı; bunu tamamen dışarı vermeyin. **Hisseli bir teknik kurucu ortak (CTO) + 1-2 içeride geliştirici**, tasarım ve ileride mobil uygulama gibi parçalar için dış destek.

---

## 1. Fikrin Gerçeklik Kontrolü: Ne Doğru, Ne Düzeltilmeli?

| Fikir dokümanındaki iddia | Araştırma bulgusu | Karar |
|---|---|---|
| Escrow ile "geç ödeme" biter | Doğru ve sektörün gerçek acısı. Ancak lisanslı ödeme kuruluşu üzerinden yapılmalı | **Tut, iyzico/PayTR Pazaryeri ile** |
| İçerik yayınlanınca para otomatik geçer | Yayının tespiti API ile mümkün (IG medya, YouTube video), ama "brief'e uygun mu" kararı otomatik verilemez | **Otomatik tespit + markaya 72 saat onay süresi + süre dolunca otomatik onay + itiraz akışı** |
| Platform komisyonu %3-5 | Ödeme altyapısı tek başına %2,2-4,3+ | **Marka %8-12, üretici %0-5** |
| IG, TikTok, YouTube API'den anlık veri | IG ve YouTube evet; TikTok demografi yok | **TikTok için ekran görüntüsü yükleme + doğrulama** |
| Collab-Match demografi analiziyle eşleştirme | Demografi sadece IG/YouTube'da var; başlangıçta eşleşme sonucu verisi yok | **Kural tabanlı başla, veri biriktikçe ML** |
| AI Sözleşme Tarayıcı = "Hukuki Kalkan" | Avukatlık tekeli riski | **"Risk raporu", hukuki görüş değil; avukat ağı ile destek** |
| Jeton sistemi | Mantıklı, spam'i keser | **Tut; üretici X gün yanıt vermezse jeton iadesi** |
| Fiyatlar dolar bazlı ($19-39) | Türk üreticisi için yüksek algılanır | **TL fiyatlandırma, yıllık indirim; marka tarafı ana gelir** |
| İlk niş: e-spor/oyun | Mantıklı, ama bu nişin ana kanalları Twitch, Kick, YouTube; TikTok/IG ikincil | **Veri entegrasyon önceliğini nişe göre ayarla** |

---

## 2. Teknik Fizibilite: Sosyal Medya API'leri

Bu bölüm platformun en kritik teknik kısıtı. Tüm veriler **üreticinin kendi hesabını OAuth ile bağlamasıyla** alınabilir; başkasının hesabını izinsiz çekmek (scraping) hem kullanım şartlarına aykırı hem de güvenilirlik vaadinizle çelişir.

| Platform | Ne alınabilir? | Kısıtlar | Medya kitine etkisi |
|---|---|---|---|
| **Instagram** (Graph API, Business/Creator hesap) | Takipçi, erişim, etkileşim, gönderi metrikleri, `follower_demographics` ve `engaged_audience_demographics` (yaş, cinsiyet, ülke, şehir) | Kişisel hesaplar desteklenmez. Demografi için 100+ takipçi/etkileşim gerekir, sadece ilk 45 segment döner, veri 48 saate kadar gecikmeli. **Meta App Review + işletme doğrulaması** zorunlu (haftalar sürebilir, erken başvurun) | Tam destek |
| **YouTube** (Data API + Analytics API) | Abone, izlenme, izlenme süresi, `ageGroup`, `gender`, ülke bazlı izleyici yüzdeleri | Sadece kanal sahibinin OAuth onayıyla. Google OAuth doğrulaması gerekir | Tam destek |
| **TikTok** (Login Kit + Display API) | Profil bilgisi, takipçi sayısı, video listesi ve video metrikleri | **Kitle demografisi yok.** Research API sadece akademik/kâr amacı gütmeyen kurumlara açık. Demografi ancak TikTok One Creator Marketplace (reklamveren tarafı, ayrı partnerlik) ile | Kısmi: demografi için üreticinin TikTok Studio ekran görüntüsünü yüklemesi + OCR + manuel/AI doğrulama |
| **Twitch** (Helix API) | Takipçi sayısı, yayın bilgisi, (izinle) takipçi listesi, bazı analitik raporlar | **Demografi yok** | Kısmi: ortalama izleyici, yayın saatleri gibi metrikler |
| **Kick** (Public API, OAuth 2.1) | Kanal bilgisi, canlı yayın ve izleyici sayısı, kategori | API yeni ve sınırlı; demografi yok | Kısmi. Türk oyun yayıncılarında Kick yaygın olduğu için yine de entegre edilmeli |

**Sonuç:** "Dinamik Medya Kiti" uygulanabilir ama "her platformdan tam demografi" vaadi verilmemeli. Medya kitinde her verinin yanında **kaynak rozeti** gösterin ("API ile doğrulandı" ve "Üretici beyanı"). Bu şeffaflık markalara karşı güven unsuru olur ve rakiplerden ayrışır.

---

## 3. Hukuki ve Mali Çerçeve (Türkiye)

### 3.1 Escrow / Ödeme
- 6493 sayılı Kanun'a göre başkası adına fon tutup aktarmak **ödeme hizmetidir**. Ödeme kuruluşu olmak için TCMB izni, anonim şirket, en az 1-2 milyon TL sermaye, denetim ve uyum altyapısı gerekir. Başlangıç için uygun değil.
- **iyzico Pazaryeri:** Para alıcının ödeme hesabında, onay veya üst süre dolana kadar bekler, sonra alt üyenin (satıcının) hesabına geçer. Akış: alt üye kaydı (onboarding API, IBAN ile) → ödeme (`subMerchantKey` + `subMerchantPrice`) → onay. Alt üyeden ayrıca ücret kesilmez; iyzico komisyonu pazaryeri payından düşülür.
- **PayTR Pazaryeri:** Benzer model, oran teklife bağlı, her satıcıya farklı komisyon tanımlanabiliyor.
- **Öneri:** İki sağlayıcıdan da yazılı teklif alın; hizmet satışı (mal değil) olduğu için "teslim onayı" akışının hizmete uygun yapılandırılabildiğini teyit edin.

### 3.2 Influencer Vergilendirmesi (önemli bir ürün fırsatı)
- GVK mükerrer 20/B istisnası: Gerçek kişi içerik üreticileri, **2026 için yıllık 5.300.000 TL'ye kadar** kazançta gelir vergisinden istisna. Şartlar: vergi dairesinden İstisna Belgesi ve Türkiye'de bu iş için açılmış banka hesabı. **Tüm hasılat münhasıran bu hesaba gelmeli.** Banka %15 stopaj keser; reklamveren ayrıca stopaj kesmez; hizmet KDV'den istisna.
- **Ürüne yansıması:** Escrow ödemelerinin alt üye IBAN'ı bu istisna hesabı olmalı. Onboarding'de "İstisna belgen var mı?" kontrolü, yoksa adım adım rehber. Yıllık limite yaklaşınca uyarı gibi bir "vergi asistanı" özelliği **ciddi bir Pro özelliği** olabilir. Markalar açısından da "stopaj ve KDV ile uğraşmadan ödeme" satış argümanı olur.
- Platformun kendi komisyonu için e-fatura/e-arşiv kesilmesi gerekir (muhasebe entegrasyonu: Paraşüt, Logo vb.).

### 3.3 AI Sözleşme Tarayıcı ve Avukatlık Tekeli
- Avukatlık Kanunu m.35: hukuki meselelerde mütalaa vermek baroya kayıtlı avukatlara ait; m.63 yetkisiz avukatlığa yaptırım öngörüyor. Yargıtay "işlevsel test" uyguluyor: şirketin adına değil, yaptığı işe bakıyor.
- TBB'nin 2026 Yapay Zeka Tavsiye Rehberi'ne göre AI "bağımsız hukuki danışman" gibi sunulmamalı.
- **Güvenli ürün tasarımı:**
  - Çıktı dili: "Bu maddede süresiz kullanım hakkı ifadesi tespit edildi. Bu tür maddeler genellikle şu riskleri taşır..." Yani **genel bilgi + madde işaretleme**. "İmzalama" veya "şunu yaz" gibi kişiye özel strateji yok.
  - Her raporda açık uyarı: "Hukuki görüş değildir."
  - "Avukata danış" butonu ile anlaşmalı avukat ağına yönlendirme. **Dikkat:** Avukatlarla ücret paylaşımı ve yönlendirme modeli baro kuralları açısından ayrıca bir avukata kurgulatılmalı.
- **KVKK:** Sözleşmelerde kişisel veri (TCKN, adres, IBAN) bulunur. Yurt dışındaki LLM sağlayıcısına göndermek "yurt dışına veri aktarımı" sayılır (KVKK m.9). Gönderim öncesi kişisel verileri maskeleyin, veri saklamayan (zero data retention) kurumsal API anlaşmaları kullanın, aydınlatma metni ve açık rıza alın.

### 3.4 Reklam Kurulu ve Sponsorlu İçerik
- Sponsorlu içeriklerin açıkça etiketlenmesi zorunlu. **Fırsat:** Yayın doğrulama aşamasında gönderide "#reklam / #işbirliği" etiketi var mı otomatik kontrol edilip üreticiye hatırlatılabilir. Bu, markayı da cezadan korur.

### 3.5 Jeton Sistemi
- Sadece platformun kendi hizmeti için kullanılan, devredilemeyen ve nakde çevrilemeyen ön ödemeli kredi yapısı elektronik para riskini azaltır. Yine de kurguyu bir fintech avukatına teyit ettirin. Jetonları "iade edilemez dijital hizmet" olarak değil, "kullanılmayan jeton belirli koşullarda iade" şeklinde tasarlamak markaların güvenini artırır.

---

## 4. Rekabet ve Konumlandırma

| Oyuncu | Model | Kimin tarafında? | Bizim farkımız |
|---|---|---|---|
| Collabstr (global) | Açık pazaryeri, escrow, marka %10 + üretici %15, $249-333/ay | Marka ağırlıklı | Daha düşük üretici kesintisi, Türkiye ödeme ve vergi uyumu |
| Passionfroot (global) | Üretici vitrini, kendi işinde %5, ağdan gelen işte %15 | Üretici | En yakın model referansı; Türkiye'de yok |
| Aspire / CreatorIQ | Kurumsal SaaS, yüksek fiyat | Büyük markalar | Biz KOBİ ve mikro/orta üretici |
| Teamfluencer (TR) | 500K+ nano/mikro, AI arama, barter, kampanya yönetimi | Marka | Biz üreticiyi koruyan taraf + escrow |
| CreatorTR (TR) | AI eşleşme, standart sözleşme, teslim garantisi | Marka | Üretici tarafında Gatekeeper ve sözleşme tarama |

**Pazar büyüklüğü:** IAB Türkiye'ye göre influencer medya yatırımı 2024'ün sadece ilk yarısında 3,1 milyar TL (yıllık %87 büyüme). Sektör tahminleri 2026 için 5-6 milyar TL diyor. Pazar büyüyor ve işlemlerden %10 pay almak anlamlı bir gelir potansiyeli demek.

**Konumlandırma cümlesi önerisi:** *"Influencer'ların dijital menajeri: Spam'i süzer, sözleşmeni tarar, paranı garanti altına alır."*

**Savunma hendeği (rakiplerin kolay kopyalayamayacağı şey):**
1. Üretici güveni ve topluluk (Kurucu Üye programı).
2. Escrow'dan geçen işlem ve teslim geçmişi verisi (kim zamanında öder, kim teslim eder: **marka güvenilirlik puanı**). Bu, "üreticinin tarafında" olmanın somut kanıtı olur.
3. Türkiye'ye özel vergi ve ödeme uyumu.

---

## 5. Gelir Modeli: Revize Öneri

### 5.1 Birim ekonomisi örneği (tek işlem, 20.000 TL'lik işbirliği)

| Kalem | Fikir dokümanı (%4) | Öneri (marka %10 + üretici %3) |
|---|---|---|
| Markanın ödediği | 20.000 TL | 22.000 TL |
| Ödeme altyapısı maliyeti (~%4,29 varsayım) | ~858 TL | ~944 TL |
| Platform geliri | 800 TL | 2.000 + 600 = 2.600 TL |
| **Net katkı** | **≈ -58 TL (zarar)** | **≈ +1.656 TL** |

*Not: PayTR veya pazarlıkla daha düşük oran alınırsa tablo iyileşir, ama %3-5 komisyon her durumda çok ince bir marj bırakır.*

### 5.2 Önerilen fiyatlandırma

| Kullanıcı | Paket | Fiyat önerisi |
|---|---|---|
| Üretici | Ücretsiz | Profil, temel Gatekeeper, ayda 1 sözleşme taraması, ayda 2 Collab-Match |
| Üretici | Pro | ~399-799 TL/ay (yıllıkta indirim): sınırsız tarama, dinamik medya kiti, vergi asistanı, sınırsız eşleşme |
| Üretici | Kurucu Üye (ilk 100) | Ömür boyu Pro + escrow'da %0 üretici kesintisi |
| Marka | Kullandıkça öde | Teklif başına jeton (ör. 1 jeton ≈ 100-250 TL), escrow hizmet bedeli %10-12 |
| Marka/Ajans | Premium | Aylık abonelik, escrow bedeli %6-8'e düşer, toplu kampanya, analitik |

**Gerçekçi gelir beklentisi:** İlk 12 ayda ana gelir **escrow hizmet bedeli + jeton** olacaktır. Üretici abonelikleri (özellikle oyun nişinde ödeme isteği düşük) destekleyici gelirdir. Asıl ödeme yapan taraf markadır.

---

## 6. Ürün Mimarisi ve Teknoloji Önerisi

### 6.1 Modüllerin teknik karşılığı

| Modül | Nasıl yapılır? | Zorluk |
|---|---|---|
| **Gatekeeper** | 1) Kural motoru: min. bütçe, yasaklı sektörler (bahis, kripto vb.), içerik türleri, takvim. 2) LLM: serbest metin teklifi yapılandırılmış alanlara çevirir ve kurala uyumu puanlar. 3) Uymayan teklif otomatik nazik retle döner (jeton kısmi iadesi kurala bağlı) | Düşük-Orta |
| **Standart Teklif Formu + çift onay** | Zorunlu alanlar: bütçe, teslimatlar, kullanım hakkı süresi, yayın tarihi, revizyon sayısı. Üretici "kabul / karşı teklif / ret" der; ikisi de onaylarsa sohbet ve sözleşme açılır | Düşük |
| **Jeton** | Ön ödemeli kredi, iyzico ile satın alma, defter (ledger) tablosu | Düşük |
| **Escrow** | iyzico/PayTR Pazaryeri; durum makinesi: Teklif → Onay → Ödeme alındı → İçerik teslim → Yayın doğrulandı → Marka onayı / 72 saat otomatik onay → Para üreticide. İtiraz durumunda manuel inceleme | Orta-Yüksek |
| **AI Sözleşme Tarayıcı** | PDF → metin (OCR gerekirse) → kişisel veri maskeleme → LLM ile madde madde sınıflandırma (cezai şart, süresiz kullanım, münhasırlık, telif devri, ödeme vadesi, fesih) → renkli risk raporu. Türkçe hukuk metinleriyle test seti hazırlanmalı | Orta |
| **Dinamik Medya Kiti** | OAuth bağlantıları, periyodik senkronizasyon (kuyruk/cron), markaya özel paylaşılabilir link, "API doğrulandı" rozetleri, PDF çıktısı | Orta |
| **Collab-Match** | v1: niş, büyüklük kademesi, dil/ülke, demografi benzerliği **ama** kitle örtüşmesinin az olması (büyüme için iyi). v2: tamamlanan collab'lerin sonuç verisiyle (takipçi kazanımı) öğrenen model | v1 Düşük, v2 Yüksek |
| **Marka güvenilirlik puanı** | Ödeme hızı, itiraz oranı, üretici puanları | Düşük (veri gelince) |

### 6.2 Teknoloji yığını önerisi (küçük ekip, hızlı MVP)
- **Ön yüz:** Next.js + TypeScript (web öncelikli, mobil uyumlu). Native mobil uygulama 2. yılda.
- **Arka uç:** Node.js (NestJS veya Next.js API) ya da Python (FastAPI). AI işleri ağırlıklıysa Python mantıklı.
- **Veritabanı:** PostgreSQL (ör. Supabase veya yönetilen Postgres). Kimlik doğrulama, dosya depolama hazır gelir.
- **Arka plan işleri:** Redis + kuyruk (BullMQ / Celery). Sosyal medya senkronizasyonu, PDF analizi için.
- **AI:** Kurumsal LLM API (OpenAI / Anthropic / Google), yapılandırılmış JSON çıktı, veri saklamama anlaşması. Maliyet: sözleşme başına kuruşlar-birkaç TL düzeyi.
- **Ödeme:** iyzico Pazaryeri (alternatif PayTR).
- **Altyapı:** AWS/GCP Frankfurt veya Türkiye'de bulut. KVKK aydınlatma ve aktarım belgeleriyle.
- **Ürün analitiği ve hata takibi:** PostHog, Sentry.

---

## 7. Revize Yol Haritası

Orijinal plan mantıklı ama gelir ve doğrulama adımları geç kalıyor. Önerilen sıra:

### Aşama 0: Doğrulama (0.-1. ay), kod yazmadan
- 25-30 oyun/e-spor yayıncısı ile görüşme (10K-500K takipçi aralığı): "Son 12 ayda geç ödeme, kötü sözleşme, spam teklif yaşadın mı? Ne kadar ödersin?"
- 10 marka/ajans pazarlamacısı ile görüşme: "%10 hizmet bedeli ile garantili teslim ve doğrulanmış veri ister misin?"
- Landing page + bekleme listesi + "Ücretsiz sözleşme kontrolü" formu (arka planda manuel veya basit LLM ile). Talep ölçümü.
- **Concierge MVP:** 3-5 işbirliğini elle eşleştir, iyzico linkiyle ödemeyi al, elle yönet. Para akışının gerçekten çalıştığını gör.
- Şirket kuruluşu (Ltd/A.Ş.), iyzico/PayTR pazaryeri başvurusu, **Meta App Review ve Google OAuth doğrulaması başvurusu** (uzun sürer, erkenden).

### Aşama 1: MVP (2.-4. ay)
- Üretici profili + Instagram, YouTube, Twitch, Kick bağlantıları (TikTok temel profil)
- Dinamik medya kiti v1 (paylaşılabilir link)
- Gatekeeper v1 (kural motoru + LLM ile teklif ayrıştırma)
- Standart Teklif Formu + çift onay
- **AI Sözleşme Tarayıcı v1** (ücretsiz pakette ayda 1 tarama = üye kazanma kancası)
- Basit marka paneli ve jeton satın alma

### Aşama 2: Kapalı Beta ve Tohumlama (4.-6. ay)
- 100 Kurucu Üye oyun yayıncısı (Discord topluluğu, e-spor turnuvaları, yayıncı ajansları üzerinden)
- 10-20 pilot marka (oyun donanımı, enerji içeceği, oyun içi para, VPN, oyun yayıncıları): **ilk işlemlerde escrow bedeli indirimli**
- Escrow v1 canlıya (concierge'den ürüne geçiş)

### Aşama 3: Monetizasyon (6.-9. ay)
- Pro abonelik, marka Premium
- Collab-Match v1
- Marka güvenilirlik puanı, vergi asistanı
- İtiraz/uyuşmazlık süreci, destek ekibi

### Aşama 4: Ölçekleme (9.-12. ay+)
- Yeni nişler (güzellik, finans, yaşam tarzı): her niş için ayrı topluluk lansmanı
- Collab-Match v2 (öğrenen model), ajans çoklu hesap yönetimi
- Mobil uygulama, bölge dışı genişleme (MENA / Azerbaycan gibi yakın pazarlar)

### İzlenecek temel metrikler
- Aktif üretici sayısı ve hesap bağlama oranı
- Teklif → kabul oranı (Gatekeeper kalitesi)
- Escrow'dan geçen aylık işlem hacmi (GMV) ve platform net geliri
- Ödeme süresi (hedef: yayın onayından sonra ≤ 3 iş günü)
- Markanın tekrar teklif verme oranı
- Taranan sözleşme sayısı ve ücretsizden Pro'ya geçiş oranı

---

## 8. Ekip: İçeride mi, Dış Kaynak mı?

### Karşılaştırma

| Kriter | Tamamen dış kaynak (ajans) | Tamamen içeride | **Hibrit (öneri)** |
|---|---|---|---|
| Başlangıç hızı | Hızlı | Yavaş (işe alım) | Orta-Hızlı |
| Başlangıç maliyeti | Yüksek peşin ödeme | Maaş yükü | Hisse + düşük nakit |
| Ürün iterasyonu (beta geri bildirimleri) | Yavaş, her değişiklik ek teklif | Çok hızlı | Hızlı |
| Fintech/AI bilgisinin şirkette kalması | Kalmaz | Kalır | Kalır |
| Yatırımcı gözünde | Zayıf ("teknik ekip yok") | Güçlü | Güçlü |
| Risk | Ajans bağımlılığı, kod kalitesi | Yanlış işe alım | Doğru kurucu ortağı bulmak |

### Öneri
1. **Teknik kurucu ortak (CTO), hisseyle.** Escrow durum makinesi, API entegrasyonları ve AI katmanı sürekli değişecek. Bu kararları veren kişi şirketin içinde olmalı. Fintech/ödeme entegrasyonu veya pazaryeri deneyimi olan biri ideal.
2. **İlk 6 ay ekip:** CTO + 1 full-stack geliştirici + yarı zamanlı/serbest UI/UX tasarımcı. Mümkünse 1 topluluk yöneticisi (oyun dünyasından).
3. **Dışarı verilebilecekler:** Marka kimliği ve UI tasarımı, landing page, ileride native mobil uygulama, sızma testi (güvenlik denetimi), hukuk ve mali müşavirlik.
4. **Teknik kurucu ortak bulunamazsa:** MVP'yi sabit kapsamlı bir ajansa yaptırın ama **kaynak kodu sizde, dokümantasyon şartı, sözleşmede devir maddesi** olsun ve paralelde CTO aramaya devam edin. Ajans seçerken iyzico pazaryeri entegrasyonu daha önce yapmış olmasını şart koşun.

### Kabaca bütçe çerçevesi (tahmini, teklif alarak doğrulayın)
- **Hibrit ekip, ilk 6 ay:** CTO hisseli + düşük maaş, 1 geliştirici, serbest tasarım, bulut/LLM/API maliyetleri, hukuk/mali müşavir. Ayda yaklaşık 4-8 bin USD aralığında bir yanma oranı makul bir başlangıç varsayımı.
- **Ajans ile MVP:** Kapsama göre kabaca 30-100 bin USD; sonrasında bakım ve geliştirme için aylık ek maliyet.
- **Değişken maliyetler:** LLM sözleşme analizi işlem başına çok düşük; asıl maliyet kalemleri insan (ekip) ve pazarlama/topluluk.

---

## 9. Riskler ve Önlemler

| Risk | Olasılık | Etki | Önlem |
|---|---|---|---|
| Tavuk-yumurta (marka yok ↔ üretici yok) | Yüksek | Yüksek | Önce üreticiye tek başına değer veren araçlar (sözleşme tarama, medya kiti); marka tarafını concierge ile başlat |
| Platform dışında anlaşma (komisyondan kaçış) | Yüksek | Yüksek | Escrow'un değeri net olsun (ödeme garantisi, vergi kolaylığı, marka puanı); üreticiye düşük kesinti; ilk iletişimde iletişim bilgisi paylaşımını gizle |
| Meta/TikTok API politikası değişikliği | Orta | Yüksek | Çoklu platform, "üretici beyanı + doğrulama" yedeği, API'ye tek başına bağımlı olmayan değer önerisi |
| Avukatlık tekeli / KVKK şikâyeti | Orta | Orta-Yüksek | Ürün dili, uyarılar, avukat ağı, veri maskeleme, hukukçu incelemesi |
| Ödeme sağlayıcısının hizmeti kesmesi | Düşük-Orta | Yüksek | İki sağlayıcıyla görüşme, uyumlu KYC süreçleri |
| Uyuşmazlık yükü (içerik brief'e uygun değil) | Orta | Orta | Net teslim kriterleri formda, revizyon hakkı, zaman aşımlı otomatik onay, basit hakemlik kuralları |
| Oyun nişinde ödeme isteğinin düşük olması | Orta | Orta | Gelir marka tarafında; üretici için ücretsiz katman cömert |
| Rakiplerin "üretici koruması" özelliklerini kopyalaması | Orta | Orta | Topluluk ve marka güvenilirlik verisi; hız |

---

## 10. Hemen Atılacak İlk 10 Adım

1. Konumlandırma cümlesini ve ilk nişi (oyun/e-spor) kesinleştir.
2. 25-30 yayıncı + 10 marka görüşmesi için soru listesini hazırla ve görüşmeleri yap.
3. Landing page + bekleme listesi + ücretsiz sözleşme kontrolü formu yayına al.
4. Şirketi kur; iyzico ve PayTR'den pazaryeri teklifi iste.
5. Meta Developer, Google Cloud (YouTube API), TikTok Developer, Twitch ve Kick geliştirici hesaplarını aç; uygulama doğrulama süreçlerini başlat.
6. Bir bilişim/fintech avukatından şu dört konu için görüş al: escrow akışı, jeton yapısı, AI sözleşme tarayıcının dili, KVKK aktarım belgeleri.
7. Mali müşavirle 20/B istisna akışını ve platform faturalandırmasını netleştir.
8. Teknik kurucu ortak arayışını başlat (fintech/pazaryeri deneyimi).
9. 3-5 işbirliğini concierge yöntemle elle yürüt; para akışını ve uyuşmazlıkları gözlemle.
10. Görüşme ve concierge sonuçlarına göre MVP kapsamını dondur, 12 haftalık geliştirme sprintlerini planla.

---

## Kaynaklar
- Instagram Platform Insights API: https://developers.facebook.com/docs/instagram-platform/insights/
- Instagram Account Insights (demografi kısıtları): https://developers.facebook.com/docs/instagram-platform/api-reference/instagram-user/insights
- TikTok Research API uygunluk kriterleri: https://developers.tiktok.com/products/research-api
- TikTok Display API: https://developers.tiktok.com/docs/en/display-api-get-started
- TikTok One Creator Marketplace Discover: https://business-api.tiktok.com/portal/docs/discover-tto-creators/v1.3
- YouTube Analytics kanal raporları: https://developers.google.com/youtube/analytics/channel_reports
- Twitch API referansı: https://dev.twitch.tv/docs/api/reference
- Kick Public API: https://github.com/KickEngineering/kickdevdocs
- 6493 sayılı Kanun (TCMB): https://tcmb.gov.tr
- iyzico Pazaryeri dokümantasyonu: https://docs.iyzico.com/urunler/pazaryeri
- iyzico pazaryeri satıcı sözleşmesi: https://www.iyzico.com/pazaryeri-satici-anlasma
- PayTR Pazaryeri: https://www.paytr.com/pazaryeri-cozumu
- GİB 2026 Sosyal İçerik Üreticiliği İstisnası rehberi: https://cdn.gib.gov.tr
- TBB Avukatlar İçin Yapay Zeka Kullanımı Tavsiye Rehberi (2026): https://www.hukukihaber.net/tbbden-avukatlar-icin-yapay-zeka-kullanimi-tavsiye-rehberi
- Yapay zeka ve avukatlık tekeli: https://www.hukukihaber.net/yapay-zeka-ve-avukatlik-tekeli-bir-ihlal-mi-yoksa-hukukun-evrimi-mi
- Collabstr fiyatlandırma: https://collabstr.com/pricing
- Passionfroot fiyatlandırma: https://help.passionfroot.me/en/articles/11552638-pricing
- IAB Türkiye 2024 ilk yarı medya yatırımları: https://iabtr.org
- Teamfluencer: https://teamfluencer.co/tr
- CreatorTR: https://creatortr.com/

*Uyarı: Bu rapor hukuki veya mali danışmanlık değildir. Escrow, jeton, vergi ve AI sözleşme tarayıcı kurguları uygulamaya alınmadan önce ilgili uzmanlara teyit ettirilmelidir. Bütçe rakamları kaba tahmindir.*
