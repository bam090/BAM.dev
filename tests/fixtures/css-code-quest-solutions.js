export const cssCodeQuestSolutionFixtures = {
  "quest-css-learning-notice": {
    referenceSource: `.learning-notice {
  color: #1e293b;
  background-color: #e0f2fe;
  padding: 16px;
}

.learning-notice__title {
  color: inherit;
}`,
    representativeWrongSolutions: [
      {
        id: "descendant-selector-instead-of-component-class",
        source: `.learning-notice {
  color: #1e293b;
  background-color: #e0f2fe;
  padding: 16px;
}

.learning-notice h2 {
  color: inherit;
}`,
        expectedFailingPublicTestIds: ["css-notice-title-inherit-rule"],
      },
      {
        id: "fixed-title-color-breaks-inheritance",
        source: `.learning-notice {
  color: #1e293b;
  background-color: #e0f2fe;
  padding: 16px;
}

.learning-notice__title {
  color: #0c4a6e;
}`,
        expectedFailingPublicTestIds: ["css-notice-title-inherit-rule"],
      },
    ],
  },
  "quest-css-profile-card-box": {
    referenceSource: `.profile-card {
  box-sizing: border-box;
  width: 320px;
  padding: 24px;
  border: 2px solid #cbd5e1;
}`,
    representativeWrongSolutions: [
      {
        id: "content-box-expands-card",
        source: `.profile-card {
  box-sizing: content-box;
  width: 320px;
  padding: 24px;
  border: 2px solid #cbd5e1;
}`,
        expectedFailingPublicTestIds: ["css-profile-box-sizing-rule"],
      },
      {
        id: "margin-used-for-inner-spacing",
        source: `.profile-card {
  box-sizing: border-box;
  width: 320px;
  margin: 24px;
  border: 2px solid #cbd5e1;
}`,
        expectedFailingPublicTestIds: ["css-profile-padding-rule"],
      },
    ],
  },
  "quest-css-product-card-layout": {
    referenceSource: `.product-card {
  position: relative;
  display: flex;
  flex-direction: column;
}

.product-card__badge {
  position: absolute;
}

.product-card__actions {
  display: flex;
  justify-content: space-between;
}`,
    representativeWrongSolutions: [
      {
        id: "missing-positioned-ancestor",
        source: `.product-card {
  display: flex;
  flex-direction: column;
}

.product-card__badge {
  position: absolute;
}

.product-card__actions {
  display: flex;
  justify-content: space-between;
}`,
        expectedFailingPublicTestIds: ["css-product-relative-rule"],
      },
      {
        id: "row-axis-for-card-content",
        source: `.product-card {
  position: relative;
  display: flex;
  flex-direction: row;
}

.product-card__badge {
  position: absolute;
}

.product-card__actions {
  display: flex;
  justify-content: space-between;
}`,
        expectedFailingPublicTestIds: ["css-product-direction-rule"],
      },
      {
        id: "actions-packed-at-start",
        source: `.product-card {
  position: relative;
  display: flex;
  flex-direction: column;
}

.product-card__badge {
  position: absolute;
}

.product-card__actions {
  display: flex;
  justify-content: flex-start;
}`,
        expectedFailingPublicTestIds: ["css-product-actions-space-rule"],
      },
    ],
  },
  "quest-css-responsive-course-grid": {
    referenceSource: `.course-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 48rem) {
  .course-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 72rem) {
  .course-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}`,
    representativeWrongSolutions: [
      {
        id: "responsive-columns-outside-media",
        source: `.course-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.course-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.course-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}`,
        expectedFailingPublicTestIds: [
          "css-course-grid-mobile-columns-rule",
          "css-course-grid-tablet-columns-rule",
          "css-course-grid-wide-columns-rule",
        ],
      },
      {
        id: "tablet-breakpoint-uses-pixels",
        source: `.course-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 48px) {
  .course-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 72rem) {
  .course-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}`,
        expectedFailingPublicTestIds: ["css-course-grid-tablet-columns-rule"],
      },
      {
        id: "wide-breakpoint-keeps-two-columns",
        source: `.course-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 48rem) {
  .course-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 72rem) {
  .course-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}`,
        expectedFailingPublicTestIds: ["css-course-grid-wide-columns-rule"],
      },
    ],
  },
  "quest-css-cascade-status": {
    "referenceSource": ".message {\n  color: #1e293b;\n}\n\n.message.urgent {\n  color: #b91c1c;\n}",
    "representativeWrongSolutions": [
      {
        "id": "cascade-colors-all-messages",
        "source": ".message { color: #b91c1c; }",
        "expectedFailingPublicTestIds": [
          "cascade-status-normal-a",
          "cascade-status-normal-b"
        ]
      },
      {
        "id": "cascade-assumes-last-wins",
        "source": ".message.urgent {\n  color: #9a3412;\n}\n\n.message {\n  color: #1e293b;\n}\n.urgent { color: #b91c1c; }",
        "expectedFailingPublicTestIds": [
          "cascade-status-urgent-a",
          "cascade-status-urgent-b"
        ]
      }
    ],
    "verificationCases": [
      {
        "id": "verify-cascade-alternative",
        "source": ".message { color: #1e293b; }\n.urgent { color: #b91c1c; }",
        "tests": [
          {
            "id": "verify-cascade-alternative-1",
            "label": "다른 태그의 일반 요소",
            "assertion": {
              "kind": "computed-style",
              "selector": "#independent-normal",
              "property": "color",
              "expected": "#1e293b"
            }
          },
          {
            "id": "verify-cascade-alternative-2",
            "label": "다른 태그의 긴급 요소",
            "assertion": {
              "kind": "computed-style",
              "selector": "#independent-urgent",
              "property": "color",
              "expected": "#b91c1c"
            }
          }
        ],
        "expectedFailingTestIds": [],
        "fixtureHtml": "<div id=\"independent-normal\" class=\"message\">일반</div><div id=\"independent-urgent\" class=\"message urgent\">긴급</div>"
      }
    ]
  },
  "quest-css-readable-overflow": {
    "referenceSource": ".token-panel { width: 180px; }\n.token {\n  margin: 0;\n  overflow-wrap: anywhere;\n  white-space: normal;\n}\n.log-panel {\n  max-height: 96px;\n  height: auto;\n  overflow-y: auto;\n}",
    "representativeWrongSolutions": [
      {
        "id": "overflow-hides-log",
        "source": ".token-panel { width: 180px; }\n.token {\n  margin: 0;\n  overflow-wrap: anywhere;\n  white-space: normal;\n}\n.log-panel {\n  max-height: 96px;\n  height: auto;\n  overflow-y: hidden;\n}",
        "expectedFailingPublicTestIds": [
          "readable-overflow-scroll"
        ]
      },
      {
        "id": "overflow-forbids-wrap",
        "source": ".token-panel { width: 180px; }\n.token {\n  margin: 0;\n  overflow-wrap: anywhere;\n  white-space: nowrap;\n}\n.log-panel {\n  max-height: 96px;\n  height: auto;\n  overflow-y: auto;\n}",
        "expectedFailingPublicTestIds": [
          "readable-overflow-whitespace"
        ]
      },
      {
        "id": "overflow-fixes-short-height",
        "source": ".token-panel { width: 180px; }\n.token {\n  margin: 0;\n  overflow-wrap: anywhere;\n  white-space: normal;\n}\n.log-panel {\n  max-height: 96px;\n  height: 96px;\n  overflow-y: auto;\n}",
        "expectedFailingPublicTestIds": [
          "readable-overflow-height"
        ]
      }
    ],
    "verificationCases": [
      {
        "id": "verify-overflow-other-length",
        "source": ".token-panel { width: 180px; }\n.token {\n  margin: 0;\n  overflow-wrap: anywhere;\n  white-space: normal;\n}\n.log-panel {\n  max-height: 96px;\n  height: auto;\n  overflow-y: auto;\n}",
        "tests": [
          {
            "id": "verify-overflow-other-length-1",
            "label": "다른 긴 로그에도 세로스크롤 적용",
            "assertion": {
              "kind": "computed-style",
              "selector": "#independent-log",
              "property": "overflow-y",
              "expected": "auto"
            }
          },
          {
            "id": "verify-overflow-other-length-2",
            "label": "다른 길이의 문자열에도 줄바꿈 적용",
            "assertion": {
              "kind": "computed-style",
              "selector": "#independent-token",
              "property": "overflow-wrap",
              "expected": "anywhere"
            }
          }
        ],
        "expectedFailingTestIds": [],
        "fixtureHtml": "<div class=\"token-panel\"><p id=\"independent-token\" class=\"token\">ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ</p></div><section class=\"log-panel\" id=\"independent-log\" tabindex=\"0\" aria-label=\"추가 로그\"><p>하나</p><p>둘</p><p>셋</p><p>넷</p><p>다섯</p><p>여섯</p></section>"
      }
    ]
  },
  "quest-css-visible-keyboard-focus": {
    "referenceSource": ".focus-action {\n  color: #1e293b;\n  background-color: #ffffff;\n  outline: none;\n}\n\n.focus-action:focus-visible {\n  outline: 3px solid #1d4ed8;\n  outline-offset: 3px;\n}",
    "representativeWrongSolutions": [
      {
        "id": "focus-styles-hover-only",
        "source": ".focus-action {\n  color: #1e293b;\n  background-color: #ffffff;\n  outline: none;\n}\n\n.focus-action:hover {\n  outline: 3px solid #1d4ed8;\n  outline-offset: 3px;\n}",
        "expectedFailingPublicTestIds": [
          "visible-keyboard-focus-focus-style",
          "visible-keyboard-focus-focus-color",
          "visible-keyboard-focus-focus-offset"
        ]
      },
      {
        "id": "focus-later-removes-outline",
        "source": ".focus-action {\n  color: #1e293b;\n  background-color: #ffffff;\n  outline: none;\n}\n\n.focus-action:focus-visible {\n  outline: 3px solid #1d4ed8;\n  outline-offset: 3px;\n}\n.focus-action:focus-visible { outline: none; }",
        "expectedFailingPublicTestIds": [
          "visible-keyboard-focus-focus-style",
          "visible-keyboard-focus-focus-color"
        ]
      },
      {
        "id": "focus-color-without-line",
        "source": ".focus-action {\n  color: #1e293b;\n  background-color: #ffffff;\n  outline: none;\n}\n\n.focus-action:focus-visible {\n  outline-color: #1d4ed8;\n  outline-offset: 3px;\n}",
        "expectedFailingPublicTestIds": [
          "visible-keyboard-focus-focus-style"
        ]
      }
    ],
    "verificationCases": [
      {
        "id": "verify-focus-longhand",
        "source": ".focus-action { color: #1d4ed8; outline: none; }\n.focus-action:focus-visible { outline-width: 3px; outline-style: solid; outline-color: currentColor; outline-offset: 3px; }",
        "tests": [
          {
            "id": "verify-focus-longhand-1",
            "label": "currentColor를 사용한 대안 색",
            "assertion": {
              "kind": "computed-focus-style",
              "selector": "#independent-action",
              "property": "outline-color",
              "expected": "#1d4ed8"
            }
          },
          {
            "id": "verify-focus-longhand-2",
            "label": "개별 속성 대안의 선 종류",
            "assertion": {
              "kind": "computed-focus-style",
              "selector": "#independent-action",
              "property": "outline-style",
              "expected": "solid"
            }
          }
        ],
        "expectedFailingTestIds": [],
        "fixtureHtml": "<button id=\"independent-action\" class=\"focus-action\" type=\"button\">추가 실습 열기</button>"
      }
    ]
  },
  "quest-css-column-axis-alignment": {
    "referenceSource": ".column-actions {\n  width: 240px;\n  height: 240px;\n  writing-mode: horizontal-tb;\n  direction: ltr;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  align-items: flex-start;\n  gap: 12px;\n}",
    "representativeWrongSolutions": [
      {
        "id": "column-swaps-axes",
        "source": ".column-actions {\n  width: 240px;\n  height: 240px;\n  writing-mode: horizontal-tb;\n  direction: ltr;\n  display: flex;\n  flex-direction: column;\n  justify-content: flex-start;\n  align-items: center;\n  gap: 12px;\n}",
        "expectedFailingPublicTestIds": [
          "column-axis-alignment-justify-content",
          "column-axis-alignment-align-items"
        ]
      },
      {
        "id": "column-keeps-row",
        "source": ".column-actions {\n  width: 240px;\n  height: 240px;\n  writing-mode: horizontal-tb;\n  direction: ltr;\n  display: flex;\n  flex-direction: row;\n  justify-content: center;\n  align-items: flex-start;\n  gap: 12px;\n}",
        "expectedFailingPublicTestIds": [
          "column-axis-alignment-flex-direction"
        ]
      }
    ],
    "verificationCases": [
      {
        "id": "verify-column-three-buttons",
        "source": ".column-actions {\n  width: 240px;\n  height: 240px;\n  writing-mode: horizontal-tb;\n  direction: ltr;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  align-items: flex-start;\n  gap: 12px;\n}",
        "tests": [
          {
            "id": "verify-column-three-buttons-1",
            "label": "세 버튼에서도 행 사이 간격",
            "assertion": {
              "kind": "computed-style",
              "selector": ".column-actions",
              "property": "row-gap",
              "expected": "12px"
            }
          },
          {
            "id": "verify-column-three-buttons-2",
            "label": "세 버튼에서도 열 사이 간격",
            "assertion": {
              "kind": "computed-style",
              "selector": ".column-actions",
              "property": "column-gap",
              "expected": "12px"
            }
          }
        ],
        "expectedFailingTestIds": [],
        "fixtureHtml": "<section class=\"column-actions\" aria-label=\"추가 행동\"><button type=\"button\">읽기</button><button type=\"button\">길이가 다른 실행 버튼</button><button type=\"button\">정리</button></section>"
      }
    ]
  },

};
