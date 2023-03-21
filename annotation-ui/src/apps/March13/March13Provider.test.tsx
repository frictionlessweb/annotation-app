import {
  userResponsesFromDocuments,
  topicsFromDocument,
  tabFromAnnotationId,
  tabFromTopic,
  VIEW_TAB,
  annotationsFromContext,
} from "./March13Provider";

test("userResponsesFromDocuments should work", () => {
  const actual = userResponsesFromDocuments({
    DocumentA: {
      pdf_url: "",
      title: "",
      highlights: {
        one: [{ text: "test", annotation: { id: "1" } }],
        two: [{ text: "test", annotation: { id: "2" } }],
        three: [{ text: "test", annotation: { id: "3" } }],
        four: [{ text: "test", annotation: { id: "4" } }],
        multiple: [
          { text: "test", annotation: { id: "a" } },
          { text: "test", annotation: { id: "b" } },
        ],
      },
      attributions: {
        five: {
          statement: "aStatement",
          annotations: [{ text: "test", annotation: { id: "5" } }],
        },
        six: {
          statement: "aStatement",
          annotations: [{ text: "test", annotation: { id: "6" } }],
        },
      },
    },
    DocumentB: {
      pdf_url: "",
      title: "",
      highlights: {
        seven: [{ text: "test", annotation: { id: "7" } }],
        eight: [{ text: "test", annotation: { id: "8" } }],
        nine: [{ text: "test", annotation: { id: "9" } }],
        ten: [{ text: "test", annotation: { id: "10" } }],
      },
      attributions: {
        eleven: {
          statement: "aStatement",
          annotations: [{ text: "test", annotation: { id: "11" } }],
        },
        twelve: {
          statement: "aStatement",
          annotations: [{ text: "test", annotation: { id: "12" } }],
        },
      },
    },
  });
  const expected = {
    DocumentA: {
      one: {
        1: null,
      },
      two: {
        2: null,
      },
      three: {
        3: null,
      },
      four: {
        4: null,
      },
      multiple: {
        a: null,
        b: null,
      },
      five: {
        5: null,
      },
      six: {
        6: null,
      },
    },
    DocumentB: {
      seven: {
        7: null,
      },
      eight: {
        8: null,
      },
      nine: {
        9: null,
      },
      ten: {
        10: null,
      },
      eleven: {
        11: null,
      },
      twelve: {
        12: null,
      },
    },
  } as const;
  expect(actual).toEqual(expected);
});

test("Topics from document should work", () => {
  const actual = topicsFromDocument({
    pdf_url: "",
    title: "",
    highlights: {
      one: [{ text: "test", annotation: { id: "1" } }],
      two: [{ text: "test", annotation: { id: "2" } }],
      three: [{ text: "test", annotation: { id: "3" } }],
      four: [{ text: "test", annotation: { id: "4" } }],
      multiple: [
        { text: "test", annotation: { id: "a" } },
        { text: "test", annotation: { id: "b" } },
      ],
    },
    attributions: {
      five: {
        statement: "aStatement",
        annotations: [{ text: "test", annotation: { id: "5" } }],
      },
      six: {
        statement: "aStatement",
        annotations: [{ text: "test", annotation: { id: "6" } }],
      },
    },
  }).sort();
  const expected = [
    "one",
    "two",
    "three",
    "four",
    "multiple",
    "five",
    "six",
  ].sort();
  expect(actual).toEqual(expected);
});

test("tabOfAnnotation should work with highlights", () => {
  const actual = tabFromAnnotationId("3", {
    x: {
      pdf_url: "",
      title: "",
      highlights: {
        one: [{ text: "test", annotation: { id: "1" } }],
        two: [{ text: "test", annotation: { id: "2" } }],
        three: [{ text: "test", annotation: { id: "3" } }],
        four: [{ text: "test", annotation: { id: "4" } }],
        multiple: [
          { text: "test", annotation: { id: "a" } },
          { text: "test", annotation: { id: "b" } },
        ],
      },
      attributions: {
        five: {
          statement: "aStatement",
          annotations: [{ text: "test", annotation: { id: "5" } }],
        },
        six: {
          statement: "aStatement",
          annotations: [{ text: "test", annotation: { id: "6" } }],
        },
      },
    },
  });
  const expected: VIEW_TAB = "HIGHLIGHTS";
  expect(actual).toEqual(expected);
});

test("tabOfAnnotation should work with documents", () => {
  const actual = tabFromAnnotationId("6", {
    x: {
      pdf_url: "",
      title: "",
      highlights: {
        one: [{ text: "test", annotation: { id: "1" } }],
        two: [{ text: "test", annotation: { id: "2" } }],
        three: [{ text: "test", annotation: { id: "3" } }],
        four: [{ text: "test", annotation: { id: "4" } }],
        multiple: [
          { text: "test", annotation: { id: "a" } },
          { text: "test", annotation: { id: "b" } },
        ],
      },
      attributions: {
        five: {
          statement: "aStatement",
          annotations: [{ text: "test", annotation: { id: "5" } }],
        },
        six: {
          statement: "aStatement",
          annotations: [{ text: "test", annotation: { id: "6" } }],
        },
      },
    },
  });
  const expected: VIEW_TAB = "ATTRIBUTIONS";
  expect(actual).toEqual(expected);
});

test("tabFromTopic should work when the answer is highlights", () => {
  const actual = tabFromTopic("multiple", {
    pdf_url: "",
    title: "",
    highlights: {
      one: [{ text: "test", annotation: { id: "1" } }],
      two: [{ text: "test", annotation: { id: "2" } }],
      three: [{ text: "test", annotation: { id: "3" } }],
      four: [{ text: "test", annotation: { id: "4" } }],
      multiple: [
        { text: "test", annotation: { id: "a" } },
        { text: "test", annotation: { id: "b" } },
      ],
    },
    attributions: {
      five: {
        statement: "aStatement",
        annotations: [{ text: "test", annotation: { id: "5" } }],
      },
      six: {
        statement: "aStatement",
        annotations: [{ text: "test", annotation: { id: "6" } }],
      },
    },
  });
  const expected: VIEW_TAB = "HIGHLIGHTS";
  expect(actual).toEqual(expected);
});

test("tabFromTopic should work when the answer is attributions", () => {
  const actual = tabFromAnnotationId("five", {
    x: {
      pdf_url: "",
      title: "",
      highlights: {
        one: [{ text: "test", annotation: { id: "1" } }],
        two: [{ text: "test", annotation: { id: "2" } }],
        three: [{ text: "test", annotation: { id: "3" } }],
        four: [{ text: "test", annotation: { id: "4" } }],
        multiple: [
          { text: "test", annotation: { id: "a" } },
          { text: "test", annotation: { id: "b" } },
        ],
      },
      attributions: {
        five: {
          statement: "aStatement",
          annotations: [{ text: "test", annotation: { id: "5" } }],
        },
        six: {
          statement: "aStatement",
          annotations: [{ text: "test", annotation: { id: "6" } }],
        },
      },
    },
  });
  const expected: VIEW_TAB = "ATTRIBUTIONS";
  expect(actual).toEqual(expected);
});

test("We can get annotations from context in one case", () => {
  const documents = {
    DocumentA: {
      pdf_url: "",
      title: "",
      highlights: {
        one: [{ text: "test", annotation: { id: "1" } }],
        two: [{ text: "test", annotation: { id: "2" } }],
        three: [{ text: "test", annotation: { id: "3" } }],
        four: [{ text: "test", annotation: { id: "4" } }],
        multiple: [
          { text: "test", annotation: { id: "a" } },
          { text: "test", annotation: { id: "b" } },
        ],
      },
      attributions: {
        five: {
          statement: "aStatement",
          annotations: [{ text: "test", annotation: { id: "5" } }],
        },
        six: {
          statement: "aStatement",
          annotations: [{ text: "test", annotation: { id: "6" } }],
        },
      },
    },
    DocumentB: {
      pdf_url: "",
      title: "",
      highlights: {
        seven: [{ text: "test", annotation: { id: "7" } }],
        eight: [{ text: "test", annotation: { id: "8" } }],
        nine: [{ text: "test", annotation: { id: "9" } }],
        ten: [{ text: "test", annotation: { id: "10" } }],
      },
      attributions: {
        eleven: {
          statement: "aStatement",
          annotations: [{ text: "test", annotation: { id: "11" } }],
        },
        twelve: {
          statement: "aStatement",
          annotations: [{ text: "test", annotation: { id: "12" } }],
        },
      },
    },
  };
  const ctx = {
    documents,
    selectedTopic: "seven",
    selectedDocument: "DocumentB",
  };
  // @ts-expect-error - Good enough for test.
  const actual = annotationsFromContext(ctx);
  const expected = [{ text: "test", annotation: { id: "7" } }];
  expect(actual).toEqual(expected);
});

test("We can get annotations from context in another case", () => {
  const documents = {
    DocumentA: {
      pdf_url: "",
      title: "",
      highlights: {
        one: [{ text: "test", annotation: { id: "1" } }],
        two: [{ text: "test", annotation: { id: "2" } }],
        three: [{ text: "test", annotation: { id: "3" } }],
        four: [{ text: "test", annotation: { id: "4" } }],
        multiple: [
          { text: "test", annotation: { id: "a" } },
          { text: "test", annotation: { id: "b" } },
        ],
      },
      attributions: {
        five: {
          statement: "aStatement",
          annotations: [{ text: "test", annotation: { id: "5" } }],
        },
        six: {
          statement: "aStatement",
          annotations: [{ text: "test", annotation: { id: "6" } }],
        },
      },
    },
    DocumentB: {
      pdf_url: "",
      title: "",
      highlights: {
        seven: [{ text: "test", annotation: { id: "7" } }],
        eight: [{ text: "test", annotation: { id: "8" } }],
        nine: [{ text: "test", annotation: { id: "9" } }],
        ten: [{ text: "test", annotation: { id: "10" } }],
      },
      attributions: {
        eleven: {
          statement: "aStatement",
          annotations: [{ text: "test", annotation: { id: "11" } }],
        },
        twelve: {
          statement: "aStatement",
          annotations: [{ text: "test", annotation: { id: "12" } }],
        },
      },
    },
  };
  const ctx = {
    documents,
    selectedTopic: "multiple",
    selectedDocument: "DocumentA",
  };
  // @ts-expect-error - Good enough for test.
  const actual = annotationsFromContext(ctx);
  const expected = [
    { text: "test", annotation: { id: "a" } },
    { text: "test", annotation: { id: "b" } },
  ];
  expect(actual).toEqual(expected);
});
