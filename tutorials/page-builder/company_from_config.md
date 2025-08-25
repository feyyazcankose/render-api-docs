### Config’den Veri Alan Section Nasıl Kurulur? (Company Örneği)

Amaç: `companies` bölümü, şirketlerin listesini config’ten/servisten alıp slider’da gösterir.

#### 1) Bölüm Tanımı — `company.render.ts`

```ts
export interface ICompaniesSectionData {
  title: string;
  description: string;
  link: string;
  linkText: string;
  companies?: {
    items: {
      slug: string;
      config: { logoImage: string; companyName: string };
    }[];
  };
}

export const Render = {
  key: "companies",
  type: "companies",
  isLoadBackendData: true, // 🔸 bu önemli: veri yüklenecek
  defaultData: {
    tr: {
      /* title, description, link, linkText */
    },
    en: {
      /* ... */
    },
  },
  schema: {
    /* string, richText alanları */
  },
};
```

#### 2) UI — `company.ui.tsx`

- Server bileşeni: `CompaniesSectionServer` doğrudan gelen veriyi kullanır.
- Client bileşeni: `CompaniesSectionClient`, `ApiPageListWithType("companies")` ile şirket listesini çeker ve server bileşenine geçirir.

```tsx
export const CompaniesSectionClient = ({ data, activeLanguage }) => {
  const [companies, setCompanies] = useState<any>();
  useEffect(() => {
    ApiPageListWithType("companies").then((res) => setCompanies(res.data));
  }, []);
  return (
    <CompaniesSectionServer
      data={{ ...data, companies }}
      activeLanguage={activeLanguage}
    />
  );
};
```

#### 3) Module — `company.module.ts`

```ts
export const CompanyModule = {
  provider: {
    [Render.key]: {
      client: CompaniesSectionClient,
      server: CompaniesSectionServer,
    },
  },
  render: Render,
};
```

#### 4) Backend’ten veri nasıl gelir?

`src/@renders/apis/section.api.ts` içinde `SectionApiFunctions["companies"]` tanımlıdır ve `ApiPageListWithType("companies")` çağrılır. Dönen veri, bölüm verisine `data.tr.companies` ve `data.en.companies` olarak enjekte edilir.

```ts
companies: {
  items: [ { slug, config: { logoImage, companyName } }, ... ]
}
```

Neden böyle? Çünkü “şirketler” sayfa tipi, config ile tanımlanan içerikleri barındırır. Bölüm bunu liste halinde gösterir; bu nedenle config’teki veriyi okuması gerekir.

Günlük hayat benzetmesi: Şirketler bir “ürün kataloğu” gibidir. Bölüm, kataloğu raflara dizer ve vitrine çıkarır.

### Hızlı Kontrol Listesi

- `Render.key === "companies"` mi?
- `company.module.ts` içinde provider doğru mu?
- `SectionApiFunctions["companies"]` tanımlı mı ve doğru endpoint’i çağırıyor mu?
- UI’da `companies.items` üzerinden map yapılırken `slug` ve `config.logoImage` alanları kullanılıyor mu?

<br/><br/>
<br/><br/>
