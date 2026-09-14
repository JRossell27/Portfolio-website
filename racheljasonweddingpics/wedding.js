(() => {
  const endpoint = (window.WEDDING_UPLOAD_ENDPOINT || '').trim();
  const maxFileBytes = 20 * 1024 * 1024;
  const maxConcurrentUploads = 2;
  const acceptedTypes = new Set([
    'image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'
  ]);

  const photoInput = document.getElementById('photoInput');
  const uploadStatus = document.getElementById('uploadStatus');
  const selectionNote = document.getElementById('selectionNote');
  const keepOpenNotice = document.getElementById('keepOpenNotice');
  const fileList = document.getElementById('fileList');

  const updateStatus = (message, type = '') => {
    uploadStatus.textContent = message;
    uploadStatus.className = `upload-status${type ? ` is-${type}` : ''}`;
  };

  const fileIsAccepted = (file) => acceptedTypes.has(file.type) || /\.(jpe?g|png|heic|heif|webp)$/i.test(file.name);

  const clearList = () => { fileList.replaceChildren(); };

  const updateRow = (index, message, state) => {
    const row = fileList.querySelector(`[data-file-index="${index}"]`);
    if (!row) return;
    row.className = `file-row is-${state}`;
    row.querySelector('.file-row-status').textContent = message;
  };

  const getBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('The file could not be read from this device.'));
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.readAsDataURL(file);
  });

  /*
    Send the JSON directly instead of form-encoding it. That avoids expanding
    the already base64-encoded photo a second time, while remaining a simple
    public request for guests.
  */
  const postPhoto = async (payload) => {
    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify(payload)
    });
  };

  const uploadFiles = async (files) => {
    photoInput.disabled = true;
    let uploaded = 0;
    let failed = 0;
    let nextIndex = 0;
    const workerCount = Math.min(maxConcurrentUploads, files.length);

    const uploadOne = async () => {
      while (nextIndex < files.length) {
        const index = nextIndex;
        nextIndex += 1;
        const file = files[index];

        try {
        updateRow(index, 'Preparing', 'uploading');
        const base64 = await getBase64(file);
        updateRow(index, 'Uploading', 'uploading');
        updateStatus(`Uploading up to ${workerCount} photos at a time. Keep this page open.`);
        await postPhoto({
          fileName: file.name,
          mimeType: file.type || 'image/jpeg',
          base64
        });
        uploaded += 1;
        updateRow(index, 'Saved', 'uploaded');
        updateStatus(`${uploaded} of ${files.length} photos saved. Keep this page open.`);
        } catch (error) {
          failed += 1;
          updateRow(index, 'Could not save', 'error');
        }
      }
    };

    updateStatus(`Starting your upload. We will send up to ${workerCount} photos at a time—please keep this page open.`);
    await Promise.all(Array.from({ length: workerCount }, uploadOne));

    if (failed) {
      updateStatus(`${uploaded} photo${uploaded === 1 ? '' : 's'} saved. ${failed} could not be saved—please select those again and try once more.`, 'error');
    } else {
      updateStatus('All set—thank you for sharing these moments with us.', 'success');
      selectionNote.textContent = 'Want to add more? Choose another set of photos.';
      keepOpenNotice.hidden = true;
    }

    photoInput.disabled = false;
    photoInput.value = '';
  };

  photoInput.addEventListener('change', () => {
    const chosen = Array.from(photoInput.files || []);
    const rejected = chosen.filter((file) => !fileIsAccepted(file) || file.size > maxFileBytes);
    const acceptedFiles = chosen.filter((file) => fileIsAccepted(file) && file.size <= maxFileBytes);
    clearList();
    acceptedFiles.forEach((file, index) => {
      const row = document.createElement('div');
      row.className = 'file-row';
      row.dataset.fileIndex = String(index);

      const name = document.createElement('span');
      name.className = 'file-row-name';
      name.textContent = file.name;

      const status = document.createElement('span');
      status.className = 'file-row-status';
      status.textContent = `${Math.max(1, Math.round(file.size / 1024 / 1024))} MB`;
      row.append(name, status);
      fileList.append(row);
    });

    if (rejected.length) {
      updateStatus('Some files were skipped. Please choose image files under 20 MB.', 'error');
    } else if (acceptedFiles.length) {
      updateStatus(`Starting ${acceptedFiles.length} photo${acceptedFiles.length === 1 ? '' : 's'}…`);
    } else {
      updateStatus('Choose one or more photos to begin.');
    }

    selectionNote.textContent = acceptedFiles.length
      ? 'Your upload has started. Please keep this page open until it finishes.'
      : 'Choose as many photos as you like. They will start uploading right away.';
    keepOpenNotice.hidden = !acceptedFiles.length;
    if (endpoint && acceptedFiles.length) uploadFiles(acceptedFiles);
  });

  if (!endpoint) {
    updateStatus('This private photo drop is being prepared. Please check back shortly.');
  }
})();
