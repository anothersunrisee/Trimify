// Settings reader — reads DOM input elements and returns CropSettings
// Identical logic to getSettingsParameters() in index.html
import { CropSettings } from './cropEngine';

export function getSettingsParameters(): CropSettings {
  const threshold = parseInt((document.getElementById('input-threshold') as HTMLInputElement).value);
  const noise = parseInt((document.getElementById('input-noise') as HTMLInputElement).value);
  const padding = parseInt((document.getElementById('input-padding') as HTMLInputElement).value);
  const format = (document.getElementById('input-format') as HTMLSelectElement).value as CropSettings['format'];
  const qualityVal = parseInt((document.getElementById('input-quality') as HTMLInputElement).value);
  const quality = qualityVal / 100;
  const bgColor = (document.getElementById('input-bg-color') as HTMLInputElement).value;
  const preserveFolder = (document.getElementById('input-preserve-folder') as HTMLInputElement).checked;
  const overwriteName = (document.getElementById('input-overwrite-filename') as HTMLInputElement).checked;
  return { threshold, noise, padding, format, quality, bgColor, preserveFolder, overwriteName };
}
