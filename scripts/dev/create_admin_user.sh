# Never user this in production, local machine development only
docker compose -f docker-compose.dev.yml run backend create_user -u admin -p password