# TripPlanner

A trip planner website. Users can create trips, add destinations and activities, see the total cost, and share a trip with a public link.

Built with HTML, CSS, JavaScript, PHP and MySQL.

## Run with Docker

```
docker compose up -d --build
```

Open http://localhost:8080/index.html

Demo login: `demo@example.com` / `demo1234`

Demo shared trip: http://localhost:8080/shared-trip.html?code=a1b2c3d4e5f60718293a4b5c

## Stop

```
docker compose down
```

## Reset the database

Run this after any change to `database/trip_planner.sql`. The database is only created the first time.

```
docker compose down -v
docker compose up -d --build
```

## Run the tests

The tests send real requests to the running app, so start it first with `docker compose up -d`. You need PHP 8.2+ and Composer on your machine.

```
composer install
composer test
```

Test users use `@phpunit.test` emails and are deleted after each test.
