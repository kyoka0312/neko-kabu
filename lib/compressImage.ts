// Supabase Storageの無料枠(1GB)を節約するため、
// アップロード前にブラウザ上で長辺1600px・JPEG品質0.8程度に圧縮する。
export async function compressImage(file: File, maxSize = 1600, quality = 0.8): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;

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
  ctx.drawImage(bitmap, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("compression failed"))),
      "image/jpeg",
      quality
    );
  });
}
