<?php
require '../config/db.php';
header('Content-Type: application/json');

$user_id = require_login();
$data = read_json();

$trip_id = $data['trip_id'] ?? null;
if (!$trip_id) {
    fail(400, "trip_id is required.");
}
$location_name = clean_text($data['location_name'] ?? '', "Location name", 150);
[$arrival_date, $departure_date] = clean_dates($data['arrival_date'] ?? '', $data['departure_date'] ?? '');
$notes = clean_text($data['notes'] ?? '', "Notes", 2000, false);

$check = $pdo->prepare("SELECT trip_id FROM trips WHERE trip_id = ? AND user_id = ?");
$check->execute([$trip_id, $user_id]);
if (!$check->fetch()) {
    fail(403, "You don't have access to this trip.");
}

$stmt = $pdo->prepare("INSERT INTO destinations (trip_id, location_name, arrival_date, departure_date, notes) VALUES (?, ?, ?, ?, ?)");
$stmt->execute([$trip_id, $location_name, $arrival_date, $departure_date, $notes]);

echo json_encode(["success" => true, "destination_id" => $pdo->lastInsertId()]);
?>
