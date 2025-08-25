### @section.api.ts — Bölüme Backend’den Veri Sağlamak

Bazı bölümler API’den veri ister (ör. `isLoadBackendData: true`). `src/@renders/apis/section.api.ts`, bölüm `key` değerine göre ilgili API’yi çağırır ve dönen veriyi bölüme enjekte eder.

Ana fikir:

```ts
export const SectionApiFunctions = {
  "blog-slider": {
    key: "blogs",
    func: async () => APIClient.get("/api/openoffice/blog"),
  },
  contract: {
    key: "contracts",
    func: async () => APIClient.get("/api/openoffice/page/list/contract"),
  },
  companies: {
    key: "companies",
    func: async () => ApiPageListWithType("companies"),
  },
  "car-rental-companies-page": {
    key: "companies",
    func: async () => ApiPageListWithType("companies"),
  },
};
```

Akış:

```ts
for (const section of sections) {
  const target = SectionApiFunctions[section.key];
  if (target) {
    const apiData = (await target.func()).data;
    // i18n yapısına uygun yerleştir
    if (!section.data) section.data = { tr: {}, en: {}, fallback: {} };
    if (section.data.tr && section.data.en) {
      section.data.tr[target.key] = apiData;
      section.data.en[target.key] = apiData;
    } else {
      section.data[target.key] = apiData;
    }
  }
}
```

Notlar:

- Bölüm `key` değeri ile `SectionApiFunctions` içindeki anahtar aynı olmalıdır.
- API’den dönen veri, bölüm verisi içine `target.key` adıyla konur (örn. `data.tr.companies`).
- Config için de benzer şekilde `page.type` üzerinden veri enjekte edilir.

Günlük hayat benzetmesi: Menüde “Günün Çorbası” var (dinamik). Garson, mutfağa sorup o günün çorbasını getirir (API’den çeker) ve masaya koyar (bölüm verisine ekler).

### Hızlı Rehber

1. Bölümünüz API verisine ihtiyaç duyuyorsa `isLoadBackendData: true` işaretleyin.
2. `SectionApiFunctions` içine bölüm `key`’inizle bir kayıt ekleyin; hangi endpoint’ten veri geleceğini tanımlayın.
3. Dönen verinin hangi alana yazılacağını `key` ile belirleyin (örn. `companies`, `blogs`).
4. `RendereSetApiData` sayfa yüklenirken bu verileri bölüm veri yapısına ekler.

<br/><br/>
<br/><br/>
