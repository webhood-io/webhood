cd src/core
yarn install --frozen-lockfile
yarn run dev &
cd ../backend
cp -r migrations src/pb_migrations
cd src
go run main.go config.go migrate
go run main.go config.go create_user -u admin -p password123 -e test@example.com
go run main.go config.go serve