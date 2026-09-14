(() => {
  const endpoint = (window.WEDDING_UPLOAD_ENDPOINT || '').trim();
  const maxFileBytes = 20 * 1024 * 1024;
  const acceptedTypes = new Set([
    'image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'
  ]);

  const photoInput = document.getElementById('photoInput');
  const uploadButton = document.getElementById('uploadButton');
  const uploadStatus = document.getElementById('uploadStatus');
  const selectionNote = document.getElementById('selectionNote');
  const fileList = document.getElementById('fileList');
  let selectedFiles = [];

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
    A regular form targeting an invisible frame deliberately avoids cross-site
    browser restrictions when this page posts to the owner’s Apps Script URL.
  */
  const postPhoto = (payload) => new Promise((resolve, reject) => {
    const frameName = `wedding-upload-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const frame = document.createElement('iframe');
    frame.name = frameName;
    frame.hidden = true;

    const form = document.createElement('form');
    form.method = 'post';
    form.action = endpoint;
    form.target = frameName;
    form.hidden = true;

    const input = document.createElement('input');
    input.name = 'payload';
    input.value = JSON.stringify(payload);
    form.append(input);

    let submitted = false;
    const cleanup = () => {
      window.clearTimeout(timeout);
      form.remove();
      frame.remove();
    };
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('The upload took too long. Please try that photo again.'));
    }, 90_000);

    frame.addEventListener('load', () => {
      if (!submitted) return;
      cleanup();
      resolve();
    }, { once: true });

    document.body.append(frame, form);
    submitted = true;
    form.submit();
  });

  photoInput.addEventListener('change', () => {
    const chosen = Array.from(photoInput.files || []);
    const rejected = chosen.filter((file) => !fileIsAccepted(file) || file.size > maxFileBytes);
    selectedFiles = chosen.filter((file) => fileIsAccepted(file) && file.size <= maxFileBytes);
    renderFiles();

    if (rejected.length) {
      updateStatus('Some files were skipped. Please choose image files under 20 MB.', 'error');
    } else if (selectedFiles.length) {
      updateStatus(`${selectedFiles.length} photo${selectedFiles.length === 1 ? '' : 's'} ready to upload.`);
    } else {
      updateStatus('Choose one or more photos to begin.');
    }

    selectionNote.textContent = selectedFiles.length
      ? 'Want to change your selection? Choose a new set of photos before uploading.'
      : 'Your photos stay private.';
    uploadButton.disabled = !endpoint || !selectedFiles.length;
  });

  uploadButton.addEventListener('click', async () => {
    if (!endpoint || !selectedFiles.length) return;

    uploadButton.disabled = true;
    photoInput.disabled = true;
    let uploaded = 0;

    try {
      for (const [index, file] of selectedFiles.entries()) {
        updateRow(index, 'Preparing', 'uploading');
        const base64 = await getBase64(file);
        updateRow(index, 'Uploading', 'uploading');
        await postPhoto({
          fileName: file.name,
          mimeType: file.type || 'image/jpeg',
          base64
        });
        uploaded += 1;
        updateRow(index, 'Saved', 'uploaded');
        updateStatus(`Saving photo ${uploaded} of ${selectedFiles.length}…`);
      }

      updateStatus('All set—thank you for sharing these moments with us.', 'success');
      selectionNote.textContent = 'Want to add more? Choose another set of photos.';
      selectedFiles = [];
      photoInput.value = '';
    } catch (error) {
      updateStatus(`We saved ${uploaded} photo${uploaded === 1 ? '' : 's'}. ${error.message}`, 'error');
      photoInput.disabled = false;
      uploadButton.disabled = false;
      return;
    }

    photoInput.disabled = false;
    uploadButton.disabled = true;
  });

  if (!endpoint) {
    updateStatus('This private photo drop is being prepared. Please check back shortly.');
  }
})();
