import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useAppStore } from '../store/useAppStore';
import { useDialogStore } from '../store/useDialogStore';
import { Utils } from './utils';
import { log } from './logger';
import { getSettingsParameters } from './settings';

// ZIP Exporter — identical logic to downloadZipArchive in index.html
export async function downloadZipArchive(): Promise<void> {
  const { files } = useAppStore.getState();
  const { showAlertDialog } = useDialogStore.getState();

  const successFiles = files.filter((f) => f.status === 'success' && f.croppedBlob);
  if (successFiles.length === 0) {
    showAlertDialog('Informasi', 'Tidak ada file hasil crop yang berhasil diekspor.', 'info');
    return;
  }

  log('Sedang menyiapkan file ZIP hasil cropping...', 'info');

  const zipBtn = document.getElementById('btn-download') as HTMLButtonElement | null;
  const origContent = zipBtn?.innerHTML ?? '';
  if (zipBtn) {
    zipBtn.setAttribute('disabled', 'true');
    zipBtn.innerHTML = `<i data-lucide="loader-2" class="spinner" style="width:16px; height:16px;"></i> Membuat ZIP...`;
    // Re-render lucide icons in vanilla — in React we just set state
    if (typeof (window as any).lucide !== 'undefined') {
      (window as any).lucide.createIcons();
    }
  }

  try {
    const zip = new JSZip();
    const settings = getSettingsParameters();
    const usedPaths = new Set<string>();

    for (const item of successFiles) {
      const ext = Utils.getExt(settings.format);
      const baseNameNoExt = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
      const targetName = settings.overwriteName
        ? `${baseNameNoExt}.${ext}`
        : `${baseNameNoExt}_cropped.${ext}`;

      let relativePath: string;
      if (settings.preserveFolder && item.relativePath) {
        const idx = item.relativePath.lastIndexOf('/');
        if (idx !== -1) {
          relativePath = `${item.relativePath.substring(0, idx)}/${targetName}`;
        } else {
          relativePath = targetName;
        }
      } else {
        relativePath = targetName;
      }

      let finalZipPath = relativePath;
      let counter = 1;
      while (usedPaths.has(finalZipPath.toLowerCase())) {
        const dotIdx = relativePath.lastIndexOf('.');
        if (dotIdx !== -1) {
          finalZipPath = `${relativePath.substring(0, dotIdx)} (${counter})${relativePath.substring(dotIdx)}`;
        } else {
          finalZipPath = `${relativePath} (${counter})`;
        }
        counter++;
      }
      usedPaths.add(finalZipPath.toLowerCase());
      zip.file(finalZipPath, item.croppedBlob!);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `Trimify_Cropped_Archive_${Date.now()}.zip`);
    log('Arsip ZIP berhasil diunduh ke sistem Anda!', 'success');
  } catch (err: any) {
    log(`Gagal membuat berkas ZIP: ${err.message}`, 'error');
    showAlertDialog('Gagal Mengekspor', 'Terjadi kesalahan saat mengekspor ZIP: ' + err.message, 'error');
  } finally {
    if (zipBtn) {
      zipBtn.removeAttribute('disabled');
      zipBtn.innerHTML = origContent;
    }
  }
}
