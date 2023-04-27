# Annotation Fixer
To use this script, you'll need:
- Python 3.10+
- A JSON filled with annotations that may be missing text.
- A PDF that goes with that JSON.

First, create a virtual environment and run `pip install -r requirements.txt` in this directory.

Next, edit `fix_annotations.py` and in the last line, replace the first argument with the path to the JSON you need to fix and the second argument with the path to the PDF. The third argument should be the file with fixed annotations you want to generate.

From there, 

```
python fix_annotations.py
```

Should do the trick.
