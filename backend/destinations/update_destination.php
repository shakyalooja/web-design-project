<?php
require '../config/db.php';
header('Content-Type: application/json');

$user_id = require_login();
$data = read_json();

$destination_id = $data['destination_id'] ?? null;
if (!$destination_id) {
    fail(400, "destination_id is required.");
}
$location_name = clean_text($data['location_name'] ?? '', "Location name", 150);
[$arrival_date, $departure_date] = clean_dates($data['arrival_date'] ?? '', $data['departure_date'] ?? '');
$notes = clean_text($data['notes'] ?? '', "Notes", 2000, false);

$stmt = $pdo->prepare("
    UPDATE destinations d
    JOIN trips t ON d.trip_id = t.trip_id
    SET d.location_name = ?, d.arrival_date = ?, d.departure_date = ?, d.notes = ?
    WHERE d.destination_id = ? AND t.user_id = ?
");
$stmt->execute([$location_name, $arrival_date, $departure_date, $notes, $destination_id, $user_id]);

echo json_encode(["success" => true]);
?>
