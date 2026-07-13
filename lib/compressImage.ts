// Supabase Storageの無料枠(1GB)を節約するため、
// アップロード前にブラウザ上で長辺1600px・JPEG品質0.8程度に圧縮する。

// createImageBitmap(File) は古いiOS Safariが未対応のため、
// 失敗したら <img> + objectURL で読み込むフォールバックを使う。
async function loadImage(
  file: File
): Promise<{ source: CanvasImageSource; width: number; height: number; cleanup: () => void }> {
  try {
    const bitmap = await createImageBitmap(file);
    return { source: bitmap, width: bitmap.width, height: bitmap.height, cleanup: () => bitmap.close() };
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return {
        source: img,
        width: img.naturalWidth,
        height: img.naturalHeight,
        cleanup: () => URL.revokeObjectURL(url),
      };
    } catch (e) {
      URL.revokeObjectURL(url);
      throw e;
    }
  }
}

export async function compressImage(file: File, maxSize = 1600, quality = 0.8): Promise<Blob> {
  const { source, width: w, height: h, cleanup } = await loadImage(file);
  try {
    let width = w;
    let height = h;
    if (width > maxSize || height > maxSize) {
      const ratio = Math.min(maxSize / width, maxSize / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas context not available");
    ctx.drawImage(source, 0, 0, width, height);

    return await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("compression failed"))),
        "image/jpeg",
        quality
      );
    });
  } finally {
    cleanup();
  }
}
