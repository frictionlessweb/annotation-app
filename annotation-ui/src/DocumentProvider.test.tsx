import {
  documentsToAnnotationResponses,
  annotationsComplete,
  topicsComplete,
  documentsComplete,
} from "./DocumentProvider";

describe("Annotation response analysis", () => {
  test("We can go from documents to annotation responses", () => {
    const actualResponse = documentsToAnnotationResponses({
      DocumentOne: {
        pdf_url: "https://google.com",
        title: "Test",
        topics: {
          "1": [{ id: "1234" }],
          "2": [{ id: "3456" }, { id: "7899" }],
        },
      },
      DocumentTwo: {
        pdf_url: "https://google.com",
        title: "Test",
        topics: {
          "1": [{ id: "22341", other: true }],
          "2": [{ id: "1512" }, { id: "1231", this: "is a property" }],
        },
      },
    });
    const expectedResponse = {
      DocumentOne: {
        "1": {
          "1234": null,
        },
        "2": {
          "3456": null,
          "7899": null,
        },
      },
      DocumentTwo: {
        1: {
          22341: null,
        },
        2: {
          1512: null,
          1231: null,
        },
      },
    };
    expect(actualResponse).toEqual(expectedResponse);
  });
  test("We can determine if all of the annotations for a topic are complete", () => {
    expect(
      annotationsComplete({
        1: true,
        3: false,
      })
    ).toBe(true);
    expect(
      annotationsComplete({
        1: false,
        3: false,
      })
    ).toBe(true);
    expect(
      annotationsComplete({
        1: null,
        3: false,
      })
    ).toBe(false);
  });
  test("We can determine if all of the annotations for a document are complete", () => {
    expect(
      topicsComplete({
        "1": {
          "1234": null,
        },
        "2": {
          "3456": null,
          "7899": null,
        },
      })
    ).toBe(false);
    expect(
      topicsComplete({
        "1": {
          "1234": true,
        },
        "2": {
          "3456": false,
          "7899": null,
        },
      })
    ).toBe(false);
    expect(
      topicsComplete({
        "1": {
          "1234": false,
        },
        "2": {
          "3456": false,
          "7899": false,
        },
      })
    ).toBe(true);
  });
  test("We can determine if all annotations for all documents are complete", () => {
    expect(
      documentsComplete({
        DocumentOne: {
          "1": {
            "1234": null,
          },
          "2": {
            "3456": null,
            "7899": null,
          },
        },
        DocumentTwo: {
          1: {
            22341: null,
          },
          2: {
            1512: null,
            1231: null,
          },
        },
      })
    ).toBe(false);
    expect(
      documentsComplete({
        DocumentOne: {
          "1": {
            "1234": true,
          },
          "2": {
            "3456": false,
            "7899": false,
          },
        },
        DocumentTwo: {
          1: {
            22341: true,
          },
          2: {
            1512: false,
            1231: false,
          },
        },
      })
    ).toBe(true);
  });
});
