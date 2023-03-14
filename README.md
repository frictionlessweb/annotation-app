# Highlight App

A simple application for judging annotations.

## Introduction

Our app concerns the following data:

- A document is a PDF file that has several associated _topics_ with it.
- A _topic_ has several associated _annotations_ that must be judged by a user.

We want to judge how good the annotations asssociated with each document/topic pair are.

To create a system that will allow you to do so, first obtain the PDF that you would like to analyze. Copy it into the `assets` folder at the root of the project. Next, create a JSON file that describes the document's topics and annotations which looks like so:

```
{
  "title": "DocumentTitle",
    "topics": {
       "topicOne": [/* A list of annotations goes here... */],
       "topicTwo": [/* A list of annotations goes here... */]
    }
}
```

The stem of this JSON file name and the stem of the PDF should be the same. That is,
if the `PDF` is called `01_MY_DOCUMENT.pdf`, the JSON should be named `01_MY_DOCUMENT.json`
respectively.

Once you've copied the files you would like into the project, you should then run:

```sh
python ./assets/copy_assets.py
```

That will analyze the files you've added to the project and copied them into the right place such that one can use them with the project.

## Deploying
First, you will need to get an API key for the Adobe Embed API. [You can find the instructions to do so here.](https://developer.adobe.com/document-services/docs/overview/pdf-embed-api/). Once you have an API key, create a file called `.env` in the `annotations-ui` directory with the following content:

```
VITE_PUBLIC_ADOBE_CLIENT_ID=<YOUR_API_KEY_HERE>
```

If you have Docker installed, the only thing you should need to do now is run:

```sh
docker-compose up
```

That will start all of the requisite services with all necessary environment variables.

## Developing

You will need to install:

- Node 18
- Python 3.11.2
- PostgreSQL 15
- A Unix Based OS (e.g., MacOS or Linux.)

You can use the Window's Subsystem for Linux on windows if necessary. Once those programs are installed and on your shell's `$PATH` variable, you can start the UI by going into the `annotation-ui` directory and running:

```sh
npm run dev
```

To set up all the required database tables, you can run:

```
psql -f ./annotation-app/init.sql
```

You will also need to set the following environment variables in your shell:

```
export POSTGRES_DB=annotation
export POSTGRES_USER=annotation
export POSTGRES_PASSWORD=annotation

```

From there, you can start the API by going into the `annotation-app` directory and running:

```sh
alembic upgrade head && uvicorn --host 0.0.0.0 main:app --reload
```
