### Form Tipleri Nelerdir?

Bu projede alan tipleri şunlardır: `string`, `textArea`, `richText`, `number`, `boolean`, `select`, `color`, `image`, `icon`, `array`, `translation`.

Ortak özellikler: `key`, `label`, `required?`, `defaultValue?`, `placeholder?`, `isShowRule?`.

- string: Tek satır metin
- textArea: Çok satır metin
- richText: Zengin metin
- number: Sayı
- boolean: Aç/Kapat
- select: Seçim (options: [{label,value}])
- color: Renk seçimi
- image: Görsel seçimi
- icon: İkon seçimi
- array: İç içe form listesi (schema ile tanımlanır, `itemCapsuleField` destekler)
- translation: Anahtar-değer çeviri formu (schema ile tanımlanır)

### 3 Dakikada “Doğru Alanı Seç” Kılavuzu

- Kısa yazı: `string`
- Uzun yazı: `textArea` veya zengin içerik ise `richText`
- On/Off: `boolean`
- Liste içinden seçim: `select`
- Renk: `color`
- Görsel: `image`
- İkon: `icon`
- Tekrarlı öğeler: `array` (alt şema gerekir)
- Çeviri anahtarları: `translation` (alt şema gerekir)

### Form Tipleri ve Şema Özellikleri

Bu doküman, `@renders` içindeki tüm section ve config formlarında kullanılan alan (field) tiplerini ve ortak şema özelliklerini özetler. Amacımız, hiç bilmeyen birinin dahi yeni formlar tanımlayabilmesini sağlamaktır.

### 1) Şema (schema) Genel Yapısı

Her bölümün formu bir şema ile tanımlanır:

```ts
schema: {
  title: string;              // Form başlığı
  on: "Drawer" | "Modal";   // Formun nerede açılacağı
  isDraggable?: boolean;      // Liste alanlarında (array) sürükle-bırak
  isLoadBackendData?: boolean;// Backend’den veri çekileceğini işaretler (isteğe bağlı)
  itemCapsuleField?: {        // Kayıt başlığı için rozet (chip) alanı (opsiyonel)
    type: string;             // Örn: "string", "image"
    key: string;              // Örn: "title"
  };
  items: Field[];             // Alanların listesi
}
```

### 2) Ortak Alan (Field) Özellikleri

Tüm alan tiplerinde sık görülen ortak özellikler:

- `type`: Alan tipi (aşağıdaki listeden biri)
- `key`: Nesnede saklanacak alan adı
- `label`: Editörde gösterilen etiket
- `required?`: Zorunlu mu
- `defaultValue?`: Varsayılan değer
- `placeholder?`: Yardımcı metin
- `isShowRule?`: Koşullu gösterim kuralları

Koşullu gösterim (`isShowRule`) örneği:

```ts
{
  type: "array",
  key: "images",
  isShowRule: [
    { key: "useSlider", value: true, operator: "eq" }
  ],
  schema: { /* ... */ }
}
```

### 3) Desteklenen Alan Tipleri

- **string**: Tek satırlık metin.

  - Örnek: başlık, ad, URL, vb.
  - Ek özellikler (kullanıldığı yerler): `is_translation_keyword?: boolean` (çeviri anahtarları için işaretleyici)

- **textArea**: Çok satırlı metin.

  - Örnek: açıklama, uzun metinler.

- **richText**: Zengin metin editörü.

  - Örnek: içerik sayfaları, sözleşme metinleri.

- **number**: Sayısal değer.

  - Örnek: fiyat, ID, miktar.

- **boolean**: Açık/Kapalı anahtarı.

  - Örnek: “Başlığı gizle”, “Slider kullanılsın mı?”

- **select**: Seçim alanı.

  - Ek özellikler: `options: { label: string; value: string }[]`
  - Örnek: sekme seçimi, tür seçimi.

- **color**: Renk seçici.

  - Örnek: arka plan rengi.

- **image**: Görsel seçici/yükleyici.

  - Örnek: kapak görseli, kart görseli.

- **icon**: İkon seçici.

  - Örnek: sosyal medya ikonları.

- **array**: İç içe öğe listesi (tekrarlı alan seti).

  - Zorunlu: `schema` (alt form)
  - Alt şema: `{ title, on, isDraggable, itemCapsuleField?, items: Field[] }`
  - `itemCapsuleField` ile liste öğelerinin rozet başlığını belirleyebilirsiniz (örn. `key: "title"`).

- **translation**: Anahtar-değer bazlı çeviri alt formu.
  - Zorunlu: `schema` (çoğunlukla `string` alanlardan oluşur)
  - Çoğu örnekte her alt `string` alanı için `is_translation_keyword: true` kullanılır.

### 4) Örnekler (Gerçek Kullanımlardan)

- Koşullu gösterim (slider açıkken resim listesi):

```ts
{
  type: "boolean",
  key: "useSlider",
  label: "Slider kullanılsın mı?",
  defaultValue: true,
},
{
  type: "array",
  key: "images",
  label: "Resimler",
  isShowRule: [{ key: "useSlider", value: true, operator: "eq" }],
  schema: {
    title: "Resimler",
    on: "Modal",
    isDraggable: true,
    itemCapsuleField: { type: "image", key: "image" },
    items: [{ type: "image", key: "image", label: "Resim", required: true }],
  },
}
```

- Seçim alanı (`select`) seçenekleri:

```ts
{
  type: "select",
  key: "openTab",
  label: "Aktif Tab",
  options: [
    { label: "Arama", value: "rent" },
    { label: "Rezervasyon Sorgula", value: "question" },
    { label: "Rezervasyon İptal", value: "cancel" },
  ],
  defaultValue: "rent",
}
```

- Dizi (array) alt formu ve rozet alanı (`itemCapsuleField`):

```ts
{
  type: "array",
  key: "faq",
  label: "Soru ve Cevaplar",
  schema: {
    title: "Soru ve Cevaplar",
    on: "Modal",
    isDraggable: true,
    itemCapsuleField: { type: "string", key: "question" },
    items: [
      { type: "string", key: "question", label: "Soru", required: true },
      { type: "textArea", key: "answer", label: "Cevap", required: true },
    ],
  },
}
```

- Çeviri (translation) alt formu:

```ts
{
  type: "translation",
  key: "keywords",
  label: "Anahtar Kelimeler",
  schema: {
    title: "Anahtar Kelimeler",
    on: "Drawer",
    isDraggable: true,
    items: [
      { type: "string", key: "menu-car_rental", label: "Araç Kiralama | Çevirisi", is_translation_keyword: true },
      // ...diğer anahtarlar
    ],
  },
}
```

### 5) İpuçları

- `key` benzersiz ve veride aynı isimle yer almalı.
- `defaultValue` veriyi hızlı başlatmak için önemlidir (özellikle `translation` ve `array`).
- Uzun listelerde `isDraggable: true` ile sürükle-bırak sıralama açılır.
- `itemCapsuleField` liste öğelerinin kolay seçilmesini sağlar.
- Backend’e bağımlı bölümler için kök şemada `isLoadBackendData: true` kullanılabilir.

### Hızlı Kontrol

- Alan `key` adı veride birebir aynı mı?
- `required` gerçekten gerekli alanlarda mı işaretli?
- `defaultValue` hızlı başlangıç için verildi mi?

<br/><br/>
<br/><br/>

<br/><br/>
<br/><br/>
