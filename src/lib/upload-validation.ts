import path from "path";

const SIGNATURES: Record<string, (buffer: Buffer) => boolean> = {
  "image/jpeg": (buffer) => buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])),
  "image/png": (buffer) => buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  "image/gif": (buffer) => buffer.subarray(0, 6).toString("ascii") === "GIF87a" || buffer.subarray(0, 6).toString("ascii") === "GIF89a",
  "image/webp": (buffer) => buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP",
  "application/pdf": (buffer) => buffer.subarray(0, 5).toString("ascii") === "%PDF-",
  "application/msword": (buffer) => buffer.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])),
  "application/vnd.ms-excel": (buffer) => buffer.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])),
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": (buffer) => buffer.subarray(0, 4).toString("ascii") === "PK\u0003\u0004",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": (buffer) => buffer.subarray(0, 4).toString("ascii") === "PK\u0003\u0004",
};

function looksLikeText(buffer: Buffer): boolean {
  return !buffer.includes(0);
}

function isSafeSvg(buffer: Buffer): boolean {
  const text = buffer.toString("utf8", 0, Math.min(buffer.length, 4096)).trim();
  if (!/<svg[\s>]/i.test(text)) return false;
  return !/<script[\s>]/i.test(text) && !/\son[a-z]+\s*=/i.test(text) && !/javascript:/i.test(text);
}

export function validateUploadBuffer(
  buffer: Buffer,
  declaredType: string,
  allowedTypes: readonly string[]
): { ok: true; mimeType: string } | { ok: false; error: string } {
  if (!allowedTypes.includes(declaredType)) {
    return { ok: false, error: "Invalid file type." };
  }

  if (declaredType === "image/svg+xml") {
    return isSafeSvg(buffer)
      ? { ok: true, mimeType: declaredType }
      : { ok: false, error: "Invalid or unsafe SVG file." };
  }

  if (declaredType === "text/plain" || declaredType === "text/csv") {
    return looksLikeText(buffer)
      ? { ok: true, mimeType: declaredType }
      : { ok: false, error: "Invalid text file." };
  }

  const matchesSignature = SIGNATURES[declaredType]?.(buffer);
  if (!matchesSignature) {
    return { ok: false, error: "File content does not match the declared type." };
  }

  return { ok: true, mimeType: declaredType };
}

export function safeUploadFilename(originalName: string): string {
  const baseName = path.basename(originalName || "file");
  const safeName = baseName
    .replace(/\.\./g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/^[._]+/, "")
    .slice(0, 120);

  return safeName || "file";
}

export function assertPathInside(baseDir: string, targetPath: string): boolean {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(targetPath);
  return resolvedTarget === resolvedBase || resolvedTarget.startsWith(`${resolvedBase}${path.sep}`);
}
