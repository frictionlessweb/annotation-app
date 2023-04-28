# Annotation Fixer

To use this script, you'll need:

- NodeJS
- A JSON filled with annotations that may be missing text.
- A JSON filled with annotations from the Extract API.

From there, you can run:

```
node ./cli.js <ANNOTATION_RESPONSES_PATH> <EXTRACT_API_PATH> <OUTPUT_PATH>
```

For example, if you do:

```
node cli.js __example__/Q1_highlights.json __example__/extract.json results.json
```

A file `results.json` with the correct data will be in this directory.
