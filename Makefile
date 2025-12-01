PY := python3
VENV_DIR := .venv
LOG_DIR := .log
BACKEND_LOG := $(LOG_DIR)/backend.log
SERVICE ?= None

import mk/sys.mk
import mk/kill.mk

setup:
	npm install
	$(PY) -m venv $(VENV_DIR)
	$(PIP_BIN) install --upgrade pip
	$(PIP_BIN) install -r requirements.txt
	mkdir -p $(LOG_DIR)

ifeq ($(SERVICE),None)

run:
	ifeq ($(SYS),Win)
		# Windows PowerShell
		powershell -Command "Start-Process '$(PY_BIN)' -ArgumentList './src/app.py' -RedirectStandardOutput '$(BACKEND_LOG)' -RedirectStandardError '$(BACKEND_LOG)'"
		npm run dev
	else
		# Unix/Linux/macOS
		$(PY_BIN) ./src/app.py > $(BACKEND_LOG) 2>&1 &
		npm run dev
	endif




    