cd src/backend
cp -r migrations src/pb_migrations
cd src
go run main.go config.go migrate
go run main.go config.go create_scanner_token 2>&1|grep SCANNER_TOKEN >> ../../scanner/.env 
echo "ENDPOINT=http://127.0.0.1:8090" >> ../../scanner/.env
go run main.go config.go serve 