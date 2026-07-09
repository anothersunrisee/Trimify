// CropEngine — pixel boundary scanner and image processor
// Identical logic to the CropEngine object in index.html

export interface CropSettings {
  threshold: number;
  noise: number;
  padding: number;
  format: 'png' | 'webp' | 'jpeg';
  quality: number;
  bgColor: string;
  preserveFolder: boolean;
  overwriteName: boolean;
}

export interface CropBounds {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface CropResult {
  blob: Blob;
  originalWidth: number;
  originalHeight: number;
  croppedWidth: number;
  croppedHeight: number;
  bounds: { x: number; y: number; w: number; h: number };
}

export const CropEngine = {
  isNoise(
    x: number,
    y: number,
    data: Uint8ClampedArray,
    width: number,
    height: number,
    threshold: number,
    noiseThreshold: number
  ): boolean {
    if (noiseThreshold <= 0) return false;
    let activeCount = 0;
    const radius = Math.min(3, Math.ceil(noiseThreshold / 2));
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const idx = (ny * width + nx) * 4 + 3;
          if (data[idx] >= threshold) {
            activeCount++;
            if (activeCount >= noiseThreshold) return false;
          }
        }
      }
    }
    return true;
  },

  findBoundaries(
    width: number,
    height: number,
    data: Uint8ClampedArray,
    threshold: number,
    noiseThreshold: number
  ): CropBounds | null {
    let top = -1, bottom = -1, left = -1, right = -1;

    // Scan Top
    outer: for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4 + 3;
        if (data[idx] >= threshold) {
          if (noiseThreshold > 0 && this.isNoise(x, y, data, width, height, threshold, noiseThreshold)) continue;
          top = y;
          break outer;
        }
      }
    }
    if (top === -1) return null;

    // Scan Bottom
    outer: for (let y = height - 1; y >= top; y--) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4 + 3;
        if (data[idx] >= threshold) {
          if (noiseThreshold > 0 && this.isNoise(x, y, data, width, height, threshold, noiseThreshold)) continue;
          bottom = y;
          break outer;
        }
      }
    }
    if (bottom === -1) bottom = top;

    // Scan Left
    outer: for (let x = 0; x < width; x++) {
      for (let y = top; y <= bottom; y++) {
        const idx = (y * width + x) * 4 + 3;
        if (data[idx] >= threshold) {
          if (noiseThreshold > 0 && this.isNoise(x, y, data, width, height, threshold, noiseThreshold)) continue;
          left = x;
          break outer;
        }
      }
    }

    // Scan Right
    outer: for (let x = width - 1; x >= (left !== -1 ? left : 0); x--) {
      for (let y = top; y <= bottom; y++) {
        const idx = (y * width + x) * 4 + 3;
        if (data[idx] >= threshold) {
          if (noiseThreshold > 0 && this.isNoise(x, y, data, width, height, threshold, noiseThreshold)) continue;
          right = x;
          break outer;
        }
      }
    }

    if (left === -1) left = 0;
    if (right === -1) right = width - 1;

    return { top, bottom, left, right };
  },

  async processSingleFile(file: File, settings: CropSettings): Promise<CropResult> {
    const imgBitmap = await createImageBitmap(file);
    const width = imgBitmap.width;
    const height = imgBitmap.height;

    let canvas: HTMLCanvasElement | OffscreenCanvas;
    let ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

    if (typeof OffscreenCanvas !== 'undefined') {
      canvas = new OffscreenCanvas(width, height);
      ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
    } else {
      canvas = document.createElement('canvas');
      (canvas as HTMLCanvasElement).width = width;
      (canvas as HTMLCanvasElement).height = height;
      ctx = (canvas as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;
    }

    ctx.drawImage(imgBitmap, 0, 0);
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const bounds = this.findBoundaries(width, height, data, settings.threshold, settings.noise);

    let targetWidth: number, targetHeight: number;
    let cropX: number, cropY: number, cropW: number, cropH: number;

    if (!bounds) {
      targetWidth = 1; targetHeight = 1;
      cropX = 0; cropY = 0; cropW = 1; cropH = 1;
    } else {
      const pad = settings.padding;
      cropX = Math.max(0, bounds.left - pad);
      cropY = Math.max(0, bounds.top - pad);
      const cropRight = Math.min(width - 1, bounds.right + pad);
      const cropBottom = Math.min(height - 1, bounds.bottom + pad);
      cropW = cropRight - cropX + 1;
      cropH = cropBottom - cropY + 1;
      targetWidth = cropW;
      targetHeight = cropH;
    }

    let finalCanvas: HTMLCanvasElement | OffscreenCanvas;
    let finalCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

    if (typeof OffscreenCanvas !== 'undefined') {
      finalCanvas = new OffscreenCanvas(targetWidth, targetHeight);
      finalCtx = finalCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
    } else {
      finalCanvas = document.createElement('canvas');
      (finalCanvas as HTMLCanvasElement).width = targetWidth;
      (finalCanvas as HTMLCanvasElement).height = targetHeight;
      finalCtx = (finalCanvas as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D;
    }

    if (settings.format === 'jpeg') {
      finalCtx.fillStyle = settings.bgColor;
      finalCtx.fillRect(0, 0, targetWidth, targetHeight);
    }

    if (bounds) {
      finalCtx.drawImage(imgBitmap, cropX, cropY, cropW, cropH, 0, 0, targetWidth, targetHeight);
    }

    let outBlobType = 'image/png';
    let outQuality: number | undefined;
    if (settings.format === 'webp') { outBlobType = 'image/webp'; outQuality = settings.quality; }
    else if (settings.format === 'jpeg') { outBlobType = 'image/jpeg'; outQuality = settings.quality; }

    const retrieveBlob = async (c: HTMLCanvasElement | OffscreenCanvas): Promise<Blob> => {
      if ('toBlob' in c && typeof (c as HTMLCanvasElement).toBlob === 'function') {
        return new Promise((res) => (c as HTMLCanvasElement).toBlob((b) => res(b!), outBlobType, outQuality));
      }
      return (c as OffscreenCanvas).convertToBlob({ type: outBlobType, quality: outQuality });
    };

    const outBlob = await retrieveBlob(finalCanvas);
    imgBitmap.close();

    return {
      blob: outBlob,
      originalWidth: width,
      originalHeight: height,
      croppedWidth: targetWidth,
      croppedHeight: targetHeight,
      bounds: bounds ? { x: cropX, y: cropY, w: cropW, h: cropH } : { x: 0, y: 0, w: width, h: height },
    };
  },
};
