from os import listdir, path
from pathlib import Path
import json

DIRNAME = path.dirname(path.realpath(__file__))


def create_document_json(subdirectory: str = ""):
    documents = {}
    subdir = "assets" if subdirectory == "" else path.join("assets", subdirectory)
    document_filename_list = [
        Path(file).stem for file in listdir(subdir) if file.endswith("json")
    ]
    for document in document_filename_list:
        with open(path.join(DIRNAME, subdir, f"{document}.json")) as the_document:
            documents[document] = json.load(the_document)
    return documents


DOCUMENT_MAP = {
    "MARCH_13": create_document_json(),
    "MARCH_20": create_document_json("MARCH_20"),
}
