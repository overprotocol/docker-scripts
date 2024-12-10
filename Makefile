# Directory to clean
DATADIR := datadir

.PHONY: clean

clean:
	@if [ -d "$(DATADIR)" ]; then \
		echo "Cleaning $(DATADIR)..."; \
		rm -rf $(DATADIR)/*; \
	fi
	@if [ -f "jwttoken" ]; then \
		echo "Removing jwttoken..."; \
		rm -f jwttoken; \
	fi

.PHONY: clean init

init:
	@echo "Initializing..."
	@chmod +x ./scripts/*.sh || echo "Warning: Could not set permissions"
	@./scripts/initialize.sh
	