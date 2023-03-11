from os import listdir, path
from pathlib import Path
import json

DIRNAME = path.dirname(path.realpath(__file__))

DOCUMENT_FILENAME_LIST = [
    Path(file).stem for file in listdir("assets") if file.endswith("json")
]

DOCUMENTS = {}

for document in DOCUMENT_FILENAME_LIST:
    with open(path.join(DIRNAME, "assets", f"{document}.json")) as the_document:
        DOCUMENTS[document] = json.load(the_document)
