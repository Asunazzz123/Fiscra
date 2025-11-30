ifeq ($(OS),Windows_NT)
    PY_BIN := $(VENV_DIR)/Scripts/python.exe
    PIP_BIN := $(VENV_DIR)/Scripts/pip.exe
    SYS := Win
else ifeq ($(shell uname -s),Darwin)
    PY_BIN := $(VENV_DIR)/bin/python
    PIP_BIN := $(VENV_DIR)/bin/pip
    SYS := Mac
else
    PY_BIN := $(VENV_DIR)/bin/python
    PIP_BIN := $(VENV_DIR)/bin/pip
    SYS := Linux
endif