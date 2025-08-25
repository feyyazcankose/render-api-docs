### Config Örnekleri (Farklı Sayfa Tipleri)

Bu doküman, farklı config türlerinin nasıl tanımlandığını ve kullanıldığını gösterir.

### 1. Şirket Config (Basit Yapı)

#### Şirket Sayfası Ayarları

```ts
// company.module.ts
export const CompanyConfigModule: IConfigModuleProps = {
  provider: {
    companies: {  // Sayfa tipi
      client: CompanyDetailClient,
      server: CompanyDetailServer,
    },
  },
  config: {
    values: {
      companyName: "string",
      phoneNumber: "string",
      email: "string",
      address: "string",
      logoImage: "string",
      bannerImage: "string",
      content: "string",
    },
    schema: {
      id: "config-companies",
      key: "companies",
      type: "companies",
      label: { name: "Şirket Sayfası" },
      schema: {
        title: "Şirket Sayfası",
        on: "Drawer",
        items: [
          {
            type: "string",
            key: "companyName",
            label: "Şirket Adı",
            required: true,
          },
          {
            type: "string",
            key: "phoneNumber",
            label: "Telefon",
            required: true,
          },
          {
            type: "string",
            key: "email",
            label: "E-posta",
            required: true,
          },
          {
            type: "textArea",
            key: "address",
            label: "Adres",
            required: true,
          },
          {
            type: "image",
            key: "logoImage",
            label: "Logo",
            required: true,
          },
          {
            type: "image",
            key: "bannerImage",
            label: "Banner",
            required: true,
          },
          {
            type: "richText",
            key: "content",
            label: "Şirket Açıklaması",
            required: true,
          },
        ],
      },
    },
  } as any,
};
```

**Ne işe yarar?**
- Her şirket sayfası için aynı form yapısı
- Logo, banner, iletişim bilgileri
- Şirket açıklaması

### 2. Sözleşme Config (Backend Veri + Form)

#### Sözleşme Sayfası Ayarları

```ts
// contract.module.ts
export const ContractConfigModule: IConfigModuleProps = {
  provider: {
    contract: {  // Sayfa tipi
      client: ContractConfigClient,
      server: ContractConfigServer,
    },
  },
  config: {
    values: {
      title: "string",
      content: "string",
      bannerImage: "string",
      terms: "string",
      isActive: "boolean",
    },
    schema: {
      id: "config-contract",
      key: "contract",
      type: "contract",
      isLoadBackendData: true, // Backend'den veri gelecek
      schema: {
        title: "Sözleşme Sayfası",
        on: "Drawer",
        items: [
          {
            type: "string",
            key: "title",
            label: "Sayfa Başlığı",
            required: true,
          },
          {
            type: "richText",
            key: "content",
            label: "Sözleşme Metni",
            required: true,
          },
          {
            type: "image",
            key: "bannerImage",
            label: "Banner Görseli",
            required: true,
          },
          {
            type: "textArea",
            key: "terms",
            label: "Şartlar ve Koşullar",
            required: false,
          },
          {
            type: "boolean",
            key: "isActive",
            label: "Sözleşme Aktif mi?",
            defaultValue: true,
          },
        ],
      },
    },
  } as any,
};
```

**Ne işe yarar?**
- Sözleşme metni düzenleme
- Banner görseli
- Aktif/pasif durumu
- Şartlar ve koşullar

### 3. Blog Config (Kategori + Ayarlar)

#### Blog Sayfası Ayarları

```ts
// blog.module.ts
export const BlogConfigModule: IConfigModuleProps = {
  provider: {
    blog: {  // Sayfa tipi
      client: BlogConfigClient,
      server: BlogConfigServer,
    },
  },
  config: {
    values: {
      pageTitle: "string",
      pageDescription: "string",
      postsPerPage: "number",
      categories: "array",
      featuredImage: "string",
      sidebarEnabled: "boolean",
    },
    schema: {
      id: "config-blog",
      key: "blog",
      type: "blog",
      schema: {
        title: "Blog Sayfası",
        on: "Drawer",
        items: [
          {
            type: "string",
            key: "pageTitle",
            label: "Sayfa Başlığı",
            required: true,
          },
          {
            type: "textArea",
            key: "pageDescription",
            label: "Sayfa Açıklaması",
            required: true,
          },
          {
            type: "number",
            key: "postsPerPage",
            label: "Sayfa Başına Yazı",
            defaultValue: 10,
            required: true,
          },
          {
            type: "array",
            key: "categories",
            label: "Blog Kategorileri",
            schema: {
              title: "Kategori",
              on: "Modal",
              isDraggable: true,
              items: [
                {
                  type: "string",
                  key: "name",
                  label: "Kategori Adı",
                  required: true,
                },
                {
                  type: "string",
                  key: "slug",
                  label: "Kategori URL",
                  required: true,
                },
                {
                  type: "image",
                  key: "icon",
                  label: "Kategori İkonu",
                  required: false,
                },
              ],
            },
          },
          {
            type: "image",
            key: "featuredImage",
            label: "Varsayılan Görsel",
            required: false,
          },
          {
            type: "boolean",
            key: "sidebarEnabled",
            label: "Kenar Çubuğu Aktif",
            defaultValue: true,
          },
        ],
      },
    },
  } as any,
};
```

**Ne işe yarar?**
- Blog sayfası genel ayarları
- Kategori yönetimi
- Sayfa başına yazı sayısı
- Kenar çubuğu kontrolü

### 4. E-ticaret Config (Ürün + Ödeme)

#### E-ticaret Sayfası Ayarları

```ts
// ecommerce.module.ts
export const EcommerceConfigModule: IConfigModuleProps = {
  provider: {
    ecommerce: {  // Sayfa tipi
      client: EcommerceConfigClient,
      server: EcommerceConfigServer,
    },
  },
  config: {
    values: {
      storeName: "string",
      currency: "string",
      taxRate: "number",
      shippingOptions: "array",
      paymentMethods: "array",
      returnPolicy: "string",
      contactInfo: "object",
    },
    schema: {
      id: "config-ecommerce",
      key: "ecommerce",
      type: "ecommerce",
      schema: {
        title: "E-ticaret Ayarları",
        on: "Drawer",
        items: [
          {
            type: "string",
            key: "storeName",
            label: "Mağaza Adı",
            required: true,
          },
          {
            type: "select",
            key: "currency",
            label: "Para Birimi",
            options: [
              { label: "TL", value: "TRY" },
              { label: "USD", value: "USD" },
              { label: "EUR", value: "EUR" },
            ],
            defaultValue: "TRY",
            required: true,
          },
          {
            type: "number",
            key: "taxRate",
            label: "Vergi Oranı (%)",
            defaultValue: 18,
            required: true,
          },
          {
            type: "array",
            key: "shippingOptions",
            label: "Kargo Seçenekleri",
            schema: {
              title: "Kargo Seçeneği",
              on: "Modal",
              items: [
                { type: "string", key: "name", label: "Kargo Adı" },
                { type: "number", key: "price", label: "Fiyat" },
                { type: "number", key: "days", label: "Teslimat Süresi (Gün)" },
              ],
            },
          },
          {
            type: "array",
            key: "paymentMethods",
            label: "Ödeme Yöntemleri",
            schema: {
              title: "Ödeme Yöntemi",
              on: "Modal",
              items: [
                { type: "string", key: "name", label: "Yöntem Adı" },
                { type: "boolean", key: "enabled", label: "Aktif" },
                { type: "image", key: "icon", label: "Yöntem İkonu" },
              ],
            },
          },
          {
            type: "richText",
            key: "returnPolicy",
            label: "İade Politikası",
            required: false,
          },
          {
            type: "translation",
            key: "contactInfo",
            label: "İletişim Bilgileri",
            schema: {
              items: [
                { type: "string", key: "phone", label: "Telefon" },
                { type: "string", key: "email", label: "E-posta" },
                { type: "textArea", key: "address", label: "Adres" },
              ],
            },
          },
        ],
      },
    },
  } as any,
};
```

**Ne işe yarar?**
- Mağaza genel ayarları
- Para birimi ve vergi
- Kargo ve ödeme seçenekleri
- İade politikası
- Çok dilli iletişim bilgileri

### 5. Hızlı Karar Rehberi

**Basit config (sadece temel bilgiler):**
- Şirket, kişisel sayfa
- Sadece string, image, textArea alanları

**Orta config (liste + ayarlar):**
- Blog, haber sayfası
- Array alanları + basit ayarlar

**Karmaşık config (çok dilli + detaylı):**
- E-ticaret, kurumsal site
- Translation + array + select alanları

### 6. Kontrol Listesi

- [ ] `provider` anahtarı ile `config.key` aynı mı?
- [ ] `values` alanları ile `schema.items` eşleşiyor mu?
- [ ] Gerekli alanlar `required: true` işaretlendi mi?
- [ ] Array alanları için alt şema tanımlandı mı?
- [ ] Çok dilli alanlar için `translation` kullanıldı mı?
- [ ] Modül `ConfigModulesExport` listesine eklendi mi?

<br/><br/>
<br/><br/>
