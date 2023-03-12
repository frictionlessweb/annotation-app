# Highlight App

A simple application for judging annotations and highlights.

## Deploying

If you have Docker installed, the only thing you should need to do is clone this repository and run:

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

Then, you can start the API by going into the `annotation-app` directory and running:

```sh
alembic upgrade head && uvicorn --host 0.0.0.0 main:app --reload
```
