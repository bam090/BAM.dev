const MAX_CLASSES = 256;
const MAX_CLASS_BYTES = 8 * 1024 * 1024;
const binaryName = /^[\p{ID_Start}_$][\p{ID_Continue}$]*(?:\.[\p{ID_Start}_$][\p{ID_Continue}$]*)*$/u;
const encoder = new TextEncoder();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// CheerpOS /str cannot create package directories, so package classes travel as one RAM JAR.
export function createJavaClassJar(classes) {
  if (classes === null || typeof classes !== "object" || Array.isArray(classes)) {
    throw new TypeError("Java classes must be a binary-name map.");
  }
  const entries = Object.entries(classes);
  if (entries.length < 1 || entries.length > MAX_CLASSES) {
    throw new RangeError("Java class count is outside the supported range.");
  }
  const files = [];
  let classBytes = 0;
  let total = 22;
  for (const [name, bytes] of entries) {
    if (name.length > 255 || !binaryName.test(name)
        || !(bytes instanceof Uint8Array) || bytes.byteLength < 8) {
      throw new TypeError("Invalid Java class name or bytes.");
    }
    const header = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (header.getUint32(0) !== 0xcafebabe || header.getUint16(4) !== 0 || header.getUint16(6) !== 61) {
      throw new TypeError("Java class must target Java 17 without preview.");
    }
    classBytes += bytes.byteLength;
    if (classBytes > MAX_CLASS_BYTES) throw new RangeError("Java class bytes exceed the limit.");
    const fileName = encoder.encode(`${name.replaceAll(".", "/")}.class`);
    if (fileName.byteLength > 0xffff) throw new RangeError("Java class path is too long.");
    const crc = crc32(bytes);
    files.push({ bytes, fileName, crc });
    total += 30 + fileName.length + bytes.length + 46 + fileName.length;
  }
  const jar = new Uint8Array(total);
  const view = new DataView(jar.buffer);
  let cursor = 0;
  const central = [];
  for (const file of files) {
    const offset = cursor;
    view.setUint32(cursor, 0x04034b50, true);
    view.setUint16(cursor + 4, 20, true);
    view.setUint16(cursor + 6, 0x0800, true);
    view.setUint16(cursor + 8, 0, true);
    view.setUint32(cursor + 14, file.crc, true);
    view.setUint32(cursor + 18, file.bytes.length, true);
    view.setUint32(cursor + 22, file.bytes.length, true);
    view.setUint16(cursor + 26, file.fileName.length, true);
    cursor += 30;
    jar.set(file.fileName, cursor); cursor += file.fileName.length;
    jar.set(file.bytes, cursor); cursor += file.bytes.length;
    central.push({ ...file, offset });
  }
  const centralStart = cursor;
  for (const file of central) {
    view.setUint32(cursor, 0x02014b50, true);
    view.setUint16(cursor + 4, 20, true);
    view.setUint16(cursor + 6, 20, true);
    view.setUint16(cursor + 8, 0x0800, true);
    view.setUint16(cursor + 10, 0, true);
    view.setUint32(cursor + 16, file.crc, true);
    view.setUint32(cursor + 20, file.bytes.length, true);
    view.setUint32(cursor + 24, file.bytes.length, true);
    view.setUint16(cursor + 28, file.fileName.length, true);
    view.setUint32(cursor + 42, file.offset, true);
    cursor += 46;
    jar.set(file.fileName, cursor); cursor += file.fileName.length;
  }
  view.setUint32(cursor, 0x06054b50, true);
  view.setUint16(cursor + 8, files.length, true);
  view.setUint16(cursor + 10, files.length, true);
  view.setUint32(cursor + 12, cursor - centralStart, true);
  view.setUint32(cursor + 16, centralStart, true);
  return jar;
}
