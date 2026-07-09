# Trimify — Design System

> **Filosofi**: Clean, white, minimalist. Terinspirasi dari Apple HIG dan Figma's own UI — setiap elemen hadir dengan tujuan. Tidak ada dekorasi yang tidak perlu.

---

## 1. Brand Identity

| Atribut | Value |
|---|---|
| **Nama Produk** | Trimify |
| **Tagline** | Bulk Transparent PNG Trim & Crop |
| **Karakter** | Profesional, presisi, cepat, bersih |
| **Mood** | Calm · Trustworthy · Surgical |

---

## 2. Color Palette

### 2.1 Base (Light Mode)

```css
--color-bg:           #FFFFFF;   /* Surface utama */
--color-bg-secondary: #F5F5F7;   /* Surface panel / sidebar */
--color-bg-tertiary:  #EBEBED;   /* Input, well, inset */
--color-border:       #D1D1D6;   /* Divider, outline */
--color-border-subtle:#E5E5EA;   /* Subtle divider */
```

### 2.2 Text

```css
--color-text-primary:   #1C1C1E;  /* Body utama */
--color-text-secondary: #48484A;  /* Label, subtitle */
--color-text-tertiary:  #6E6E73;  /* Placeholder, caption */
--color-text-disabled:  #AEAEB2;  /* Disabled */
```

### 2.3 Accent — Emerald

```css
--color-accent:       #059669;
--color-accent-light: #ECFDF5;
--color-accent-hover: #047857;
--color-accent-ring:  rgba(5,150,105,0.25);
```

### 2.4 Semantic Colors

```css
--color-success:     #16A34A;  --color-success-bg: #F0FDF4;
--color-warning:     #D97706;  --color-warning-bg: #FFFBEB;
--color-error:       #DC2626;  --color-error-bg:   #FEF2F2;
```

### 2.5 Shadows

```css
--shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
--shadow-sm: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
--shadow-md: 0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04);
```

---

## 3. Typography

- **Body font**: Inter (Google Fonts) — weight 300, 400, 500, 600, 700
- **Mono font**: JetBrains Mono — angka, log, kode

### Type Scale

| Token      | Size  | Weight | Penggunaan                        |
|------------|-------|--------|-----------------------------------|
| text-xs    | 11px  | 400    | Caption, badge label              |
| text-sm    | 12px  | 400–500| Body kecil, helper text           |
| text-base  | 13px  | 400–500| Body utama, form label            |
| text-md    | 14px  | 500–600| Sub-heading, nav item             |
| text-lg    | 16px  | 600–700| Panel title, heading              |
| text-xl    | 20px  | 700    | App title, H1                     |

- **Heading**: letter-spacing: -0.03em
- **Section label uppercase**: letter-spacing: 0.06em
- **Body**: letter-spacing: -0.01em

---

## 4. Spacing (4px base unit)

```
4px   gap-1   icon gap, inset kecil
8px   gap-2   padding kompak
12px  gap-3   padding internal komponen
16px  gap-4   padding section standar
20px  gap-5   gap antar komponen
24px  gap-6   padding section besar
32px  gap-8   area utama
```

### Layout Constants

```
Header height    : 52px
Sidebar width    : 280px
border-radius-sm : 6px
border-radius-md : 8px
border-radius-lg : 12px
```

---

## 5. Components

### 5.1 Button

| Variant  | BG              | Text          | Border                     |
|----------|-----------------|---------------|----------------------------|
| Primary  | --color-accent  | white         | none                       |
| Outline  | white           | text-primary  | 1px solid --color-border   |
| Ghost    | transparent     | text-secondary| none                       |
| Danger   | error-bg        | error         | 1px solid error/25%        |
| Disabled | any             | disabled      | opacity: 0.45              |

- padding: 7px 14px, font-size: 13px, font-weight: 500, border-radius: 6px

### 5.2 Badge / Status

| Status     | Text     | BG        | Border            |
|------------|----------|-----------|-------------------|
| Pending    | #6E6E73  | #F5F5F7   | #E5E5EA           |
| Processing | #2563EB  | #EFF6FF   | rgba(37,99,235,.2)|
| Success    | #059669  | #ECFDF5   | rgba(5,150,105,.2)|
| Failed     | #DC2626  | #FEF2F2   | rgba(220,38,38,.2)|

- ont-size: 11px, ont-weight: 600, order-radius: 4px, padding: 2px 6px

### 5.3 Panel / Card

```
bg: white
border: 1px solid --color-border-subtle
border-radius: 8px
shadow: --shadow-sm
panel-header bg: --color-bg-secondary
panel-header border-bottom: 1px solid --color-border-subtle
panel-header padding: 10px 16px
```

### 5.4 Toggle Switch

```
Off: bg --color-bg-tertiary, border --color-border
On:  bg --color-accent
Thumb: white, shadow-sm
Dimensions: 36px x 20px
```

### 5.5 Toast

```
bg: white, border: 1px solid --color-border
border-radius: 10px, shadow: --shadow-lg
padding: 14px 18px, icon: --color-accent
```

---

## 6. Iconography (Lucide)

| Konteks          | Size  | Stroke |
|------------------|-------|--------|
| Header / section | 14px  | 2      |
| Button inline    | 14px  | 2      |
| Dropzone large   | 40px  | 1.5    |
| Badge inline     | 10px  | 2      |
| Toast            | 20px  | 2      |

Selalu gunakan currentColor — jangan hardcode warna ikon.

---

## 7. Motion

- **Default transition**: 150ms ease
- **Progress bar**: 250ms cubic-bezier(0.4, 0, 0.2, 1)
- **Toast slide-in**: 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)
- **Hover**: max 	ranslateY(-1px) atau scale(1.01) — sangat subtle
- Tidak ada animasi dekoratif yang tidak memberikan feedback

---

## 8. Checkerboard (Preview Canvas BG)

```css
background-image:
  linear-gradient(45deg, #E5E5EA 25%, transparent 25%),
  linear-gradient(-45deg, #E5E5EA 25%, transparent 25%),
  linear-gradient(45deg, transparent 75%, #E5E5EA 75%),
  linear-gradient(-45deg, transparent 75%, #E5E5EA 75%);
background-size: 16px 16px;
background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
background-color: #F5F5F7;
```

---

## 9. Do's & Don'ts

### DO
- Whitespace agresif — ruang kosong adalah desain
- Hierarchy lewat ukuran dan weight, bukan warna
- Warna aksen hanya untuk aksi utama dan status positif
- Border tipis dan subtle

### DON'T
- Jangan gunakan dark background / dark mode
- Jangan pakai gradien warna-warni
- Jangan gunakan lebih dari 1 warna aksen
- Jangan hardcode warna di luar palette
