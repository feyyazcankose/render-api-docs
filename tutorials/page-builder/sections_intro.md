### Sections (Bölümler) Nedir?

Bir sayfayı oluşturan modüler parçalardır. Örneğin: kahraman alanı (hero), blog listeleme (blog-paginate), SSS (faq), şirketler (companies).

### Ne işe yarar?

- İçeriği küçük parçalara böler; her parçayı ayrı ayrı yönetirsiniz.
- Her bölümün kendi verisi ve kendi görünümü vardır.
- Aynı bölümü farklı sayfalarda farklı verilerle kullanabilirsiniz.

### Projede nerededir?

- `src/@renders/sections/<name>/`
  - `<name>.render.ts`: Tarif/şema ve varsayılan veriler
  - `<name>.ui.tsx`: Görünüm (React bileşeni)
  - `<name>.module.ts`: `key` → bileşen eşlemesi (client/server)
- Tüm bölümlerin merkezi listesi: `src/@renders/sections/modules.export.ts`

Günlük hayat benzetmesi: LEGO parçaları. Her parça farklı bir şekil/görevde; istediğiniz düzende birleştirirsiniz.

### Hızlı Özet

1. Bölüm klasörü aç: `<name>.render.ts`, `<name>.ui.tsx`, `<name>.module.ts`.
2. `render` içinde alanları (formu) tanımla.
3. `ui` içinde veriyi ekranda göster.
4. `module` ile `key` → bileşen eşleşmesini yap.
5. `modules.export.ts` içine yeni modülü ekle.

### Sık Sorunlar

- Bölüm görünmüyor: `modules.export.ts` unutulmuş olabilir.
- Yanlış bileşen geliyor: `key` ile `provider` eşleşmesi hatalı olabilir.

<br/><br/>
<br/><br/>
