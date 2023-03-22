import { userResponsesFromDocuments } from "./March20Provider";

test("We can map a document to questions", () => {
  const input = {
    lease_app: {
      title: "lease_app",
      pdf_url: "/api/v1/static/WEEK_20/lease_app.pdf",
      questions: {
        topicTask: [
          {
            id: "1",
            text: "Content Filters",
          },
          {
            id: "2",
            text: "Reappointment",
          },
          {
            id: "2",
            text: "Employment",
          },
        ],
        questionTask: [
          {
            id: "3",
            text: "What is your favorite color?",
          },
          {
            id: "4",
            text: "What is the square root of 4?",
          },
        ],
        statementsTask: [
          {
            id: "5",
            text: "Apples are red.",
          },
          {
            id: "6",
            text: "The sky is blue.",
          },
          {
            id: "6",
            text: "Clouds are white.",
          },
        ],
        qaTask: [
          {
            id: "7",
            question:
              "How do teens view the impact of social media on their generation?",
            answer: "Teens have a mixed view.",
          },
          {
            id: "8",
            question: "What are the most popular Ruby frameworks?",
            answer: "Ruby on Rails is very popular. So is Sinatra.",
          },
        ],
      },
    },
  };
  const actual = userResponsesFromDocuments(input);
  const expected = {
    lease_app: {
      questionTask: {
        "3": null,
        "4": null,
      },
      statementsTask: {
        "5": null,
        "6": null,
      },
      topicTask: {
        "1": null,
        "2": null,
      },
      qaTask: {
        "7": {
          visited: false,
          answers: [false, false, false, false],
        },
        "8": {
          visited: false,
          answers: [false, false, false, false],
        },
      },
    },
  };
  expect(actual).toEqual(expected);
});
