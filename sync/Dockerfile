FROM python:3.13-slim

# Receive build number as argument, retain as environment variable
ARG BUILD_NUMBER
ENV BUILD_NUMBER=${BUILD_NUMBER}

# Packages and nonroot user
RUN apt update && \
    apt install -y --no-install-recommends gcc libpq-dev python3-dev && \
    useradd -M nonroot

# Disable cache, disable upgrade message, don't write .pyc files
ENV PIP_NO_CACHE_DIR="1"
ENV PIP_DISABLE_PIP_VERSION_CHECK="1"
ENV PYTHONDONTWRITEBYTECODE="1"

# Copy files and install requirements
WORKDIR /app
COPY . ./
RUN pip install -r ./requirements.txt --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org

# Start the app
USER nonroot
CMD ["python3", "/app/src/main.py"]
