# Wedding photo-drop status

The page is intentionally kept out of the portfolio navigation and carries a `noindex` search directive. It will live at:

`https://jasonrossell.com/racheljasonweddingpics/`

## Live connection

The Google Apps Script upload service has been deployed and its live URL is already saved in `upload-config.js`. Guest uploads are sent into the configured wedding folder without requiring a Google account.

## Managing uploads

1. The folder itself stays private—do not share it with guests.
2. To stop receiving new photos after the wedding, open the **Rachel & Jason Wedding Photo Drop** Apps Script project, set `ACCEPT_UPLOADS` to `false`, save, then deploy a new version.
3. If you ever change Drive folders, replace the folder ID in `google-apps-script/Code.gs`, save, and deploy a new version.
4. Upload a photo from a phone once the site is deployed, before printing or sharing the QR code.

The site sends photos one at a time so guests can choose as many as they like without a per-person cap. Google Drive storage is still finite, and the handler presently keeps individual image files below 20 MB. Set `ACCEPT_UPLOADS` to `false` in Apps Script and redeploy when the event is over.
