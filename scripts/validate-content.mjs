import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertValidCurriculum } from "../src/core/content.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const curriculumPath = path.join(projectRoot, "content/curriculum.json");
const curriculum = assertValidCurriculum(JSON.parse(await readFile(curriculumPath, "utf8")));
const contentErrors = [];

for (const lesson of curriculum.lessons) {
  const absolutePath = path.resolve(projectRoot, lesson.contentFile);
  if (!absolutePath.startsWith(`${path.join(projectRoot, "content", "lessons")}${path.sep}`)) {
    contentErrors.push(`${lesson.id}: 콘텐츠 디렉터리 밖을 가리킵니다.`);
    continue;
  }

  try {
    await access(absolutePath);
    const markdown = await readFile(absolutePath, "utf8");
    if (!markdown.startsWith("# ")) {
      contentErrors.push(`${lesson.id}: H1 제목으로 시작해야 합니다.`);
    }
    if (!markdown.includes("## 학습 목표")) {
      contentErrors.push(`${lesson.id}: 학습 목표 섹션이 없습니다.`);
    }
    if (!markdown.includes("## 확인 문제") && !markdown.includes("## 최종 확인 문제")) {
      contentErrors.push(`${lesson.id}: 확인 문제 섹션이 없습니다.`);
    }
    if (markdown.length < 500) {
      contentErrors.push(`${lesson.id}: 교안 본문이 지나치게 짧습니다.`);
    }
  } catch {
    contentErrors.push(`${lesson.id}: ${lesson.contentFile} 파일을 읽을 수 없습니다.`);
  }
}

if (contentErrors.length > 0) {
  throw new Error(`콘텐츠 파일 검증 실패:\n- ${contentErrors.join("\n- ")}`);
}

const availableLanguages = curriculum.languages.filter((language) => language.status === "available");
console.log(
  `콘텐츠 검증 완료: 언어 ${availableLanguages.length}개, 교안 ${curriculum.lessons.length}개`,
);
