import { useEffect } from 'react';
import { addFilesToQueue, readDroppedItems } from '../lib/queueActions';
import { log } from '../lib/logger';

// useFileUpload — registers drag/drop and file input event listeners
// Identical logic to bindEvents() in index.html
export function useFileUpload() {
  useEffect(() => {
    const dropzone = document.getElementById('dropzone') as HTMLElement | null;
    const fileInputFiles = document.getElementById('file-input-files') as HTMLInputElement | null;
    const fileInputFolder = document.getElementById('file-input-folder') as HTMLInputElement | null;

    if (!dropzone || !fileInputFiles || !fileInputFolder) return;

    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    };
    const onDragLeave = () => dropzone.classList.remove('dragover');
    const onDrop = async (e: DragEvent) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer?.items) {
        log('Mendeteksi item ditaruh, melakukan rekursif scanning folder...', 'info');
        const files = await readDroppedItems(e.dataTransfer.items);
        addFilesToQueue(files);
      } else if (e.dataTransfer?.files) {
        addFilesToQueue(Array.from(e.dataTransfer.files));
      }
    };
    const onDropzoneClick = () => fileInputFiles.click();
    const onFileInputChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        addFilesToQueue(Array.from(target.files));
        target.value = '';
      }
    };
    const onFolderInputChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const files = Array.from(target.files).map((file) => {
          (file as any).customPath = (file as any).webkitRelativePath || file.name;
          return file;
        });
        addFilesToQueue(files);
        target.value = '';
      }
    };

    dropzone.addEventListener('dragover', onDragOver);
    dropzone.addEventListener('dragleave', onDragLeave);
    dropzone.addEventListener('drop', onDrop as EventListener);
    dropzone.addEventListener('click', onDropzoneClick);
    fileInputFiles.addEventListener('change', onFileInputChange);
    fileInputFolder.addEventListener('change', onFolderInputChange);

    // Cleanup properly removes listeners — this is safe with StrictMode double-invoke
    return () => {
      dropzone.removeEventListener('dragover', onDragOver);
      dropzone.removeEventListener('dragleave', onDragLeave);
      dropzone.removeEventListener('drop', onDrop as EventListener);
      dropzone.removeEventListener('click', onDropzoneClick);
      fileInputFiles.removeEventListener('change', onFileInputChange);
      fileInputFolder.removeEventListener('change', onFolderInputChange);
    };
  }, []);
}
