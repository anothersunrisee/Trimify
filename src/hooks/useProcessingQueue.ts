import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useDialogStore } from '../store/useDialogStore';
import { CropEngine } from '../lib/cropEngine';
import { getSettingsParameters } from '../lib/settings';
import { log, copyConsoleLogs, clearConsoleLogs } from '../lib/logger';
import { Utils } from '../lib/utils';
import { downloadZipArchive } from '../lib/zipExporter';
import { clearFilesQueue } from '../lib/queueActions';

// useSettings — sets up sidebar slider/select/toggle event listeners
// Identical to setupSlider() and format onChange in index.html
export function useSettings() {
  useEffect(() => {
    const setupSlider = (inputId: string, valueId: string, suffix: string, transform: (v: string) => string) => {
      const input = document.getElementById(inputId) as HTMLInputElement | null;
      const display = document.getElementById(valueId);
      if (!input || !display) return;
      const handler = (e: Event) => {
        display.textContent = transform((e.target as HTMLInputElement).value) + suffix;
      };
      input.addEventListener('input', handler);
      return () => input.removeEventListener('input', handler);
    };

    const cleanupThreshold = setupSlider('input-threshold', 'val-threshold', '', (v) => v);
    const cleanupNoise = setupSlider('input-noise', 'val-noise', ' px', (v) => v);
    const cleanupPadding = setupSlider('input-padding', 'val-padding', ' px', (v) => v);
    const cleanupQuality = setupSlider('input-quality', 'val-quality', '%', (v) => v);

    const formatSelect = document.getElementById('input-format') as HTMLSelectElement | null;
    const onFormatChange = (e: Event) => {
      const val = (e.target as HTMLSelectElement).value;
      const qualityContainer = document.getElementById('container-quality');
      const bgColorContainer = document.getElementById('container-bg-color');
      const labelQuality = document.getElementById('label-quality');
      if (!qualityContainer || !bgColorContainer || !labelQuality) return;

      if (val === 'png') {
        qualityContainer.style.display = 'none';
        bgColorContainer.style.display = 'none';
      } else if (val === 'webp') {
        qualityContainer.style.display = 'block';
        bgColorContainer.style.display = 'none';
        labelQuality.textContent = 'Kualitas WebP';
      } else if (val === 'jpeg') {
        qualityContainer.style.display = 'block';
        bgColorContainer.style.display = 'block';
        labelQuality.textContent = 'Kualitas JPEG';
      }
    };
    formatSelect?.addEventListener('change', onFormatChange);

    const bgColorInput = document.getElementById('input-bg-color') as HTMLInputElement | null;
    const onBgColorChange = (e: Event) => {
      const valEl = document.getElementById('val-bg-color');
      if (valEl) valEl.textContent = (e.target as HTMLInputElement).value;
    };
    bgColorInput?.addEventListener('input', onBgColorChange);

    return () => {
      cleanupThreshold?.();
      cleanupNoise?.();
      cleanupPadding?.();
      cleanupQuality?.();
      formatSelect?.removeEventListener('change', onFormatChange);
      bgColorInput?.removeEventListener('input', onBgColorChange);
    };
  }, []);
}

// useProcessingControls — wires up the queue processing control buttons
export function useProcessingControls() {
  useEffect(() => {
    const btnStart = document.getElementById('btn-start');
    const btnPause = document.getElementById('btn-pause');
    const btnResume = document.getElementById('btn-resume');
    const btnCancel = document.getElementById('btn-cancel');
    const btnDownload = document.getElementById('btn-download');
    const btnClear = document.getElementById('btn-clear');
    const btnCopyLog = document.getElementById('btn-copy-log');
    const btnClearLog = document.getElementById('btn-clear-log');

    if (btnStart) btnStart.addEventListener('click', startQueueProcessing);
    if (btnPause) btnPause.addEventListener('click', pauseQueueProcessing);
    if (btnResume) btnResume.addEventListener('click', resumeQueueProcessing);
    if (btnCancel) btnCancel.addEventListener('click', cancelQueueProcessing);

    if (btnDownload) btnDownload.addEventListener('click', downloadZipArchive);
    if (btnClear) btnClear.addEventListener('click', clearFilesQueue);

    const { showAlertDialog } = useDialogStore.getState();
    if (btnCopyLog) btnCopyLog.addEventListener('click', () => copyConsoleLogs(showAlertDialog));
    if (btnClearLog) btnClearLog.addEventListener('click', clearConsoleLogs);

    return () => {
      btnStart?.removeEventListener('click', startQueueProcessing);
      btnPause?.removeEventListener('click', pauseQueueProcessing);
      btnResume?.removeEventListener('click', resumeQueueProcessing);
      btnCancel?.removeEventListener('click', cancelQueueProcessing);
    };
  }, []);
}

// Queue processing loop — identical to all processNext*/halt/finish functions in index.html
function toggleUIInputsState(processing: boolean) {
  const ids = [
    'input-threshold', 'input-noise', 'input-padding', 'input-format',
    'input-quality', 'input-bg-color', 'input-preserve-folder', 'input-overwrite-filename',
    'file-input-files', 'file-input-folder', 'btn-clear',
  ];
  ids.forEach((id) => {
    const elem = document.getElementById(id);
    if (!elem) return;
    if (processing) elem.setAttribute('disabled', 'true');
    else elem.removeAttribute('disabled');
  });

  document.querySelectorAll<HTMLButtonElement>('.upload-btn-container button').forEach((btn) => {
    if (processing) btn.setAttribute('disabled', 'true');
    else btn.removeAttribute('disabled');
  });

  const btnStart = document.getElementById('btn-start') as HTMLElement | null;
  const btnPause = document.getElementById('btn-pause') as HTMLElement | null;
  const btnResume = document.getElementById('btn-resume') as HTMLElement | null;
  const btnCancel = document.getElementById('btn-cancel') as HTMLElement | null;
  const btnDownload = document.getElementById('btn-download') as HTMLButtonElement | null;

  if (processing) {
    if (btnStart) btnStart.style.display = 'none';
    if (btnPause) { btnPause.style.display = 'inline-flex'; btnPause.removeAttribute('disabled'); }
    if (btnResume) btnResume.style.display = 'none';
    if (btnCancel) { btnCancel.style.display = 'inline-flex'; btnCancel.removeAttribute('disabled'); }
    btnDownload?.setAttribute('disabled', 'true');
  } else {
    if (btnStart) { btnStart.style.display = 'block'; btnStart.removeAttribute('disabled'); }
    if (btnPause) btnPause.style.display = 'none';
    if (btnResume) btnResume.style.display = 'none';
    if (btnCancel) btnCancel.style.display = 'none';
    const { files } = useAppStore.getState();
    const hasSuccess = files.some((f) => f.status === 'success');
    if (hasSuccess) btnDownload?.removeAttribute('disabled');
  }
}

export function updateTimeEstimation() {
  const { files, elapsedSeconds } = useAppStore.getState();
  const completed = files.filter((f) => f.status === 'success' || f.status === 'failed').length;
  if (completed === 0) return;
  const remaining = files.length - completed;
  const remEl = document.getElementById('progress-time-remaining');
  if (!remEl) return;
  if (remaining === 0) { remEl.textContent = '00:00'; return; }
  const avg = elapsedSeconds / completed;
  remEl.textContent = '~' + Utils.formatTime(Math.round(remaining * avg));
}

export function updateGeneralStats() {
  const { files } = useAppStore.getState();
  const total = files.length;
  const processed = files.filter((f) => f.status === 'success' || f.status === 'failed').length;
  const badgeEl = document.getElementById('badge-total-files');
  const statEl = document.getElementById('stat-processed-count');
  if (badgeEl) badgeEl.textContent = `${total} File`;
  if (statEl) statEl.textContent = `${processed} / ${total}`;

  let origSum = 0, cropSum = 0;
  files.forEach((item) => {
    if (item.status === 'success') { origSum += item.originalSize; cropSum += item.croppedSize ?? 0; }
  });
  const statSaved = document.getElementById('stat-saved-space');
  if (statSaved) {
    if (origSum > 0) {
      const saved = origSum - cropSum;
      const pct = Math.round((saved / origSum) * 100);
      statSaved.textContent = `${Utils.formatBytes(saved)} (-${pct}%)`;
    } else {
      statSaved.textContent = '0.00 KB (0%)';
    }
  }
}

export function updateFileListUI() {
  const { files, selectedPreviewId } = useAppStore.getState();
  const body = document.getElementById('file-table-body');
  const emptyState = document.getElementById('table-empty-state');
  if (!body || !emptyState) return;

  if (files.length === 0) {
    emptyState.style.display = 'flex';
    body.innerHTML = '';
    return;
  }
  emptyState.style.display = 'none';

  body.innerHTML = files.map((item) => {
    let statusBadge = '';
    let resString = '-';
    let sizeString = Utils.formatBytes(item.originalSize);
    let savingPerc = '-';

    if (item.status === 'pending') {
      statusBadge = `<span class="badge badge-pending">Pending</span>`;
    } else if (item.status === 'processing') {
      statusBadge = `<span class="badge badge-processing"><i data-lucide="loader-2" class="spinner" style="width:10px; height:10px;"></i> Proses</span>`;
    } else if (item.status === 'success') {
      const savings = item.originalSize - (item.croppedSize ?? 0);
      const pct = item.originalSize > 0 ? Math.round((savings / item.originalSize) * 100) : 0;
      statusBadge = `<span class="badge badge-success">Selesai</span>`;
      resString = `<span style="color:var(--text-secondary); font-size:0.75rem;">${item.originalWidth}x${item.originalHeight}</span> &rarr; <strong>${item.croppedWidth}x${item.croppedHeight}</strong>`;
      sizeString = `<span style="text-decoration:line-through; color:var(--text-muted); font-size:0.7rem;">${Utils.formatBytes(item.originalSize)}</span><br><strong>${Utils.formatBytes(item.croppedSize ?? 0)}</strong>`;
      savingPerc = `<span class="savings-indicator">-${pct}%</span>`;
    } else if (item.status === 'failed') {
      statusBadge = `<span class="badge badge-failed" title="${item.error ?? 'Gagal'}">Gagal</span>`;
    }

    const isSelected = item.id === selectedPreviewId ? 'selected-row' : '';
    const isActive = item.status === 'processing' ? 'active-row' : '';
    return `
      <tr class="${isSelected} ${isActive}" onclick="document.dispatchEvent(new CustomEvent('trimify:preview', { detail: { id: '${item.id}' } }))" id="row-${item.id}">
        <td style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${item.relativePath}">${item.relativePath}</td>
        <td>${statusBadge}</td>
        <td style="font-family: var(--font-mono); font-size:0.75rem;">${resString}</td>
        <td style="font-family: var(--font-mono); font-size:0.75rem;">${sizeString}</td>
        <td>${savingPerc}</td>
      </tr>`;
  }).join('');

  // Re-render lucide icons inside badges
  if (typeof (window as any).lucide !== 'undefined') {
    (window as any).lucide.createIcons();
  }
}

async function processNextInQueue() {
  const store = useAppStore.getState();

  if (store.status === 'STOPPED') { haltQueueProcessing(); return; }

  if (store.status === 'PAUSED') {
    log('Proses ditunda (PAUSED).', 'warning');
    await new Promise<void>((resolve) => useAppStore.getState().setPauseResolver(resolve));
    if (useAppStore.getState().status === 'STOPPED') { haltQueueProcessing(); return; }
  }

  const nextItem = useAppStore.getState().files.find((item) => item.status === 'pending');
  if (!nextItem) { finishQueueProcessing(); return; }

  const idx = useAppStore.getState().files.indexOf(nextItem);
  useAppStore.getState().setCurrentIndex(idx);
  useAppStore.getState().updateFile(nextItem.id, { status: 'processing' });
  updateFileListUI();

  const progStatus = document.getElementById('progress-status');
  const progFileInfo = document.getElementById('progress-file-info');
  const progBarFill = document.getElementById('progress-bar-fill');
  if (progStatus) progStatus.textContent = `Memproses: ${idx + 1} dari ${useAppStore.getState().files.length} file...`;
  if (progFileInfo) progFileInfo.textContent = `File: ${nextItem.relativePath}`;
  if (progBarFill) progBarFill.style.width = `${(idx / useAppStore.getState().files.length) * 100}%`;

  // Dispatch preview event for live preview
  document.dispatchEvent(new CustomEvent('trimify:preview', { detail: { id: nextItem.id } }));

  const settings = getSettingsParameters();

  try {
    const result = await CropEngine.processSingleFile(nextItem.file, settings);
    useAppStore.getState().updateFile(nextItem.id, {
      status: 'success',
      croppedBlob: result.blob,
      croppedSize: result.blob.size,
      originalWidth: result.originalWidth,
      originalHeight: result.originalHeight,
      croppedWidth: result.croppedWidth,
      croppedHeight: result.croppedHeight,
      bounds: result.bounds,
    });
    log(`Sukses memotong ${nextItem.name}: ${result.originalWidth}x${result.originalHeight}px &rarr; ${result.croppedWidth}x${result.croppedHeight}px (${Utils.formatBytes(nextItem.originalSize)} &rarr; ${Utils.formatBytes(result.blob.size)})`, 'success');
  } catch (err: any) {
    useAppStore.getState().updateFile(nextItem.id, { status: 'failed', error: err.message });
    log(`Gagal memproses ${nextItem.name}: ${err.message}`, 'error');
  }

  updateFileListUI();
  updateGeneralStats();
  setTimeout(processNextInQueue, 30);
}

function haltQueueProcessing() {
  const { elapsedInterval } = useAppStore.getState();
  if (elapsedInterval) clearInterval(elapsedInterval);
  useAppStore.getState().setStatus('IDLE');
  toggleUIInputsState(false);
  const ps = document.getElementById('progress-status');
  if (ps) ps.textContent = 'Proses dibatalkan.';
  log('Proses selesai dihentikan.', 'warning');
}

function finishQueueProcessing() {
  const { elapsedInterval, files } = useAppStore.getState();
  if (elapsedInterval) clearInterval(elapsedInterval);
  useAppStore.getState().setStatus('IDLE');

  const pbFill = document.getElementById('progress-bar-fill');
  const ps = document.getElementById('progress-status');
  const pfi = document.getElementById('progress-file-info');
  const ptr = document.getElementById('progress-time-remaining');
  if (pbFill) pbFill.style.width = '100%';
  if (ps) ps.textContent = 'Seluruh antrean selesai diproses!';
  if (pfi) pfi.textContent = `Total file: ${files.length}`;
  if (ptr) ptr.textContent = 'Selesai';

  log('Seluruh proses auto-crop telah berhasil diselesaikan!', 'success');

  const completedCount = files.filter((f) => f.status === 'success').length;
  useDialogStore.getState().showToast(
    'Kompresi Selesai!',
    `${completedCount} dari ${files.length} file PNG berhasil dipangkas sempurna.`,
    'check-circle-2'
  );

  document.getElementById('btn-download')?.removeAttribute('disabled');
  toggleUIInputsState(false);
}

export function startQueueProcessing() {
  const { files } = useAppStore.getState();
  if (files.length === 0) return;

  useAppStore.getState().setStatus('PROCESSING');
  useAppStore.getState().setStartTime(Date.now());
  useAppStore.getState().setElapsedSeconds(0);

  const progressPanel = document.getElementById('progress-panel');
  if (progressPanel) progressPanel.style.display = 'block';
  toggleUIInputsState(true);

  const elapsed = document.getElementById('progress-time-elapsed');
  const remaining = document.getElementById('progress-time-remaining');
  if (elapsed) elapsed.textContent = '00:00';
  if (remaining) remaining.textContent = 'Estimating...';

  const prev = useAppStore.getState().elapsedInterval;
  if (prev) clearInterval(prev);

  const interval = setInterval(() => {
    useAppStore.getState().incrementElapsedSeconds();
    const el = document.getElementById('progress-time-elapsed');
    if (el) el.textContent = Utils.formatTime(useAppStore.getState().elapsedSeconds);
    updateTimeEstimation();
  }, 1000);
  useAppStore.getState().setElapsedInterval(interval);

  log(`Memulai auto crop untuk ${files.length} file PNG...`, 'info');
  processNextInQueue();
}

export function pauseQueueProcessing() {
  if (useAppStore.getState().status !== 'PROCESSING') return;
  useAppStore.getState().setStatus('PAUSED');
  const btnPause = document.getElementById('btn-pause');
  const btnResume = document.getElementById('btn-resume');
  if (btnPause) btnPause.style.display = 'none';
  if (btnResume) btnResume.style.display = 'inline-flex';
  log('Meminta penundaan proses...', 'warning');
}

export function resumeQueueProcessing() {
  if (useAppStore.getState().status !== 'PAUSED') return;
  useAppStore.getState().setStatus('PROCESSING');
  const btnPause = document.getElementById('btn-pause');
  const btnResume = document.getElementById('btn-resume');
  if (btnPause) btnPause.style.display = 'inline-flex';
  if (btnResume) btnResume.style.display = 'none';
  log('Melanjutkan proses crop...', 'info');
  const { pauseResolver } = useAppStore.getState();
  if (pauseResolver) { pauseResolver(); useAppStore.getState().setPauseResolver(null); }
}

export function cancelQueueProcessing() {
  if (useAppStore.getState().status === 'IDLE') return;
  useDialogStore.getState().showConfirmDialog({
    title: 'Batalkan Proses Crop?',
    desc: 'Apakah Anda yakin ingin membatalkan proses cropping yang sedang berjalan?',
    confirmText: 'Ya, Batalkan',
    variant: 'danger',
    onConfirm: () => {
      useAppStore.getState().setStatus('STOPPED');
      log('Proses dibatalkan oleh pengguna.', 'warning');
      const { pauseResolver } = useAppStore.getState();
      if (pauseResolver) { pauseResolver(); useAppStore.getState().setPauseResolver(null); }
    },
  });
}
