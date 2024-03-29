FROM python:3.12-slim-bullseye AS build

# Packages
RUN apt update && \
    apt install -y --no-install-recommends gcc libpq-dev python3-dev

# Disable cache dir, disable upgrade message, create .venv in project dir
ARG PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on

# Copy files and install requirements
WORKDIR /app
COPY requirements.txt .
RUN pip install -r ./requirements.txt

# Start the app
WORKDIR /app/src
COPY src .
USER 1001
CMD python3 main.py
