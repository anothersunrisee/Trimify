import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { CropEngine } from '../lib/cropEngine';
import { getSettingsParameters } from '../lib/settings';
import { Utils } from '../lib/utils';
import { log } from '../lib/logger';

// usePreview — handles canvas rendering for before/after preview
// Identical logic to loadPreviewFile() in index.html
export function usePreview() {
  useEffect(() => {
    const handler = async (e: Event) => {
      const fileId = (e as CustomEvent<{ id: string }>).detail.id;
      await loadPreviewFile(fileId);
    };
    document.addEventListener('trimify:preview', handler);
    return () => document.removeEventListener('trimify:preview', handler);
  }, []);
}

async function loadPreviewFile(fileId: string) {
  useAppStore.getState().setSelectedPreviewId(fileId);

  // Highlight selected row in table
  document.querySelectorAll<HTMLElement>('#file-table-body tr').forEach((row) =>
    row.classList.remove('selected-row')
  );
  document.getElementById(`row-${fileId}`)?.classList.add('selected-row');

  const item = useAppStore.getState().files.find((f) => f.id === fileId);
  if (!item) {
    const badgeEl = document.getElementById('preview-filename-badge');
    if (badgeEl) badgeEl.textContent = 'Pilih File';
    
    const cBefore = document.getElementById('canvas-preview-before') as HTMLCanvasElement;
    if (cBefore) { cBefore.width = 1; cBefore.height = 1; cBefore.getContext('2d')?.clearRect(0,0,1,1); }
    const cAfter = document.getElementById('canvas-preview-after') as HTMLCanvasElement;
    if (cAfter) { cAfter.width = 1; cAfter.height = 1; cAfter.getContext('2d')?.clearRect(0,0,1,1); }
    
    const metaRow = document.getElementById('preview-meta-row');
    if (metaRow) metaRow.style.opacity = '0.6';
    
    ['preview-dim-before', 'preview-dim-after', 'preview-size-change', 'preview-area-reduced'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '-';
    });
    return;
  }

  const badgeEl = document.getElementById('preview-filename-badge');
  if (badgeEl) badgeEl.textContent = item.name;

  const settings = getSettingsParameters();

  try {
    const imgBitmap = await createImageBitmap(item.file);
    const { width, height } = imgBitmap;

    // Render "Before" canvas
    const cBefore = document.getElementById('canvas-preview-before') as HTMLCanvasElement | null;
    if (!cBefore) return;
    const ctxBefore = cBefore.getContext('2d')!;
    cBefore.width = width;
    cBefore.height = height;
    ctxBefore.drawImage(imgBitmap, 0, 0);

    let cropData: { originalWidth: number; originalHeight: number; croppedWidth: number; croppedHeight: number; bounds: { x: number; y: number; w: number; h: number } } | null = null;

    if (item.status === 'success' && item.bounds) {
      cropData = {
        originalWidth: item.originalWidth!,
        originalHeight: item.originalHeight!,
        croppedWidth: item.croppedWidth!,
        croppedHeight: item.croppedHeight!,
        bounds: item.bounds,
      };
    } else {
      const tmpCanvas = document.createElement('canvas');
      tmpCanvas.width = width; tmpCanvas.height = height;
      const tmpCtx = tmpCanvas.getContext('2d')!;
      tmpCtx.drawImage(imgBitmap, 0, 0);
      const data = tmpCtx.getImageData(0, 0, width, height).data;
      const bounds = CropEngine.findBoundaries(width, height, data, settings.threshold, settings.noise);
      if (bounds) {
        const pad = settings.padding;
        const cx = Math.max(0, bounds.left - pad);
        const cy = Math.max(0, bounds.top - pad);
        const cw = Math.min(width - 1, bounds.right + pad) - cx + 1;
        const ch = Math.min(height - 1, bounds.bottom + pad) - cy + 1;
        cropData = { originalWidth: width, originalHeight: height, croppedWidth: cw, croppedHeight: ch, bounds: { x: cx, y: cy, w: cw, h: ch } };
      }
    }

    if (cropData?.bounds) {
      ctxBefore.strokeStyle = '#f43f5e';
      ctxBefore.lineWidth = Math.max(2, Math.floor(width / 300));
      ctxBefore.setLineDash([8, 6]);
      ctxBefore.strokeRect(cropData.bounds.x, cropData.bounds.y, cropData.bounds.w, cropData.bounds.h);
    }

    // Render "After" canvas
    const cAfter = document.getElementById('canvas-preview-after') as HTMLCanvasElement | null;
    if (!cAfter) return;
    const ctxAfter = cAfter.getContext('2d')!;

    if (item.status === 'success' && item.croppedBlob) {
      const imgCropped = new Image();
      imgCropped.src = item.croppedUrl ?? URL.createObjectURL(item.croppedBlob);
      if (!item.croppedUrl) useAppStore.getState().updateFile(item.id, { croppedUrl: imgCropped.src });
      imgCropped.onload = () => {
        cAfter.width = imgCropped.width;
        cAfter.height = imgCropped.height;
        ctxAfter.drawImage(imgCropped, 0, 0);
      };
    } else if (cropData) {
      cAfter.width = cropData.croppedWidth;
      cAfter.height = cropData.croppedHeight;
      if (settings.format === 'jpeg') {
        ctxAfter.fillStyle = settings.bgColor;
        ctxAfter.fillRect(0, 0, cropData.croppedWidth, cropData.croppedHeight);
      }
      ctxAfter.drawImage(imgBitmap, cropData.bounds.x, cropData.bounds.y, cropData.bounds.w, cropData.bounds.h, 0, 0, cropData.croppedWidth, cropData.croppedHeight);
    } else {
      cAfter.width = 1; cAfter.height = 1;
      ctxAfter.clearRect(0, 0, 1, 1);
    }

    // Update meta bar
    const metaRow = document.getElementById('preview-meta-row');
    if (metaRow) metaRow.style.opacity = '1';

    const dimBefore = document.getElementById('preview-dim-before');
    const dimAfter = document.getElementById('preview-dim-after');
    const sizeChange = document.getElementById('preview-size-change');
    const areaReduced = document.getElementById('preview-area-reduced');

    if (dimBefore) dimBefore.textContent = `${width} x ${height} px`;

    if (cropData) {
      if (dimAfter) dimAfter.textContent = `${cropData.croppedWidth} x ${cropData.croppedHeight} px`;
      const origArea = width * height;
      const cropArea = cropData.croppedWidth * cropData.croppedHeight;
      const pct = Math.round(((origArea - cropArea) / origArea) * 100);
      if (areaReduced) areaReduced.textContent = `-${pct}%`;
    } else {
      if (dimAfter) dimAfter.textContent = '1 x 1 px';
      if (areaReduced) areaReduced.textContent = '-100%';
    }

    if (sizeChange) {
      if (item.status === 'success') {
        sizeChange.innerHTML = `${Utils.formatBytes(item.originalSize)} &rarr; ${Utils.formatBytes(item.croppedSize ?? 0)}`;
      } else {
        sizeChange.innerHTML = `${Utils.formatBytes(item.originalSize)} &rarr; Est. Selesai`;
      }
    }

    imgBitmap.close();
  } catch (err: any) {
    log(`Gagal memuat preview untuk ${item.name}: ${err.message}`, 'error');
  }
}
