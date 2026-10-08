import { createPermutationTrace, movePermutationCursor, PERMUTATION_JAVA_LINES } from '../core/permutation-trace.js';
import { escapeHtml, renderHighlightedCode } from './markdown.js';

export function renderPermutationSnapshot(snapshot) {
  const values = (items) => `[${items.join(', ')}]`;
  return `<div class="permutation-lab-grid">
    <section class="permutation-lab-code" aria-label="고정 Java 예제">
      <h3>Java 예제 · nums = [1, 2, 3]</h3>
      <p>${snapshot.event === 'start' ? '시작 전 · 아직 실행한 행이 없습니다.' : `이번 단계의 코드: ${snapshot.executingDepth === null ? 'main' : `깊이 ${snapshot.executingDepth}`} · ${snapshot.line}행`}</p>
      <div class="permutation-lab-source" tabindex="0" aria-label="Java 코드. 가로로 스크롤할 수 있습니다."><pre>${PERMUTATION_JAVA_LINES.map((line, index) => `<span class="permutation-lab-line${snapshot.event !== 'start' && snapshot.line === index + 1 ? ' is-current' : ''}"${snapshot.event !== 'start' && snapshot.line === index + 1 ? ' aria-current="step"' : ''}><span class="permutation-lab-line-number">${index + 1}</span><code>${renderHighlightedCode(line, 'java')}</code></span>`).join('')}</pre></div>
    </section>
    <div class="permutation-lab-state">
      <section><h3>호출 스택 · 프레임별 지역 변수</h3><p>아래쪽이 현재 호출입니다. i는 호출마다 따로 있습니다.</p>
        <ol class="permutation-lab-frames">${snapshot.frames.map((frame, index) => `<li${index === snapshot.frames.length - 1 ? ' class="is-active"' : ''}>깊이 ${frame.depth} · i = ${frame.i === null ? '아직 없음' : frame.i}<strong>${index === snapshot.frames.length - 1 ? '현재 호출' : '호출 대기'}</strong></li>`).join('')}</ol>${snapshot.frames.length ? '' : '<p>실행 중인 호출이 없습니다.</p>'}
      </section>
      <section><h3>모든 호출이 공유하는 상태 · 한 벌</h3><dl><dt>path</dt><dd data-permutation-path>${escapeHtml(values(snapshot.path))}</dd><dt>used · 인덱스 [0, 1, 2]</dt><dd data-permutation-used>${escapeHtml(values(snapshot.used))}</dd></dl><p>return은 공유 상태를 되돌리지 않습니다.<br>path.remove와 used[i] = false가 각각 복구합니다.</p></section>
      <section><h3>results · 경로 복사본 ${snapshot.answers.length}개</h3><ol class="permutation-lab-answers">${snapshot.answers.map((answer) => `<li>${escapeHtml(values(answer))}</li>`).join('')}</ol>${snapshot.answers.length ? '<p>path를 바꿔도 저장한 복사본은 유지됩니다.</p>' : '<p>아직 완성한 순열이 없습니다.</p>'}</section>
    </div>
  </div>`;
}

// Keep the lesson DOM and URL intact, including an existing review return token.
export function openPermutationLab(trigger, host) {
  const trace = createPermutationTrace();
  let cursor = 0;
  const predictionIndex = trace.findIndex((snapshot, index) => snapshot.event === 'return' && trace[index - 1]?.event === 'copy');
  const comparisonIndex = trace[predictionIndex + 1]?.event === 'remove' ? predictionIndex + 1 : -1;
  let prediction = null;
  let disposed = false;
  const readingScroll = window.scrollY;
  const originalHash = window.location.hash;
  const dialog = document.createElement('dialog');
  dialog.className = 'permutation-lab';
  dialog.setAttribute('aria-labelledby', 'permutation-lab-title');
  dialog.innerHTML = `<header><div><p class="eyebrow">기본순열 · 단계 재생</p><h2 id="permutation-lab-title">선택한 뒤, 어떻게 돌아올까요?</h2></div><button type="button" class="button button--secondary" data-permutation-close>문서로 돌아가기</button></header>
    <p>검증된 고정 예제의 계산된 trace를 재생합니다. 임의의 사용자 Java 코드를 실행하는 기능은 아닙니다.</p>
    <p>다음을 누르기 전에 어느 값이 바뀔지 예상해 보세요.</p>
    <div class="permutation-lab-controls"><button type="button" class="button button--secondary" data-permutation-first>처음부터</button><button type="button" class="button button--secondary" data-permutation-previous>이전</button><button type="button" class="button button--primary" data-permutation-next>다음</button><span data-permutation-counter></span></div>
    <p class="permutation-lab-notice">이전은 학습 재생을 되감는 버튼입니다. Java의 return이나 역실행이 아닙니다.<br>강조한 행은 이번 단계와 연결된 코드입니다. 호출은 자식으로 넘어간 시점, 복귀는 호출자에게 돌아온 시점을 보여 줍니다.</p>
    <p class="permutation-lab-description" role="status" aria-live="polite" aria-atomic="true" data-permutation-description></p>
    <section class="permutation-lab-prediction" data-permutation-prediction hidden aria-label="첫 복귀의 path 예상과 관찰">
      <div data-permutation-prediction-question>
        <h3>다음 path.remove 직후, path는 어떻게 될까요?</h3>
        <p>return 뒤에도 path는 [1, 2, 3]입니다.<br>선택하지 않고 다음으로 진행해도 됩니다.</p>
        <div class="permutation-lab-prediction-options">
          <button type="button" class="button button--secondary" data-permutation-predict="keep" aria-pressed="false">[1, 2, 3] 그대로</button>
          <button type="button" class="button button--secondary" data-permutation-predict="remove" aria-pressed="false">[1, 2]로 줄어듦</button>
          <button type="button" class="button button--secondary" data-permutation-skip>건너뛰기</button>
        </div>
        <p data-permutation-prediction-selection>아직 선택하지 않았습니다.</p>
      </div>
      <p data-permutation-prediction-result hidden></p>
    </section>
    <div data-permutation-snapshot></div>`;
  function updatePrediction() {
    const predicting = cursor === predictionIndex;
    const comparing = cursor === comparisonIndex;
    const expected = prediction === 'keep' ? '[1, 2, 3]' : '[1, 2]';
    dialog.querySelector('[data-permutation-prediction]').hidden = !predicting && !comparing;
    dialog.querySelector('[data-permutation-prediction-question]').hidden = !predicting;
    for (const button of dialog.querySelectorAll('[data-permutation-predict]')) {
      button.setAttribute('aria-pressed', String(button.getAttribute('data-permutation-predict') === prediction));
    }
    dialog.querySelector('[data-permutation-prediction-selection]').textContent = prediction
      ? `내 예상: ${expected}. 다음을 눌러 실제 상태와 비교해 보세요.`
      : '아직 선택하지 않았습니다.';
    const result = dialog.querySelector('[data-permutation-prediction-result]');
    result.hidden = !comparing;
    result.textContent = comparing
      ? `${prediction ? `내 예상: ${expected}. ` : ''}실제 path = [${trace[cursor].path.join(', ')}]. return 직후에는 [1, 2, 3]이 남아 있었습니다. path.remove가 마지막 값 3을 지웠습니다.`
      : '';
  }
  function update() {
    const snapshot = trace[cursor];
    // Disabling the focused button can move browser focus to BODY immediately.
    const focusedBeforeUpdate = document.activeElement;
    const previousButton = dialog.querySelector('[data-permutation-previous]');
    const nextButton = dialog.querySelector('[data-permutation-next]');
    const codeScroll = dialog.querySelector(".permutation-lab-source")?.scrollLeft ?? 0;
    dialog.querySelector('[data-permutation-counter]').textContent = `${cursor} / ${trace.length - 1}단계`;
    dialog.querySelector('[data-permutation-description]').textContent = snapshot.description;
    previousButton.disabled = cursor === 0;
    nextButton.disabled = cursor === trace.length - 1;
    dialog.querySelector('[data-permutation-snapshot]').innerHTML = renderPermutationSnapshot(snapshot);
    dialog.querySelector('.permutation-lab-source').scrollLeft = codeScroll;
    updatePrediction();
    if (focusedBeforeUpdate === previousButton && previousButton.disabled) {
      nextButton.focus({ preventScroll: true });
    } else if (focusedBeforeUpdate === nextButton && nextButton.disabled) {
      previousButton.focus({ preventScroll: true });
    }
  }
  function dispose({ restoreFocus = false } = {}) {
    if (disposed) return;
    disposed = true;
    prediction = null;
    dialog.remove();
    if (restoreFocus && trigger.isConnected && window.location.hash === originalHash) {
      trigger.focus({ preventScroll: true });
      window.scrollTo({ top: readingScroll, behavior: 'instant' });
    }
  }
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    dispose({ restoreFocus: true });
  });
  dialog.addEventListener('click', (event) => {
    if (event.target.closest('[data-permutation-close]')) {
      dispose({ restoreFocus: true });
      return;
    }
    const choice = event.target.closest('[data-permutation-predict]');
    if (choice && cursor === predictionIndex) {
      const value = choice.getAttribute('data-permutation-predict');
      if (value !== 'keep' && value !== 'remove') return;
      prediction = value;
      updatePrediction();
      return;
    }
    if (event.target.closest('[data-permutation-skip]') && cursor === predictionIndex) {
      prediction = null;
      cursor = comparisonIndex;
      update();
      dialog.querySelector('[data-permutation-next]').focus({ preventScroll: true });
      return;
    }
    const control = event.target.closest('[data-permutation-first], [data-permutation-previous], [data-permutation-next]');
    if (!control || control.disabled) return;
    if (cursor !== predictionIndex || !control.hasAttribute('data-permutation-next')) prediction = null;
    cursor = control.hasAttribute('data-permutation-first') ? 0 : movePermutationCursor(cursor, control.hasAttribute('data-permutation-next') ? 1 : -1, trace.length);
    update();
  });
  host.append(dialog);
  update();
  dialog.showModal();
  dialog.querySelector('[data-permutation-next]').focus({ preventScroll: true });
  return dispose;
}
