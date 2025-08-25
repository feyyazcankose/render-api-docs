### Config (Konfigürasyon) Nedir?

Config, tüm sayfayı etkileyen özel ayar ekranlarıdır (örn. sözleşme sayfası, şirket detay sayfası). Section’dan farkı: tek bir bölüm değil, sayfa tipine özgü “ayar formu” sunmasıdır.

Ne işe yarar?

- Sayfa tipine göre ortak ayarları tek noktadan yönetirsiniz.
- Aynı tipteki pek çok sayfa için (örn. tüm şirketler) aynı şemayı kullanabilirsiniz.

Nerededir?

- Modüller: `src/@renders/configs/*`
- Render: `src/components/Builder/renders/ConfigRender.tsx`
- Liste: `src/@renders/configs/modules.export.ts`

### Kısaca Nasıl Kullanırım?

1. Bir sayfa tipi için ayar ekranı gerekiyorsa (ör. `companies`), o tip için bir config modülü oluşturun.
2. `values` ile verinin iskeletini, `schema.items` ile form alanlarını tanımlayın.
3. Modülü `ConfigModulesExport` listesine ekleyin.
4. `ConfigRender` sayfa tipine göre doğru bileşeni otomatik çağırır.

<br/><br/>
<br/><br/>
