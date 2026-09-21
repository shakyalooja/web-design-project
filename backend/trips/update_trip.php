<?php
require '../config/db.php';
header('Content-Type: application/json');

$user_id = require_login();
$data = read_json();

$trip_id = $data['trip_id'] ?? null;
if (!$trip_id) {
    fail(400, "trip_id is required.");
}
$trip_name = clean_text($data['trip_name'] ?? '', "Trip name", 150);
[$start_date, $end_date] = clean_dates($data['start_date'] ?? '', $data['end_date'] ?? '');
$budget = clean_money($data['budget'] ?? null, "Budget", true);

$stmt = $pdo->prepare("UPDATE trips SET trip_name = ?, start_date = ?, end_date = ?, budget = ? WHERE trip_id = ? AND user_id = ?");
$stmt->execute([$trip_name, $start_date, $end_date, $budget, $trip_id, $user_id]);

echo json_encode(["success" => true]);
?>
