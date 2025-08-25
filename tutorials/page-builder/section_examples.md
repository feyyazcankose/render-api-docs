### Bölüm Örnekleri (Client vs Server + Backend Veri)

Bu doküman, farklı bölüm türlerinin nasıl çalıştığını ve backend verilerinin nasıl alındığını gösterir.

### 1. Basit Bölüm (Sadece Statik Veri)

#### Hero Bölümü — Sadece Server

```tsx
// hero.ui.tsx
export const HeroSectionServer = ({ data, activeLanguage }) => {
  return (
    <section>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
      <button>{data.buttonText}</button>
    </section>
  );
};

// hero.module.ts
export const HeroModule = {
  provider: {
    [HeroRender.key]: {
      server: HeroSectionServer, // Sadece server
    },
  },
  render: HeroRender,
};
```

**Ne zaman kullanılır?**
- Sadece statik veri (başlık, açıklama, buton metni)
- SEO önemli
- Hızlı yükleme gerekli

### 2. Dinamik Bölüm (Backend Veri + Client)

#### Blog Listesi — Backend'den Veri Çeken

```tsx
// blog-list.ui.tsx
export const BlogListServer = ({ data, activeLanguage }) => {
  // data.blogs backend'den gelir (section.api.ts ile)
  return (
    <section>
      <h2>{data.title}</h2>
      {data.blogs?.items?.map(blog => (
        <article key={blog.id}>
          <h3>{blog.title}</h3>
          <p>{blog.summary}</p>
        </article>
      ))}
    </section>
  );
};

export const BlogListClient = ({ data, activeLanguage }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Backend'den veri çek
    fetch('/api/blogs')
      .then(res => res.json())
      .then(data => {
        setBlogs(data.items);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <BlogListServer 
      data={{ ...data, blogs: { items: blogs } }}
      activeLanguage={activeLanguage}
    />
  );
};

// blog-list.module.ts
export const BlogListModule = {
  provider: {
    [BlogListRender.key]: {
      client: BlogListClient,   // Dinamik veri için
      server: BlogListServer,   // SSR için
    },
  },
  render: BlogListRender,
};
```

**Ne zaman kullanılır?**
- Backend'den dinamik veri gerekli
- Kullanıcı etkileşimi var
- Real-time güncelleme gerekli

### 3. Koşullu Bölüm (Backend Veri + Koşullu Gösterim)

#### Slider Bölümü — Koşullu Resim Listesi

```tsx
// slider.ui.tsx
export const SliderSection = ({ data, activeLanguage }) => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (data.useSlider) {
      // Sadece slider açıksa resimleri yükle
      fetch('/api/images')
        .then(res => res.json())
        .then(data => setImages(data.items));
    }
  }, [data.useSlider]);

  if (!data.useSlider) {
    return (
      <section style={{ backgroundColor: data.bgColor }}>
        <h2>{data.title}</h2>
        <p>{data.description}</p>
      </section>
    );
  }

  return (
    <section>
      <h2>{data.title}</h2>
      <div className="slider">
        {images.map(img => (
          <img key={img.id} src={img.url} alt={img.alt} />
        ))}
      </div>
    </section>
  );
};

// slider.render.ts
export const SliderRender = {
  key: "slider",
  schema: {
    items: [
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
        schema: { /* alt form */ },
      },
      {
        type: "color",
        key: "bgColor",
        label: "Arka plan rengi",
        isShowRule: [{ key: "useSlider", value: false, operator: "eq" }],
      },
    ],
  },
};
```

### 4. Çok Dilli Bölüm (Translation + Backend)

#### FAQ Bölümü — Çeviri + Backend Veri

```tsx
// faq.ui.tsx
export const FaqSection = ({ data, activeLanguage }) => {
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    // Backend'den FAQ listesi çek
    fetch(`/api/faqs?lang=${activeLanguage}`)
      .then(res => res.json())
      .then(data => setFaqs(data.items));
  }, [activeLanguage]);

  return (
    <section>
      <h2>{data.title}</h2>
      <p>{data.description}</p>
      
      {faqs.map(faq => (
        <details key={faq.id}>
          <summary>{faq.question}</summary>
          <p>{faq.answer}</p>
        </details>
      ))}
    </section>
  );
};

// faq.render.ts
export const FaqRender = {
  key: "faq",
  isLoadBackendData: true, // Backend'den veri gelecek
  schema: {
    items: [
      { type: "string", key: "title", label: "Başlık" },
      { type: "textArea", key: "description", label: "Açıklama" },
      {
        type: "translation", // Çeviri alt formu
        key: "keywords",
        label: "Anahtar kelimeler",
        schema: {
          items: [
            { type: "string", key: "search_placeholder", label: "Arama metni" },
            { type: "string", key: "no_results", label: "Sonuç yok mesajı" },
          ],
        },
      },
    ],
  },
};
```

### 5. Hızlı Karar Rehberi

**Sadece Server kullan:**
- Statik içerik
- SEO önemli
- Hızlı yükleme

**Client + Server kullan:**
- Dinamik veri
- Kullanıcı etkileşimi
- Real-time güncelleme

**Backend veri gerekli:**
- `isLoadBackendData: true` işaretle
- `section.api.ts` içine ekle
- UI'da `data.<alan>` ile kullan

**Çeviri gerekli:**
- `type: "translation"` kullan
- Alt şema tanımla
- `activeLanguage` ile dil seç

### 6. Kontrol Listesi

- [ ] Bölüm türüne göre client/server seçimi yapıldı mı?
- [ ] Backend veri gerekliyse `isLoadBackendData: true` işaretlendi mi?
- [ ] `section.api.ts` içine bölüm key'i eklendi mi?
- [ ] Çok dilli alanlar için `translation` tipi kullanıldı mı?
- [ ] Koşullu gösterim için `isShowRule` tanımlandı mı?

<br/><br/>
<br/><br/>
