/**
 * Convert a File/Blob to a persistable data URL so previews survive refresh.
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }
    if (typeof file === "string") {
      resolve(file);
      return;
    }
    if (typeof FileReader === "undefined") {
      reject(new Error("FileReader is not available"));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function isBlobUrl(url) {
  return typeof url === "string" && url.startsWith("blob:");
}

export function revokeIfBlobUrl(url) {
  if (isBlobUrl(url) && typeof URL !== "undefined" && typeof URL.revokeObjectURL === "function") {
    URL.revokeObjectURL(url);
  }
}

export function fileMeta(file) {
  if (!file) return null;
  if (typeof file === "object" && file.name) {
    return {
      name: file.name,
      size: file.size ?? 0,
      type: file.type ?? "",
    };
  }
  return null;
}
