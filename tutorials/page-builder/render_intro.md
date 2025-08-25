### Render (Page Builder) Nedir?

Page Builder, sayfayı LEGO gibi parçalara ayırıp bu parçaları (bölümleri) kolayca birleştirmenizi sağlar. Her parça için bir “tarif” (şema) vardır; editör bu tarife bakarak size bir form açar. Siz formu doldurursunuz, sistem doğru bileşeni ekrana getirir.

Günlük hayat benzetmesi: Bir restoran düşünün.

- Menüdeki her yemek bir “bölüm”dür.
- Yemeğin tarifi “şema”dır (hangi malzeme, nasıl pişecek).
- Garson “render” katmanıdır; siparişi doğru yemeğe yönlendirir.

### Ne işe yarar?

- Kod yazmadan içerik değiştirmenize yardım eder.
- Sayfaları modüler hale getirir; her bölüm bağımsız geliştirilebilir.
- Yeni bölüm eklemek kolaydır: tarif (render) → görünüm (ui) → eşleme (module) → listeye ekle.

### Mimaride nerededir?

- Bölümler (Sections): `src/@renders/sections/*`
- Ekrana basma (Render): `src/components/Builder/renders/SectionRender.tsx`
- Tüm bölüm listesi: `src/@renders/sections/modules.export.ts`
- Konfigürasyon sayfaları: `src/components/Builder/renders/ConfigRender.tsx`, modülleri `src/@renders/configs/*`

Kısa not: `SectionRender`, bölümün `key` alanına bakarak doğru bileşeni bulur ve aktif dile uygun veriyi geçirir.

### 5 Dakikada Anla

1. Her bölüm bir parça, her parçanın bir tarifi (şeması) var.
2. Tarif (render) → Görünüm (ui) → Eşleme (module) → Listeye ekle (modules.export).
3. `SectionRender`, sayfadaki `sections` listesini gezer ve her parça için `key` ile doğru bileşeni çağırır.

### Ne yapmam lazım? (Hızlı Rehber)

- Yeni bölüm istiyorsan: önce render’ını yaz, sonra UI’ını çiz, modülde bağla, listeye ekle.
- Tüm sayfa ayarı gerekiyorsa: config modülü yaz ve `ConfigRender` ile göster.

### Kontrol Listesi

- Bölüm `key`’i benzersiz mi?
- Modül `provider` içinde aynı `key` ile eşleme yaptın mı?
- `modules.export.ts` içinde modülü ekledin mi?

<br/><br/>
<br/><br/>
