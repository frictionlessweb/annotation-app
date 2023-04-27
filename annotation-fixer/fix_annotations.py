#!/usr/bin/env python3
import fitz
import json


def quadpoints_to_bboxes(quadpoints: list[float]) -> list[float]:
    bboxes = []
    for i in range(0, len(quadpoints), 8):
        x1, y1 = quadpoints[i], quadpoints[i + 1]
        x2, y2 = quadpoints[i + 2], quadpoints[i + 3]
        x3, y3 = quadpoints[i + 4], quadpoints[i + 5]
        x4, y4 = quadpoints[i + 6], quadpoints[i + 7]
        min_x = min(x1, x2, x3, x4)
        max_x = max(x1, x2, x3, x4)
        min_y = min(y1, y2, y3, y4)
        max_y = max(y1, y2, y3, y4)
        bboxes.append([min_x, min_y, max_x, max_y])
    return bboxes


def fix_highlight(annotation: dict, pdf: fitz.Document):
    has_text: bool = annotation.get("bodyValue", "") != ""
    if has_text:
        return
    output = ""
    quadpoints = annotation["target"]["selector"]["quadPoints"]
    bboxes = quadpoints_to_bboxes(quadpoints)
    page_number = annotation["target"]["selector"]["node"]["index"]
    page = pdf[page_number]
    for bbox in bboxes:
        bbox_text = page.get_textbox(bbox)  # type: ignore
        output += bbox_text.strip()
    annotation["bodyValue"] = output


def update_body_text(annotation_responses: list[dict], pdf: fitz.Document):
    for response in annotation_responses:
        user_responses = response["user_responses"]
        for highlight in user_responses["INTRO_DOCUMENT"]["highlights"]:
            fix_highlight(highlight, pdf)
        generated_question_keys = ["question_one", "question_two", "question_three"]
        for key in generated_question_keys:
            for highlight in user_responses["GENERATED_QUESTIONS"][key]["highlights"]:
                fix_highlight(highlight, pdf)


def insert_body_text(annotations_path: str, pdf_path: str, output_path: str):
    with open(annotations_path) as the_annotations:
        annotations: list[dict] = json.load(the_annotations)
    with fitz.fitz.Document(pdf_path) as the_pdf:
        update_body_text(annotations, the_pdf)
    with open(output_path, "w+") as output:
        output.write(json.dumps(annotations))


if __name__ == "__main__":
    insert_body_text(
        "./tmp2.json", "./handbook_estate_planning_F132.pdf", "results.json"
    )
