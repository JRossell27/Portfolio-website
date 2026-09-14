(() => {
  const endpoint = (window.WEDDING_UPLOAD_ENDPOINT || '').trim();
  const maxFileBytes = 20 * 1024 * 1024;
  const acceptedTypes = new Set([
    'image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'
  ]);

  const photoInput = document.getElementById('photoInput');
  const uploadStatus = document.getElementById('uploadStatus');
  const selectionNote = document.getElementById('selectionNote');
  const fileList = document.getElementById('fileList');

  const updateStatus = (message, type = '') => {
    uploadStatus.textContent = message;
    uploadStatus.className = `upload-status${type ? ` is-${type}` : ''}`;
  };

  const fileIsAccepted = (file) => acceptedTypes.has(file.type) || /\.(jpe?g|png|heic|heif|webp)$/i.test(file.name);

  const clearList = () => { fileList.replaceChildren(); };

  const renderFiles = () => {
    clearList();
    selectedFiles.forEach((file, index) => {
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
  };

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
    Apps Script accepts a normal form-encoded POST. `no-cors` keeps this public
    upload request simple for guests while the page still waits for the network
    request to complete before moving to the next photo.
  */
  const postPhoto = async (payload) => {
    const body = new URLSearchParams({ payload: JSON.stringify(payload) });
    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body
    });
  };

  const uploadFiles = async (files) => {
    photoInput.disabled = true;
    let uploaded = 0;

    try {
      for (const [index, file] of files.entries()) {
        updateRow(index, 'Preparing', 'uploading');
        const base64 = await getBase64(file);
        updateRow(index, 'Uploading', 'uploading');
        updateStatus(`Uploading photo ${index + 1} of ${files.length}. Keep this page open.`);
        await postPhoto({
          fileName: file.name,
          mimeType: file.type || 'image/jpeg',
          base64
        });
        uploaded += 1;
        updateRow(index, 'Saved', 'uploaded');
      }

      updateStatus('All set—thank you for sharing these moments with us.', 'success');
      selectionNote.textContent = 'Want to add more? Choose another set of photos.';
    } catch (error) {
      updateStatus(`We saved ${uploaded} photo${uploaded === 1 ? '' : 's'}. ${error.message}`, 'error');
    } finally {
      photoInput.disabled = false;
      photoInput.value = '';
    }
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
    if (endpoint && acceptedFiles.length) uploadFiles(acceptedFiles);
  });

  if (!endpoint) {
    updateStatus('This private photo drop is being prepared. Please check back shortly.');
  }
})();
