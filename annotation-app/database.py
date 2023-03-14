from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from os import environ

SQLALCHEMY_DATABASE_URL: str

if "DATABASE_URL" not in environ:
    USERNAME = environ["POSTGRES_USER"]
    PASSWORD = environ["POSTGRES_PASSWORD"]
    DATABASE_NAME = environ["POSTGRES_DB"]
    DATABASE_HOST = environ.get("POSTGRES_HOST", "localhost")
    DATABASE_PORT = environ.get("POSTGRES_PORT", "5432")
    SQLALCHEMY_DATABASE_URL = f"postgresql://{USERNAME}:{PASSWORD}@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME}"
else:
    SQLALCHEMY_DATABASE_URL = environ["DATABASE_URL"]

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
