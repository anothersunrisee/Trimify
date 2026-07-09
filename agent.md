# Trimify — Agent Instructions

> Panduan operasional untuk AI agent yang bekerja pada proyek **Trimify**. Baca seluruh dokumen ini sebelum membuat perubahan apapun.

---

## 1. Ringkasan Proyek

**Trimify** adalah aplikasi web bulk auto-crop transparent PNG. Semua pemrosesan 100% lokal di browser — tidak ada upload ke server.

- **Stack:** React 19 + TypeScript + Vite + Zustand + Vanilla CSS
- **Dev server:** `npm run dev` → `http://localhost:3000`
- **Build:** `npm run build`
- **Lint:** `npx tsc --noEmit`

---

## 2. Arsitektur & Struktur File

```
src/
├── index.css                  ← SEMUA CSS (design tokens + komponen)
├── main.tsx                   ← Entry point React
├── App.tsx                    ← Root component (memanggil semua hooks + komponen)
│
├── store/
│   ├── useAppStore.ts         ← Zustand: state antrean (files, status, dll)
│   └── useDialogStore.ts      ← Zustand: state modal/toast/dialog
│
├── lib/                       ← Pure logic, tanpa React
│   ├── cropEngine.ts          ← Pixel boundary scanner + image processor
│   ├── utils.ts               ← formatBytes, formatTime, getExt
│   ├── logger.ts              ← log(), loggerLines[], copyConsoleLogs()
│   ├── queueActions.ts        ← addFilesToQueue(), clearFilesQueue()
│   ├── zipExporter.ts         ← downloadZipArchive() via jszip + file-saver
│   └── settings.ts            ← getSettingsParameters() — baca DOM input
│
├── hooks/                     ← Imperative DOM event hooks
│   ├── useFileUpload.ts       ← drag/drop + file/folder input listeners
│   ├── useProcessingQueue.ts  ← useSettings(), startQueueProcessing(), dll
│   └── usePreview.ts          ← canvas rendering before/after via custom event
│
└── components/                ← UI komponen (JSX)
    ├── AppHeader.tsx           ← Header + stats bar
    ├── Sidebar.tsx             ← Sidebar: Upload + CropParams + Output + Buttons
    ├── DropZone.tsx            ← Drag area
    ├── ProgressPanel.tsx       ← Progress bar + timer
    ├── FileQueueTable.tsx      ← Tabel antrean file
    ├── PreviewPanel.tsx        ← Canvas before/after + meta bar
    ├── BottomBar.tsx           ← Console log + about card
    └── Modals.tsx              ← Toast, Donation, Alert Dialog, Confirm Dialog
```

---

## 3. Prinsip Utama

1. **Preserve DOM IDs** — Semua `id="..."` di JSX adalah kontrak antara HTML dan `lib/` hooks. Jangan rename tanpa audit penuh.
2. **Zustand via `getState()`** — Logic di `lib/` dan `hooks/` tidak boleh pakai `useStore()` hook — gunakan `useAppStore.getState()` / `useDialogStore.getState()` karena dipanggil di luar React tree.
3. **Custom Event Bridge** — Preview dipicu lewat `document.dispatchEvent(new CustomEvent('trimify:preview', { detail: { id } }))`. `usePreview.ts` yang mendengarkan event ini.
4. **Vanilla CSS only** — Tidak ada Tailwind. Semua styling pakai class dan CSS variables dari `src/index.css`.
5. **Indonesian Copy** — Semua teks UI dalam Bahasa Indonesia.
6. **Minimal Footprint** — Ubah sekecil mungkin. Jangan refactor yang tidak diminta.

---

## 4. State Management

### `useAppStore` (Zustand)
Akses di komponen: `const { files } = useAppStore();`
Akses di lib/hooks: `useAppStore.getState().files`

| Field | Type | Keterangan |
|-------|------|-----------|
| `status` | `'IDLE' \| 'PROCESSING' \| 'PAUSED' \| 'STOPPED'` | Status proses |
| `files` | `FileItem[]` | Array file dalam antrean |
| `selectedPreviewId` | `string \| null` | ID file yang sedang di-preview |
| `elapsedSeconds` | `number` | Detik proses berjalan |
| `pauseResolver` | `(() => void) \| null` | Promise resolver untuk pause |

Actions: `addFiles`, `updateFile`, `clearFiles`, `setStatus`, `setPauseResolver`, dll.

### `useDialogStore` (Zustand)
| Method | Fungsi |
|--------|--------|
| `showToast(title, desc, icon)` | Tampilkan toast notification |
| `showAlertDialog(title, desc, type)` | Tampilkan alert modal |
| `showConfirmDialog({ title, desc, confirmText, onConfirm })` | Tampilkan confirm modal |
| `openDonationModal()` | Buka modal donasi QRIS |

---

## 5. DOM Contract — ID yang Digunakan JS/Hooks

> ⚠️ Jangan rename atau hapus ID berikut. Digunakan oleh `lib/` dan `hooks/`.

### Input Settings (dibaca `settings.ts`)
- `#input-threshold`, `#input-noise`, `#input-padding`
- `#input-format`, `#input-quality`, `#input-bg-color`
- `#input-preserve-folder`, `#input-overwrite-filename`
- `#val-threshold`, `#val-noise`, `#val-padding`, `#val-quality`, `#val-bg-color`

### File Inputs (dipakai `useFileUpload.ts`)
- `#file-input-files` — input file individual
- `#file-input-folder` — input folder (webkitdirectory)
- `#dropzone` — drag area

### Buttons (dikontrol `useProcessingQueue.ts`)
- `#btn-start`, `#btn-pause`, `#btn-resume`, `#btn-cancel`
- `#btn-download`, `#btn-clear`
- `#btn-copy-log`, `#btn-clear-log`

### Conditional Visibility
- `#container-quality` → show/hide saat format WebP/JPEG
- `#container-bg-color` → show/hide saat format JPEG
- `#label-quality` → textContent diubah JS

### Progress Panel
- `#progress-panel`, `#progress-status`, `#progress-bar-fill`
- `#progress-file-info`, `#progress-time-elapsed`, `#progress-time-remaining`

### File Table
- `#file-table-body` → innerHTML di-overwrite oleh `updateFileListUI()`
- `#table-empty-state`, `#badge-total-files`
- `#row-{item.id}` → tr dinamis, jangan buat static element dengan prefix ini

### Preview Panel
- `#canvas-preview-before`, `#canvas-preview-after` — canvas element
- `#preview-filename-badge`, `#preview-meta-row`
- `#preview-dim-before`, `#preview-dim-after`
- `#preview-size-change`, `#preview-area-reduced`

### Stats Header
- `#stat-processed-count`, `#stat-saved-space`

### Console Log
- `#console-output` — target `appendChild` dari `log()`

### Toast
- `#success-toast` — dikelola oleh `Modals.tsx` + `useDialogStore`

---

## 6. CSS Classes yang Dikontrol JS

| Class | Digunakan di |
|-------|-------------|
| `.dragover` | `#dropzone` saat file di-drag |
| `.selected-row` | `<tr>` file yang dipilih |
| `.active-row` | `<tr>` file yang sedang diproses |
| `.spinner` | Icon animasi loading |
| `.show` | Toast/modal saat muncul |
| `.open` | Accordion body/chevron saat terbuka |
| `.badge-pending/processing/success/failed` | Badge status di tabel |
| `.savings-indicator` | Span persen penghematan |
| `.log-info/success/warning/error` | Warna baris log |

---

## 7. Cara Kerja Key Flows

### Upload File
1. User klik dropzone atau tombol "Pilih File/Folder" → `useFileUpload.ts` menangkap event
2. → `addFilesToQueue(files)` di `queueActions.ts`
3. → `useAppStore.getState().addFiles(newItems)` update Zustand
4. → `showToast()` / `showAlertDialog()` untuk feedback

### Proses Crop
1. Klik "Mulai Auto Crop" → `startQueueProcessing()` di `useProcessingQueue.ts`
2. Loop: `processNextInQueue()` → `CropEngine.processSingleFile(file, settings)`
3. → `useAppStore.getState().updateFile(id, result)`
4. → Dispatch `trimify:preview` event → `usePreview.ts` render canvas

### Preview
- Dipicu via: `document.dispatchEvent(new CustomEvent('trimify:preview', { detail: { id } }))`
- `usePreview.ts` mendengarkan event ini dan render canvas before/after

### Dialog/Toast
- Selalu pakai `useDialogStore.getState().showAlertDialog(...)` — **jangan gunakan browser `alert()`**

---

## 8. Panduan Edit per Layer

| Yang ingin diubah | File yang diedit |
|-------------------|-----------------|
| Tampilan CSS/layout | `src/index.css` |
| Teks/struktur UI | file di `src/components/` |
| Logika crop | `src/lib/cropEngine.ts` |
| State/actions | `src/store/useAppStore.ts` |
| Modal/dialog | `src/store/useDialogStore.ts` + `src/components/Modals.tsx` |
| Event listeners upload | `src/hooks/useFileUpload.ts` |
| Loop proses antrean | `src/hooks/useProcessingQueue.ts` |
| Canvas preview | `src/hooks/usePreview.ts` |
| ZIP download | `src/lib/zipExporter.ts` |

---

## 9. Larangan Keras

- ❌ Jangan gunakan `alert()`, `confirm()` browser native — pakai `useDialogStore`
- ❌ Jangan gunakan Tailwind utility classes
- ❌ Jangan gunakan `!important` kecuali terpaksa
- ❌ Jangan pakai `useAppStore()` hook di dalam `lib/` — pakai `.getState()`
- ❌ Jangan hapus atau rename DOM ID yang terdaftar di Section 5
- ❌ Jangan install dependency baru tanpa diskusi
- ❌ Jangan gunakan `initialized.current` guard di `useEffect` — menyebabkan StrictMode bug

---

## 10. Testing Checklist Sebelum Commit

```
npm run lint   → npx tsc --noEmit (harus 0 errors)
npm run build  → vite build (harus success)
```

### Manual di Browser
- [ ] Drag & drop file/folder PNG → file masuk antrean + toast muncul
- [ ] Tombol "Pilih File" dan "Pilih Folder" berfungsi
- [ ] Upload non-PNG → alert dialog muncul
- [ ] Upload duplikat → alert dialog muncul
- [ ] Slider threshold/noise/padding → nilai display update
- [ ] Format selector → quality/bg-color input show/hide
- [ ] Tombol "Mulai Auto Crop" → progress bar berjalan
- [ ] Pause / Resume / Cancel berfungsi
- [ ] Preview before/after canvas muncul saat file diklik
- [ ] Accordion "Parameter Crop" collapse/expand
- [ ] Download Hasil ZIP berfungsi
- [ ] Clear queue → confirm dialog muncul
- [ ] Toast muncul setelah crop selesai
- [ ] Donation modal + QRIS tampil
- [ ] Alert/Confirm dialog tampil (custom, bukan browser native)
- [ ] Escape key menutup semua modal
- [ ] Log aktivitas ter-update, Copy/Clear berfungsi
