PY := python3
VENV_DIR := .venv
LOG_DIR := .log
BACKEND_LOG := $(LOG_DIR)/backend.log
SERVICE ?= None

include mk/sys.mk
include mk/kill.mk

setup:
	npm install
	$(PY) -m venv $(VENV_DIR)
	$(PIP_BIN) install --upgrade pip
	$(PIP_BIN) install -r requirements.txt
	mkdir -p $(LOG_DIR)



ifeq ($(SYS),Win)
run:
	# Windows PowerShell
	powershell -Command "cmd /c \"$(PY_BIN) ./src/app.py > $(BACKEND_LOG) 2>&1\""
	npm run dev
else
run:
	# Unix/Linux/macOS
	$(PY_BIN) ./src/app.py > $(BACKEND_LOG) 2>&1 &
	npm run dev
endif




    