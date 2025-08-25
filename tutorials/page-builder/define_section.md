### Section (Bölüm) Nasıl Tanımlanır?

Bir bölüm 3 dosyadan oluşur: tarif (render), görünüm (ui), eşleme (module). Son olarak merkezi listeye eklenir.

### Kısacık Özet (4 Adımda)

1. `render` dosyasıyla tarifi yaz: hangi alanlar var, varsayılan veri ne.
2. `ui` dosyasıyla ekranı çiz: gelen `data`’yı ekranda göster.
3. `module` dosyasıyla anahtarı (`key`) doğru UI’a bağla.
4. `modules.export.ts`’e modülü ekle ki editörde görünsün.

### Sıfırdan Başlayanlar İçin (Adım Adım)

1. Klasörü oluşturun

```
src/@renders/sections/base/
  base.render.ts
  base.ui.tsx
  base.module.ts
```

2. `base.render.ts` dosyasını oluşturun (tarif). Aşağıdaki örneği yapıştırın ve `key`, alan isimlerini ihtiyacınıza göre değiştirin.

1) Tarif — `<name>.render.ts`

```ts
import { IAvailableSection } from "@/components/Builder/core/types/available-section.interface";
import { ISectionDataProvider } from "@/components/Builder/core/types/section-data-provider.interface";

export interface IBaseData {
  title: string;
  description: string;
}

export const BaseRender: IAvailableSection<ISectionDataProvider<IBaseData>> = {
  key: "base",
  type: "base",
  label: { name: "Temel Bölüm" },
  defaultData: {
    tr: { title: "Başlık", description: "Açıklama" },
    en: { title: "Title", description: "Description" },
  },
  schema: {
    title: "Temel Bölüm",
    on: "Drawer",
    isDraggable: false,
    items: [
      { type: "string", key: "title", label: "Başlık", required: true },
      { type: "richText", key: "description", label: "Açıklama" },
    ],
  },
};
```

- Açıklama:
  - `key`: Bölümün benzersiz anahtarı; modül eşleşmesi ve sayfa verisi bu anahtarla yapılır.
  - `type`: Bilgi amaçlı tür adı; analitik/okunabilirlik için kullanışlıdır.
  - `defaultData`: Çok dillilik için başlangıç verileri (`tr`, `en`).
  - `schema.items`: Editörde açılacak form alanları. Burada `title` bir `string`, `description` bir `richText` alanıdır.
  - `on: "Drawer"`: Formun çekmece içinde açılacağını, `isDraggable` ise sıralanabilirlik durumunu belirtir.

3. `base.ui.tsx` dosyasını oluşturun (görünüm). Aşağıdakini yapıştırın. `data` doğrudan render dosyanızdaki alanları taşır.

2) Görünüm — `<name>.ui.tsx`

```tsx
import { UiPropsContainer } from "@/components/Builder/core/types/ui-props-container.interface";

export default function BaseSection({
  data,
  activeLanguage,
}: UiPropsContainer<IBaseData> & { activeLanguage: string }) {
  return (
    <section>
      <h3>{data.title}</h3>
      <div dangerouslySetInnerHTML={{ __html: data.description }} />
    </section>
  );
}
```

- Açıklama:
  - `UiPropsContainer<IBaseData>`: `SectionRender` aktif dil verisini seçerek `data` prop’una geçirir.
  - `activeLanguage`: Dil bilgisini UI bileşenine verir (gerekirse locale bazlı davranışlar uygulanabilir).
  - `dangerouslySetInnerHTML`: `richText` içeriğini HTML olarak basmak için kullanılır (kaynağın güvenli olduğundan emin olun).

4. `base.module.ts` dosyasını oluşturun (eşleme). Aşağıdakini yapıştırın. Burada `BaseRender.key` ile UI’ı bağlıyoruz.

3) Eşleme — `<name>.module.ts`

```ts
import { IModuleProps } from "@/@renders/sections/module.interface";
import BaseSection from "./base.ui";
import { BaseRender } from "./base.render";

export const BaseModule: IModuleProps = {
  provider: {
    [BaseRender.key]: { client: BaseSection, server: BaseSection },
  },
  render: BaseRender,
};
```

- Açıklama:
  - `provider`: `[BaseRender.key]` ile bölüm anahtarını doğru UI bileşenlerine bağlar.
  - `client`/`server`: İhtiyaca göre istemci ve/veya sunucu sürümü tanımlanır. Yoksa ilgili tarafta render edilmez.
  - `render`: Bu modülün tarif nesnesi; editör kataloğu ve doğrulama için kullanılır.

5. Merkezi listeye ekleyin. Aşağıdaki gibi `src/@renders/sections/modules.export.ts` içine modülü ekleyin.

4) Merkezi liste — `src/@renders/sections/modules.export.ts`

```ts
import { BaseModule } from "./base/base.module";

export const SectionModulesExport = [
  // ...diğer modüller
  BaseModule,
];
```

- Açıklama:
  - Bu listeye eklenen her modül, `SectionRender` tarafından otomatik olarak görülebilir hale gelir.
  - İçe aktarma yollarının doğru olduğundan emin olun; eklemezseniz bölüm editörde görünmez.

### Bitti mi? Hızlı Kontrol Listesi

- Doğru klasörde 3 dosya var mı? `render`, `ui`, `module`
- `render.key` benzersiz mi ve `module.provider` içinde aynı anahtar kullanıldı mı?
- `modules.export.ts` dosyasına modülü eklediniz mi?
- `defaultData` hem `tr` hem `en` için tanımlı mı?
- `schema.items` alanlarının `key` değerleri, UI’da kullandığınız `data.<alan>` ile birebir aynı mı?

### Yaygın Hatalar ve Çözümleri

- Editörde bölümü göremiyorum
  - `modules.export.ts` dosyasına modülü eklemeyi atlamış olabilirsiniz.
- “Unknown section type/key” uyarısı alıyorum
  - `render.key` ile `module.provider` anahtarı uyuşmuyor olabilir.
- UI’da veri boş geliyor
  - `defaultData` tanımlanmamış olabilir veya `schema.items`’daki `key`’ler ile `data` alan adları eşleşmiyor olabilir.
- HTML direkt yazı gibi görünüyor
  - `richText` alanlarını basarken `dangerouslySetInnerHTML` kullanmayı unutmayın.

### Sonraki Adımlar (İsteğe Bağlı)

- Backend’ten veri çekmek istiyorsanız `isLoadBackendData: true` kullanın ve `@section.api.ts` dokümanına göz atın.
- Tekrarlı veri girecekseniz `type: "array"` ile alt şema oluşturun.
- Çok sayıda çeviri anahtarınız varsa `type: "translation"` alanı ile alt form tanımlayın.

Günlük hayat benzetmesi: Tarif (render) yemeğin nasıl yapılacağını söyler; aşçı (ui) yemeği hazırlar; menü (modules.export) yemeyi listeler; garson (SectionRender) doğru tabağı masaya getirir.

<br/><br/>
<br/><br/>
