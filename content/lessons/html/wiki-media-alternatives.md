# 미디어의 재생과 대체 정보

## 학습 목표

오디오·비디오에서 재생 조작과 자막·대본·추가 설명의 역할을 구분할 수 있습니다.

## 한줄 요약

미디어는 재생 버튼뿐 아니라 콘텐츠에 맞는 자막·대본과 필요한 시각 정보의 설명을 함께 제공해야 합니다.

## 먼저 확인할 개념

[링크와 버튼, 이동할 주소](#/learn/html/wiki-links-buttons), [이미지의 목적과 대체 텍스트](#/learn/html/wiki-image-alternatives)의 관계를 알고 있으면 이 문서를 읽기 쉽습니다.

## 목적부터 묻는 선택 순서

| 먼저 물을 질문 | 알맞은 관계 | 먼저 검토할 요소 |
| --- | --- | --- |
| 소리나 영상을 재생하는가? | 시간에 따라 진행되는 미디어 | `audio`, `video` |

## 오디오와 비디오는 재생만으로 끝나지 않는다

`controls`는 브라우저가 재생·일시정지·음량 같은 조작 화면을 제공하도록 한다.

```html
<video controls width="640">
  <source src="media/book-talk.mp4" type="video/mp4">
  <track
    kind="captions"
    src="media/book-talk-ko.vtt"
    srclang="ko"
    label="한국어"
  >
  <p><a href="media/book-talk.mp4">모임 영상 파일 받기</a></p>
</video>
<p><a href="book-talk-transcript.html">모임 영상 대본 읽기</a></p>
```

- 자막(captions)은 말과 이해에 필요한 소리 정보를 영상 시간에 맞춰 보여 준다.
- `source`는 재생할 파일과 파일 형식을 알려 준다.
- 대본(transcript)은 말과 이해에 필요한 소리를 이어진 글로 제공한다.
- 묘사 대본은 여기에 영상의 중요한 시각 정보까지 글로 덧붙인다. 콘텐츠에 따라 음성 설명 같은 추가 수단이 필요할 수도 있다.
- `video` 안의 대체 문구는 오래된 브라우저용 안내일 뿐 자막이나 대본을 대신하지 않는다.

녹화된 오디오만 제공할 때도 재생기 가까이에 대본을 함께 제공한다.
오디오·비디오의 접근성 범위는 콘텐츠에 따라 달라진다.

## 이어서 연습하기

미디어의 자막·대본을 직접 작성하고 확인하는 실습은 아직 제공하지 않습니다. 가상 파일 이름을 실제로 재생했다고 생각하지 말고 필요한 대체 정보부터 설명해 보세요.

## 공식 자료

- [WHATWG HTML Living Standard](https://html.spec.whatwg.org/multipage/)
- [WAI Images Tutorial](https://www.w3.org/WAI/tutorials/images/)
- [WAI Audio and Video Media](https://www.w3.org/WAI/media/av/)

## 핵심 질문 답

controls는 브라우저 재생 조작을 제공할 뿐입니다.
자막은 말과 필요한 소리를 시간에 맞춰 보여 주고 대본은 이를 이어진 글로 제공하며, 묘사 대본은 중요한 시각 정보도 덧붙입니다.
콘텐츠에 따라 음성 설명 등 추가 수단이 필요할 수 있고 video 내부의 오래된 브라우저용 문구는 자막이나 대본을 대신하지 않습니다.
녹음된 오디오만 제공할 때도 가까이에 대본을 둡니다.
