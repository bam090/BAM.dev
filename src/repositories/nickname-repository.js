export const NICKNAME_STORAGE_KEY = "bam.dev.profile.nickname.v1";

function normalizeNickname(value) {
  const input = String(value ?? "");
  if (/\p{Cc}/u.test(input)) throw new TypeError("호칭에 제어문자를 사용할 수 없습니다.");
  const nickname = input.trim();
  if (Array.from(nickname).length > 20) throw new RangeError("호칭은 20자 이하로 입력해 주세요.");
  return nickname;
}

export class LocalStorageNicknameRepository {
  constructor(storage) {
    this.storage = storage;
  }

  read() {
    try {
      return normalizeNickname(this.storage.getItem(NICKNAME_STORAGE_KEY));
    } catch {
      return "";
    }
  }

  save(value) {
    const nickname = normalizeNickname(value);
    try {
      if (nickname) this.storage.setItem(NICKNAME_STORAGE_KEY, nickname);
      else this.storage.removeItem(NICKNAME_STORAGE_KEY);
      return { nickname, persistent: this.storage.isPersistent?.() !== false };
    } catch {
      return { nickname, persistent: false };
    }
  }
}
