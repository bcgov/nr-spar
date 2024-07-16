FROM python:3.12-slim

# Packages and nonroot user
RUN apt update && \
    apt install -y --no-install-recommends gcc libpq-dev python3-dev && \
    useradd -M nonroot

# Disable cache dir, disable upgrade message, create .venv in project dir
ARG PIP_NO_CACHE_DIR="off"
ARG PIP_DISABLE_PIP_VERSION_CHECK="on"
ARG PIP_DEFAULT_TIMEOUT="100"
ARG PYTHONDONTWRITEBYTECODE="1"
ARG PYTHONUNBUFFERED="1"

# Copy files and install requirements
WORKDIR /app
COPY . ./
RUN pip install -r ./requirements.txt

# Start the app
USER nonroot
CMD python3 /app/src/main.py
