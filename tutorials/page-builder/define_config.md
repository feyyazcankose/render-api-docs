### Config Nasıl Tanımlanır? (Basit Anlatım)

Config, sayfa tipine özel ayar ekranlarıdır. Örneğin: "şirketler" sayfası için logo, isim, telefon gibi ayarlar.

### Ne Yapmam Gerekiyor? (3 Adımda)

#### 1. Klasör ve Dosyaları Oluştur

```
src/@renders/configs/company/
  company.module.ts
  company.client.tsx
  company.server.tsx
```

#### 2. Modül Dosyasını Yaz

`company.module.ts` içine şunu yazın:

```ts
import { IConfigModuleProps } from "@/@renders/configs/config-module.interface";
import CompanyClient from "./company.client";
import CompanyServer from "./company.server";

export const CompanyConfigModule: IConfigModuleProps = {
  provider: {
    companies: {
      // 🔸 Bu anahtar önemli: sayfa tipi
      client: CompanyClient,
      server: CompanyServer,
    },
  },
  config: {
    values: {
      companyName: "string",
      phoneNumber: "string",
      logoImage: "string",
      content: "string",
    },
    schema: {
      id: "config-companies",
      key: "companies", // 🔸 provider anahtarı ile aynı
      type: "companies", // 🔸 provider anahtarı ile aynı
      label: { name: "Şirket Sayfası" },
      description: "Şirket bilgileri",
      schema: {
        title: "Şirket Sayfası",
        on: "Drawer",
        isDraggable: false,
        items: [
          {
            type: "string",
            key: "companyName", // 🔸 values ile aynı
            label: "Şirket Adı",
            required: true,
          },
          {
            type: "string",
            key: "phoneNumber", // 🔸 values ile aynı
            label: "Telefon",
            required: true,
          },
          {
            type: "image",
            key: "logoImage", // 🔸 values ile aynı
            label: "Logo",
            required: true,
          },
          {
            type: "richText",
            key: "content", // 🔸 values ile aynı
            label: "Açıklama",
            required: true,
          },
        ],
      },
    },
  } as any,
};
```

#### 3. Listeye Ekle

`src/@renders/configs/modules.export.ts` içine ekleyin:

```ts
import { CompanyConfigModule } from "./company/company.module";

export const ConfigModulesExport = [
  // ...diğerleri
  CompanyConfigModule,
];
```

### Nasıl Çalışır?

1. Sayfa tipi `companies` olan bir sayfa açıldığında
2. `ConfigRender` bu sayfayı görür
3. `page.type === "companies"` kontrolü yapar
4. `CompanyConfigModule.provider["companies"]` bileşenini bulur
5. Doğru bileşeni (client veya server) çağırır

### Önemli Noktalar

- **`provider` anahtarı** = **`config.key`** = **`config.type`** = **sayfa tipi** olmalı
- **`values`** alanları = **`schema.items`** alanları olmalı
- **`key`** değerleri her yerde aynı olmalı

### Hızlı Kontrol

- [ ] `provider` anahtarı ile `config.key` aynı mı?
- [ ] `values` alanları ile `schema.items` alanları eşleşiyor mu?
- [ ] Modül `ConfigModulesExport` listesine eklendi mi?
- [ ] Client/Server bileşenleri doğru import edildi mi?

### Günlük Hayat Benzetmesi

Config, bir mağazanın "genel ayarlar" paneli gibidir:

- Mağaza adı, telefon, logo gibi temel bilgiler
- Bu bilgiler tüm mağaza sayfalarında kullanılır
- Her sayfa tipi için ayrı ayar paneli vardır

<br/><br/>
<br/><br/>
