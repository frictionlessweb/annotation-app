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
    console.log(actualResponse);
    const expectedResponse = {
      DocumentOne: {
        topics: {
          "1": [{ id: "1234", liked: null }],
          "2": [
            { id: "3456", liked: null },
            { id: "7899", liked: null },
          ],
        },
      },
      DocumentTwo: {
        topics: {
          "1": [{ id: "22341", liked: null }],
          "2": [
            { id: "1512", liked: null },
            { id: "1231", liked: null },
          ],
        },
      },
    };
    expect(actualResponse).toEqual(expectedResponse);
  });
  test("We can determine if a response is not finished", () => {});
});
