export UID = $(shell id -u)
export GID = $(shell id -g)

.PHONY: build help

help:
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: ## install dependencies
	docker compose -f docker-compose.dev.yml run --user $(UID):$(GID) --rm server npm install

run: ## run the applicatoin
	docker compose -f docker-compose.dev.yml up --build

seed-smtp:
	@curl -X POST http://localhost:3080/api/service/reset
	@curl -X POST http://localhost:3080/api/user \
		--header 'Content-Type: application/json' \
		--data-raw '{"email":"john.doe@marmelab.com","login": "john.doe@marmelab.com","password": "password"}' || true
	@curl -X POST http://localhost:3080/api/user \
		--header 'Content-Type: application/json' \
		--data-raw '{"email":"jane.doe@marmelab.com","login": "jane.doe@marmelab.com","password": "password"}' || true
	@curl smtp://localhost:3025 --mail-from jane.doe@marmelab.com --mail-rcpt john.doe@marmelab.com --upload-file seed/mail/mail1.txt
	@curl smtp://localhost:3025 --mail-from jane.doe@marmelab.com --mail-rcpt john.doe@marmelab.com --upload-file seed/mail/mail2.txt
	@curl smtp://localhost:3025 --mail-from jane.doe@marmelab.com --mail-rcpt john.doe@marmelab.com --upload-file seed/mail/mail3.txt


list-john-doe-mail:
	@curl -X GET http://localhost:3080/api/user/john.doe@marmelab.com/messages/INBOX
	@echo ""

list-jane-doe-mail:
	@curl -X GET http://localhost:3080/api/user/jane.doe@marmelab.com/messages/INBOX
	@echo ""

purge-mail:
	@curl -X POST http://localhost:3080/api/mail/purge
