FROM python:3.12-slim-bullseye AS build

# Packages and nonroot user
RUN apt update && \
    apt install -y --no-install-recommends gcc libpq-dev python3-dev && \
    useradd -M nonroot

# Disable cache dir, disable upgrade message, create .venv in project dir
ENV PIP_NO_CACHE_DIR="off" \
    PIP_DISABLE_PIP_VERSION_CHECK="on" \
    PIP_DEFAULT_TIMEOUT="100" \
    PYTHONDONTWRITEBYTECODE="1" \
    PYTHONUNBUFFERED="1"

# Copy files and install requirements
WORKDIR /app
COPY . .
RUN pip install -r ./requirements.txt --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org

# Start the app
WORKDIR /app/src
USER nonroot
CMD python3 main2.py
