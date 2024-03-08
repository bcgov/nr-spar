#!/bin/bash
set -euo nounset

### Usage
# ./run.sh to run the application
# ./run.sh setup to setup, then run

### Prerequisites

# pyenv - https://github.com/pyenv/pyenv#installation
# bz2 - sudo dnf -y install bzip2-devel
# pg_conf - sudo dnf -y install libpq-devel


### Setup

# Several packages are not working for python 3.12
PYVER=3.10.13

export COMMAND=${1:-}
if [ "${COMMAND}" == "setup" ]; then
  [ -z "${PYENV_ROOT}" ]|| export PYENV_ROOT="$HOME/.pyenv"
  command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"
  eval "$(pyenv init -)"
  pyenv update
  pyenv install -s ${PYVER}
  pyenv global ${PYVER}
  python -m venv --clear venv
  source venv/bin/activate
  python -m pip install --upgrade pip
fi


### Requirements

python -m pip install -r ./requirements.txt --cache-dir ./data


### Run

cd src
echo "Running main.py"
python main.py
