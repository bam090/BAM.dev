import assert from "node:assert/strict";
import test from "node:test";

import { createJavaClassJar } from "../src/grading/java-browser-class-jar.js";

const java17 = Uint8Array.from([0xca, 0xfe, 0xba, 0xbe, 0, 0, 0, 61, 1, 2, 3]);

function storedZipFiles(zip) {
  const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  const files = new Map();
  let offset = 0;
  while (view.getUint32(offset, true) === 0x04034b50) {
    assert.equal(view.getUint16(offset + 8, true), 0, "class JAR must store bytes without compression");
    const length = view.getUint32(offset + 18, true);
    const nameLength = view.getUint16(offset + 26, true);
    const extraLength = view.getUint16(offset + 28, true);
    const nameStart = offset + 30;
    const dataStart = nameStart + nameLength + extraLength;
    const name = new TextDecoder().decode(zip.subarray(nameStart, nameStart + nameLength));
    files.set(name, zip.slice(dataStart, dataStart + length));
    offset = dataStart + length;
  }
  assert.equal(view.getUint32(offset, true), 0x02014b50, "ZIP central directory must follow class data");
  return files;
}

test("JAR는 dotted binary name을 classpath 경로로 옮기고 원본 byte를 보존한다", () => {
  const classes = { Solution: java17, "bridge.array.Test": java17, ["__proto__"]: java17 };
  const files = storedZipFiles(createJavaClassJar(classes));
  assert.deepEqual([...files.keys()], ["Solution.class", "bridge/array/Test.class", "__proto__.class"]);
  assert.deepEqual(files.get("bridge/array/Test.class"), java17);
  assert.deepEqual(files.get("__proto__.class"), java17);
});

test("잘린 class와 Java 21·preview header는 JAR 생성 전에 거부한다", () => {
  for (const bytes of [
    java17.subarray(0, 7),
    Uint8Array.from([0xca, 0xfe, 0xba, 0xbe, 0, 0, 0, 65]),
    Uint8Array.from([0xca, 0xfe, 0xba, 0xbe, 0xff, 0xff, 0, 61]),
  ]) {
    assert.throws(() => createJavaClassJar({ Solution: bytes }));
  }
});

test("경로 탈출과 prototype에서 상속한 class는 JAR에 들어가지 않는다", () => {
  for (const name of ["../Escape", "pkg/Escape", "pkg..Escape", "pkg\\Escape"]) {
    assert.throws(() => createJavaClassJar({ Solution: java17, [name]: java17 }));
  }
  const inherited = Object.create({ Escaped: java17 });
  inherited.Solution = java17;
  assert.deepEqual([...storedZipFiles(createJavaClassJar(inherited)).keys()], ["Solution.class"]);
});
