# Trimify — Agent Instructions (agent.md)

> Dokumen ini adalah panduan operasional untuk AI agent (Antigravity / Claude / Gemini) yang bekerja pada proyek Trimify. Semua kontributor AI **wajib** mengikuti instruksi ini sebelum membuat perubahan apapun.

---

## 1. Prinsip Utama

1. **Zero Logic Change** — Saat mengerjakan perubahan UI/UX, jangan pernah menyentuh JavaScript logic, state management, CropEngine, event binding, atau DOM ID yang digunakan JS.
2. **Design First** — Selalu baca design.md sebelum membuat perubahan visual apapun. Semua perubahan CSS harus konsisten dengan design system di sana.
3. **Preserve All IDs** — Semua id="..." di HTML adalah kontrak dengan JavaScript. Jangan rename, hapus, atau pindahkan tanpa audit menyeluruh.
4. **Minimal Footprint** — Buat perubahan sekecil mungkin. Jangan refactor sesuatu yang tidak diminta.
5. **Indonesian Copy** — Semua teks UI dalam Bahasa Indonesia. Jangan translate ke Bahasa Inggris kecuali diminta.

---

## 2. Struktur Proyek

```
trimify---bulk-png-crop/
├── index.html          ← Satu-satunya file aplikasi (HTML + CSS + JS semua di sini)
├── design.md           ← Design system & token reference
├── agent.md            ← Instruksi ini
├── package.json        ← Build config (Vite, React — tapi app berjalan dari index.html)
├── vite.config.ts      ← Vite config (HMR disabled di AI Studio)
├── src/
│   ├── App.tsx         ← Kosong (placeholder)
│   ├── main.tsx        ← Kosong (placeholder)
│   └── index.css
└── assets/
```

### Catatan Arsitektur Penting

- Seluruh logika aplikasi ada di **index.html** dalam <script> tag inline.
- Aplikasi ini adalah **pure vanilla JS + HTML** — tidak menggunakan React/TSX.
- src/App.tsx dan src/main.tsx **tidak digunakan** oleh aplikasi utama.
- CDN external yang digunakan (jangan diganti atau dihapus):
  - jszip.min.js → untuk pembuatan arsip ZIP
  - FileSaver.min.js → untuk trigger download file
  - lucide@latest → untuk icon library
  - Google Fonts (Inter + JetBrains Mono)

---

## 3. DOM Contract — Protected Elements

Elemen-elemen berikut memiliki id yang digunakan oleh JavaScript. **Jangan diubah:**

### Input Controls (dibaca oleh getSettingsParameters())
- #input-threshold
- #input-noise
- #input-padding
- #input-format
- #input-quality
- #input-bg-color
- #input-preserve-folder
- #input-overwrite-filename
- #file-input-files
- #file-input-folder

### Slider Value Displays
- #val-threshold
- #val-noise
- #val-padding
- #val-quality
- #val-bg-color

### Conditional Visibility Containers
- #container-quality → show/hide saat format berubah
- #container-bg-color → show/hide saat format JPEG dipilih
- #label-quality → textContent diubah JS

### Buttons (semua event listener terikat di sini)
- #btn-start
- #btn-pause
- #btn-resume
- #btn-cancel
- #btn-download
- #btn-clear
- #btn-copy-log
- #btn-clear-log

### Progress Panel
- #progress-panel → display toggle
- #progress-status → textContent
- #progress-bar-fill → style.width
- #progress-file-info → textContent
- #progress-time-elapsed → textContent
- #progress-time-remaining → textContent

### File Table
- #file-table → table element
- #file-table-body → tbody, innerHTML dioverwrite JS
- #table-empty-state → show/hide
- #badge-total-files → textContent

### Preview Panel
- #preview-workspace → container
- #canvas-preview-before → canvas element
- #canvas-preview-after → canvas element
- #preview-filename-badge → textContent
- #preview-meta-row → opacity toggle
- #preview-dim-before → textContent
- #preview-dim-after → textContent
- #preview-size-change → textContent
- #preview-area-reduced → textContent

### Stats Header
- #stat-processed-count → textContent
- #stat-saved-space → textContent

### Dropzone
- #dropzone → event listeners (dragover, dragleave, drop, click)

### Console Logger
- #console-output → appendChild target

### Toast
- #success-toast → classList.add/remove 'show'
- #toast-message → textContent

### Dynamic Row IDs (JS-generated)
- #row-{item.id} → tr elements dibuat dinamis oleh JS
- Jangan buat static element dengan prefix ow-

---

## 4. CSS Classes Contract

Class-class berikut digunakan oleh JavaScript (tambah/hapus lewat classList):

| Class | Digunakan di |
|---|---|
| .dragover | #dropzone saat file di-drag |
| .selected-row | <tr> di file table saat dipilih |
| .active-row | <tr> saat file sedang diproses |
| .spinner | Icon yang sedang berputar |
| .show | Toast notification saat muncul |
| .badge-pending | Status badge JS-generated |
| .badge-processing | Status badge JS-generated |
| .badge-success | Status badge JS-generated |
| .badge-failed | Status badge JS-generated |
| .savings-indicator | Span persen penghematan |
| .log-entry | Baris console log |
| .log-timestamp | Timestamp dalam log |
| .log-text | Teks log |
| .log-info | Log type info |
| .log-success | Log type success |
| .log-warning | Log type warning |
| .log-error | Log type error |

---

## 5. Workflow untuk UI Changes

Ikuti langkah ini setiap kali diminta mengubah UI:

1. **Baca design.md** — Pastikan perubahan sesuai token yang ada
2. **Audit DOM Contract** — Pastikan semua id dan class yang digunakan JS tetap ada
3. **Edit hanya <style> dan HTML struktur** — JavaScript <script> tidak disentuh
4. **Verifikasi visual** — Pastikan 
pm run dev berjalan dan tampilan sesuai design system
5. **Cek fungsionalitas** — Semua tombol dan interaksi tetap berfungsi

---

## 6. Code Style untuk CSS

```css
/* Gunakan CSS Custom Properties dari design.md */
/* Contoh yang BENAR: */
color: var(--color-text-primary);
background: var(--color-bg-secondary);
border: 1px solid var(--color-border-subtle);

/* Contoh yang SALAH: */
color: #1C1C1E; /* hardcode */
background: #F5F5F7; /* hardcode */
```

- Definisikan semua token di :root di awal <style>
- Gunakan ar() konsisten — jangan mix hardcode dan variable
- Tulis komentar section dengan /* === SECTION NAME === */

---

## 7. Larangan Keras

- ❌ Jangan install dependency baru tanpa izin eksplisit
- ❌ Jangan ubah package.json atau ite.config.ts untuk UI changes
- ❌ Jangan pindah logic ke file terpisah tanpa diskusi
- ❌ Jangan gunakan Tailwind utility classes (app ini vanilla CSS)
- ❌ Jangan gunakan !important kecuali sangat terpaksa
- ❌ Jangan hapus atau comment-out JavaScript yang ada
- ❌ Jangan ubah urutan load CDN scripts di <head>

---

## 8. Testing Checklist Sebelum Commit

- [ ] 
pm run dev berjalan tanpa error di konsol browser
- [ ] Drag & drop file PNG berfungsi
- [ ] Tombol Pilih File dan Pilih Folder berfungsi
- [ ] Slider threshold, noise, padding mengupdate nilai display
- [ ] Format selector menampilkan/menyembunyikan quality dan bg-color input
- [ ] Tombol Mulai Auto Crop berfungsi dan progress bar berjalan
- [ ] Preview before/after ditampilkan saat file diklik di tabel
- [ ] Tombol Download Hasil ZIP berfungsi
- [ ] Toast notification muncul setelah proses selesai
- [ ] Console log menampilkan aktivitas
- [ ] Responsive — tidak ada overflow horizontal
