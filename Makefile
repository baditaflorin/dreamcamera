.PHONY: help install-hooks dev build test test-integration smoke lint fmt pages-preview release clean hooks-pre-commit hooks-commit-msg hooks-pre-push hooks-post-change

help:
	@printf '%s\n' \
		'make install-hooks     Wire local git hooks' \
		'make dev               Run the Vite dev server' \
		'make build             Build the GitHub Pages site into docs/' \
		'make test              Run unit tests' \
		'make test-integration  No integration tests for Mode A v1' \
		'make smoke             Build docs/ and run Playwright smoke tests' \
		'make lint              Run ESLint, Prettier check, and npm audit' \
		'make fmt               Format the repository' \
		'make pages-preview     Serve docs/ locally like GitHub Pages' \
		'make release           Tag the current commit as v$$(node -p "require(\"./package.json\").version")' \
		'make clean             Remove local build/test output'

install-hooks:
	git config core.hooksPath .githooks
	chmod +x .githooks/*

dev:
	npm run dev

build:
	npm run build

test:
	npm run test

test-integration:
	@echo 'No integration tests for Mode A v1.'

smoke:
	npm run smoke

lint:
	npm run lint

fmt:
	npm run fmt

pages-preview:
	npm run pages-preview

release:
	git tag "v$$(node -p "require('./package.json').version")"
	git push origin "v$$(node -p "require('./package.json').version")"

clean:
	rm -rf coverage playwright-report test-results node_modules/.tmp

hooks-pre-commit:
	npm run lint
	npm run typecheck
	gitleaks protect --staged --verbose

hooks-commit-msg:
	node scripts/validate-commit-msg.mjs "$${COMMIT_MSG_FILE:-}"

hooks-pre-push:
	npm run test
	npm run build
	npm run smoke

hooks-post-change:
	@echo 'Dependencies may have changed. Run npm install if package-lock.json changed.'

