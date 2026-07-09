// Pure utility helpers — identical to the Utils object in index.html
export const Utils = {
  formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0.00 KB';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  },

  getExt(format: string): string {
    return format.toLowerCase() === 'jpeg' ? 'jpg' : format.toLowerCase();
  },
};
