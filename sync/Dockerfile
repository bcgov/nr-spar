FROM python:3.12-slim-bullseye AS build

# Packages
RUN apt update && \
    apt install -y --no-install-recommends gcc libpq-dev python3-dev

# Disable cache dir, disable upgrade message, create .venv in project dir
ARG PIP_NO_CACHE_DIR="off" \
    PIP_DISABLE_PIP_VERSION_CHECK="on" \
    PIP_DEFAULT_TIMEOUT="100" \
    PYTHONDONTWRITEBYTECODE="1" \
    PYTHONUNBUFFERED="1"

# Copy files and install requirements
WORKDIR /app
COPY . .
RUN pip install -r --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org ./requirements.txt

# Start the app
WORKDIR /app/src
USER 1001
CMD python3 main.py
