import os
import pathlib
import shutil
import json

ASSETS_DIRECTORY = os.path.dirname(__file__)

ASSET_FILES = set(
    os.path.join(ASSETS_DIRECTORY, file) for file in os.listdir(ASSETS_DIRECTORY)
)

PROJECT_ROOT = os.path.dirname(ASSETS_DIRECTORY)

API_ASSETS = os.path.join(PROJECT_ROOT, "annotation-app", "assets")


def is_root_file(path: str) -> bool:
    path_prefix = os.path.join(ASSETS_DIRECTORY, pathlib.Path(path).stem)
    return f"{path_prefix}.json" in ASSET_FILES and f"{path_prefix}.pdf" in ASSET_FILES


ROOT_FILES = set(pathlib.Path(file).stem for file in ASSET_FILES if is_root_file(file))

print(f"Copying assets for {', '.join(ROOT_FILES)}...")

for file in ROOT_FILES:
    old_pdf_path = os.path.join(ASSETS_DIRECTORY, f"{file}.pdf")
    shutil.copy(old_pdf_path, API_ASSETS)
    with open(os.path.join(ASSETS_DIRECTORY, f"{file}.json")) as the_json:
        cur_map = json.load(the_json)
        cur_map["pdf_url"] = f"/api/v1/static/{file}.pdf"
        new_json_path = os.path.join(API_ASSETS, f"{file}.json")
        with open(new_json_path, 'w+') as the_new_json:
            json.dump(obj=cur_map, fp=the_new_json)

print("Assets copied successfully.")
