import { documentsToAnnotationResponse } from "./DocumentProvider";

describe("Annotation response analysis", () => {
  test("We can go from documents to annotation responses", () => {
    const actualResponse = documentsToAnnotationResponse({
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
  test("We can determine if a response is not finished", () => {});
});
