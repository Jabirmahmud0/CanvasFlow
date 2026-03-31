// OffscreenCanvas worker for pre-rendering complex or static elements
// Used for thumbnail generation in layers panel and asset library

self.onmessage = function(e) {
  const { id, type, width, height, elements } = e.data;

  // Ensure OffscreenCanvas is supported
  if (typeof OffscreenCanvas === 'undefined') {
    self.postMessage({ id, error: 'OffscreenCanvas not supported' });
    return;
  }

  try {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (type === 'thumbnail') {
      // Draw elements
      elements.forEach(el => {
        if (!el.visible === false) {
           ctx.fillStyle = el.fill || '#000';
           ctx.fillRect(el.x || 0, el.y || 0, el.width || 50, el.height || 50);
        }
      });
    }

    // Convert to ImageBitmap
    const imageBitmap = canvas.transferToImageBitmap();
    self.postMessage({ id, imageBitmap }, [imageBitmap]);
  } catch (error) {
    self.postMessage({ id, error: error.message });
  }
};
