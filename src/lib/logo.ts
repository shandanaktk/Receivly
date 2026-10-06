function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

function compressLogo(dataUrl: string) {
  return new Promise<string>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const max = 480;
      const scale = Math.min(1, max / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        resolve(dataUrl);
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = () => reject(new Error("That image could not be used as a logo."));
    image.src = dataUrl;
  });
}

export async function readLogoFile(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Upload a PNG, JPG, WebP, or SVG logo.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Logo must be 5 MB or smaller.");
  const dataUrl = await readAsDataUrl(file);
  if (file.type === "image/svg+xml" || file.type === "image/gif") return dataUrl;
  return compressLogo(dataUrl);
}
