## Variables ##

knexfile :=  dist/src/config/knexfile.js

## Rules ##

compile:
	npx tsc
	npm run copy-docs

node_modules: package.json
	npm install

install: node_modules

test: reset-test-db
	npx jest --runInBand --verbose --forceExit -i

test-update: reset-test-db
	npx jest --runInBand --verbose --forceExit -i -u

test-watch: reset-test-db
	npx jest --watch --runInBand --verbose --forceExit -i

coverage: reset-test-db
	npx jest --runInBand --verbose --forceExit --coverage -i

publish-coverage:
	npx codecov

run: compile
	node ./dist/src/cluster

develop:
	npx nodemon --watch src --ext ts --exec "make run || exit 1"

lint:
	npx tslint --project tsconfig.json --fix

migrate:
	make compile
	npx knex migrate:latest --knexfile=$(knexfile)

rollback:
	make compile
	npx knex migrate:rollback --knexfile=$(knexfile)

reset-test-db:
	make compile
	NODE_ENV=test npx knex migrate:rollback --knexfile=$(knexfile)
	NODE_ENV=test npx knex migrate:latest --knexfile=$(knexfile)

reset-dev-db:
	make compile
	npx knex migrate:rollback --knexfile=$(knexfile)
	npx knex migrate:latest --knexfile=$(knexfile)

reset-dev-db-seed:
	make compile
	npx knex migrate:rollback --knexfile=$(knexfile)
	npx knex migrate:latest --knexfile=$(knexfile)
	npx knex seed:run --knexfile=$(knexfile)

init-stripe: compile
	node ./dist/src/scripts/initialize-stripe.js

infra:
	docker-compose up -d --force-recreate

infra-stop:
	docker-compose stop

infra-restart: infra-stop infra

.PHONY: install
	compile
	develop
	lint
	migrate
	test
	coverage
	publish-coverage
	reset-dev-db
	reset-test-db
	infra-stop
	infra-restart
