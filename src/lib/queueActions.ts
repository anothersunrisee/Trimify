import { useAppStore, FileItem } from '../store/useAppStore';
import { useDialogStore } from '../store/useDialogStore';
import { log } from './logger';

// Queue data actions — identical logic to addFilesToQueue / clearFilesQueue in index.html

// Recursively parse files/folders dropped via dataTransfer
export async function readDroppedItems(dataTransferItemList: DataTransferItemList): Promise<File[]> {
  const files: File[] = [];
  const entries: FileSystemEntry[] = [];

  for (let i = 0; i < dataTransferItemList.length; i++) {
    const item = dataTransferItemList[i];
    if (item.kind === 'file') {
      const entry = item.webkitGetAsEntry();
      if (entry) entries.push(entry);
    }
  }

  const traverseEntry = async (entry: FileSystemEntry, currentPath = ''): Promise<void> => {
    if (entry.isFile) {
      const file = await new Promise<File>((res, rej) =>
        (entry as FileSystemFileEntry).file(res, rej)
      );
      (file as any).customPath = currentPath ? `${currentPath}/${file.name}` : file.name;
      files.push(file);
    } else if (entry.isDirectory) {
      const reader = (entry as FileSystemDirectoryEntry).createReader();
      const readAllEntries = (): Promise<FileSystemEntry[]> =>
        new Promise((res) => {
          const results: FileSystemEntry[] = [];
          const readBatch = () => {
            reader.readEntries((batch) => {
              if (batch.length === 0) res(results);
              else { results.push(...batch); readBatch(); }
            });
          };
          readBatch();
        });
      const childEntries = await readAllEntries();
      for (const child of childEntries) {
        await traverseEntry(
          child,
          currentPath ? `${currentPath}/${entry.name}` : entry.name
        );
      }
    }
  };

  for (const entry of entries) await traverseEntry(entry);
  return files;
}

export function addFilesToQueue(rawFileList: File[]): void {
  if (!rawFileList || rawFileList.length === 0) return;

  const { files, addFiles, selectedPreviewId } = useAppStore.getState();
  const { showAlertDialog, showToast } = useDialogStore.getState();

  const pngFiles = rawFileList.filter((f) => f.name.toLowerCase().endsWith('.png'));
  const rejectedCount = rawFileList.length - pngFiles.length;

  if (pngFiles.length === 0) {
    log(`Gagal menambah: ${rejectedCount} file non-PNG diabaikan.`, 'warning');
    showAlertDialog(
      'Format Tidak Didukung',
      'Tidak ada file .PNG pada pilihan Anda. Trimify saat ini hanya mendukung gambar dengan format PNG transparan.',
      'warning'
    );
    return;
  }

  let addedCount = 0;
  let duplicateCount = 0;
  const newItems: FileItem[] = [];

  for (const file of pngFiles) {
    const isDuplicate = files.some((item) => {
      const p1 = item.relativePath || item.name;
      const p2 = (file as any).customPath || file.name;
      return p1 === p2;
    });

    if (isDuplicate) { duplicateCount++; continue; }

    newItems.push({
      id: 'file-' + Math.random().toString(36).substring(2, 9),
      file,
      name: file.name,
      relativePath: (file as any).customPath || file.name,
      status: 'pending',
      originalSize: file.size,
      croppedSize: null,
      originalWidth: null,
      originalHeight: null,
      croppedWidth: null,
      croppedHeight: null,
      croppedBlob: null,
      croppedUrl: null,
      error: null,
    });
    addedCount++;
  }

  if (addedCount === 0) {
    if (duplicateCount > 0) {
      log(`Diabaikan: ${duplicateCount} file sudah ada di dalam antrean.`, 'info');
      showAlertDialog('File Sudah Ada', `${duplicateCount} file PNG yang dipilih sudah ada di dalam daftar antrean.`, 'info');
    }
    return;
  }

  addFiles(newItems);
  log(`Berhasil menambahkan ${addedCount} berkas PNG ke dalam antrean.`, 'success');

  if (rejectedCount > 0) {
    showAlertDialog(
      'Sebagian File Diabaikan',
      `Berhasil menambahkan ${addedCount} file PNG ke antrean. ${rejectedCount} file non-PNG dilewati karena format tidak didukung.`,
      'warning'
    );
  } else {
    showToast('File Ditambahkan', `${addedCount} berkas PNG berhasil masuk antrean.`, 'file-check');
  }

  document.getElementById('btn-start')?.removeAttribute('disabled');

  // Auto-select first file for preview if nothing selected
  if (!selectedPreviewId) {
    const updatedFiles = useAppStore.getState().files;
    if (updatedFiles.length > 0) {
      // Trigger preview via DOM event (preview hook listens for this)
      document.dispatchEvent(new CustomEvent('trimify:preview', { detail: { id: updatedFiles[0].id } }));
    }
  }
}

export function clearFilesQueue(): void {
  const { status, files } = useAppStore.getState();
  const { showAlertDialog, showConfirmDialog } = useDialogStore.getState();

  if (status === 'PROCESSING') {
    showAlertDialog('Peringatan', 'Proses sedang berjalan. Batalkan atau pause proses terlebih dahulu sebelum menghapus antrean.', 'warning');
    return;
  }

  if (files.length === 0) return;

  showConfirmDialog({
    title: 'Hapus Semua Antrean?',
    desc: `Apakah Anda yakin ingin menghapus ${files.length} file dari daftar antrean?`,
    confirmText: 'Ya, Hapus Semua',
    variant: 'danger',
    onConfirm: () => {
      // Revoke object URLs to free memory
      files.forEach((item) => {
        if (item.croppedUrl) URL.revokeObjectURL(item.croppedUrl);
      });

      useAppStore.getState().clearFiles();

      document.getElementById('table-empty-state') && (
        (document.getElementById('table-empty-state') as HTMLElement).style.display = 'flex'
      );
      const progressPanel = document.getElementById('progress-panel');
      if (progressPanel) progressPanel.style.display = 'none';
      document.getElementById('btn-start')?.setAttribute('disabled', 'true');
      document.getElementById('btn-download')?.setAttribute('disabled', 'true');

      log('Daftar antrean file dibersihkan.', 'info');
    },
  });
}
