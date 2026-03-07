/**
 * File I/O helpers — JSON import/export via browser APIs.
 * No React imports.
 */
import { getCurrentDateTimeString } from './formatters.js';

/**
 * Trigger a JSON file download in the browser using the Blob API.
 *
 * @param {object} data      — plain JS object to serialize
 * @param {string} [filename] — optional custom filename (without .json)
 */
export function downloadJSON(data, filename) {
  const name = filename
    ? `${filename}.json`
    : `budget_data_${getCurrentDateTimeString()}.json`;

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/**
 * Read a JSON file selected by the user and resolve with the parsed object.
 *
 * @param {File} file  — File object from an <input type="file"> change event
 * @returns {Promise<object>}
 */
export function readJSONFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const parsed = JSON.parse(e.target.result);
        resolve(parsed);
      } catch {
        reject(new Error('Invalid JSON file format'));
      }
    };
    reader.onerror = () => reject(new Error('FileReader error'));
    reader.readAsText(file);
  });
}
