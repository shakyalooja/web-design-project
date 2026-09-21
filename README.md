# TripPlanner

A trip planner website. Users can create trips, add destinations and activities, see the total cost, and share a trip with a public link.

Built with HTML, CSS, JavaScript, PHP and MySQL.

## Run with Docker

```
docker compose up -d --build
```

Open http://localhost:8080/index.html

Demo login: `demo@example.com` / `demo1234`

## Stop

```
docker compose down
```

## Reset the database

```
docker compose down -v
docker compose up -d --build
```
