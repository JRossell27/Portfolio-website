/*
  Rachel & Jason wedding photo drop

  1. Create a dedicated folder in Google Drive, then copy its ID from the URL.
  2. In script.google.com, create a new Apps Script project and paste this file.
  3. Replace FOLDER_ID below, then deploy as a Web app:
       Execute as: Me
       Who has access: Anyone
  4. Copy the deployed /exec URL into ../upload-config.js.

  Never share the Drive folder itself with guests. The public upload page is
  upload-only; the folder remains visible only to its owner.
*/

const FOLDER_ID = '1pDIiUgImuNAdyZZTu6EdjRXL1k1e4BpV';
const ACCEPT_UPLOADS = true;
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'
]);

function doGet() {
  return ContentService
    .createTextOutput('This link only receives wedding photo uploads.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(event) {
  try {
    if (!ACCEPT_UPLOADS) throw new Error('Photo uploads are closed.');
    if (FOLDER_ID.indexOf('PASTE_') === 0) throw new Error('The photo-drop folder has not been configured.');

    const payload = JSON.parse(event.parameter.payload || '{}');
    const fileName = safeFileName_(payload.fileName);
    const mimeType = String(payload.mimeType || '').toLowerCase();
    const base64 = String(payload.base64 || '');

    if (!ALLOWED_MIME_TYPES.has(mimeType)) throw new Error('Only JPG, PNG, HEIC, HEIF, and WebP images can be uploaded.');
    if (!fileName || !base64) throw new Error('This upload was missing photo data.');

    const bytes = Utilities.base64Decode(base64);
    if (!bytes.length || bytes.length > MAX_FILE_BYTES) throw new Error('Each photo must be under 20 MB.');

    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HH-mm-ss');
    const blob = Utilities.newBlob(bytes, mimeType, `${timestamp}_${fileName}`);
    const file = DriveApp.getFolderById(FOLDER_ID).createFile(blob);
    file.setDescription('Uploaded through Rachel & Jason’s wedding photo drop.');

    return json_({ ok: true, id: file.getId() });
  } catch (error) {
    return json_({ ok: false, error: String(error.message || error) });
  }
}

function safeFileName_(value) {
  return String(value || '')
    .replace(/[^a-zA-Z0-9._ -]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 120);
}

function json_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
