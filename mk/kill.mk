# mk/kill.mk

define FrontendKILL
ifeq ($(SYS),Win)
	powershell -Command "Get-NetTCPConnection -LocalPort 3000 | ForEach-Object { Stop-Process -Id $$_.OwningProcess -Force }"
else
	kill -9 $$(lsof -t -i:3000)
endif
endef

define BackendKILL
ifeq ($(SYS),Win)
	powershell -Command "Get-NetTCPConnection -LocalPort 5000 | ForEach-Object { Stop-Process -Id $$_.OwningProcess -Force }"
else
	kill -9 $$(lsof -t -i:5000)
endif
endef
ifeq ($(SERVICE),None)
KILL_CMDS := $(FrontendKILL)
KILL_CMDS += $(BackendKILL)
else ifeq ($(SERVICE),frontend)
KILL_CMDS := $(FrontendKILL)
else ifeq ($(SERVICE),backend)
KILL_CMDS := $(BackendKILL)
else
$(error Invalid SERVICE=$(SERVICE), must be None/Frontend/Backend)
endif

kill:
	$(KILL_CMDS)