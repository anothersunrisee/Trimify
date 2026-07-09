// Logger — appends log entries to the DOM console-output element
// Identical logic to log() and related functions in index.html

export interface LogLine {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export const loggerLines: LogLine[] = [];

function escapeHTML(str: string): string {
  return str.replace(/[&<>'"]/g, (tag) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] ?? tag)
  );
}

export function log(message: string, type: LogLine['type'] = 'info'): void {
  const output = document.getElementById('console-output');
  if (!output) return;

  const timestamp = new Date().toLocaleTimeString();
  loggerLines.push({ timestamp, message, type });

  const entry = document.createElement('div');
  entry.className = `log-entry log-${type}`;
  entry.innerHTML = `
    <span class="log-timestamp">[${timestamp}]</span>
    <span class="log-text">${escapeHTML(message)}</span>
  `;

  output.appendChild(entry);
  output.scrollTop = output.scrollHeight;
}

export function clearConsoleLogs(): void {
  const output = document.getElementById('console-output');
  if (output) output.innerHTML = '';
  loggerLines.length = 0;
  log('Konsol aktivitas dibersihkan.', 'info');
}

export function copyConsoleLogs(
  showAlertDialog: (title: string, desc: string, type: 'info' | 'warning' | 'error' | 'success') => void
): void {
  const textToCopy = loggerLines
    .map((l) => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message}`)
    .join('\n');
  navigator.clipboard
    .writeText(textToCopy)
    .then(() => showAlertDialog('Berhasil', 'Log aktivitas berhasil disalin ke clipboard.', 'success'))
    .catch((err) => showAlertDialog('Gagal Menyalin', 'Gagal menyalin log: ' + err, 'error'));
}
