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
};
