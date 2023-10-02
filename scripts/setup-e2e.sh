BACKEND_CMD=("go" "run" "main.go" "config.go")
cd src/core
yarn install --frozen-lockfile
yarn run dev &
cd ../backend
cp -r migrations src/pb_migrations
cd src
go run main.go config.go migrate
go run main.go config.go create_user -u admin -p password123 -e test@example.com
SCANNER_TOKEN=$(go run main.go config.go create_scanner_token 2>&1|grep SCANNER_TOKEN|cut -d '=' -f2) 
# echo as {"SCANNER_TOKEN":"<token>"}
echo "{\"SCANNER_TOKEN\":\"${SCANNER_TOKEN}\"}" > ../../core/cypress.env.json
# replace the token in the ".env" file with the one printed by the previous command
#sed -i "s/SCANNER_TOKEN=.*/$TOKEN/" .env
go run main.go config.go serve &