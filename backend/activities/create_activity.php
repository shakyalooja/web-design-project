<?php
require '../config/db.php';
header('Content-Type: application/json');

$user_id = require_login();
$data = read_json();

$destination_id = $data['destination_id'] ?? null;
if (!$destination_id) {
    fail(400, "destination_id is required.");
}
$activity_name = clean_text($data['activity_name'] ?? '', "Activity name", 150);
$category = clean_category($data['category'] ?? '');
$estimated_cost = clean_money($data['estimated_cost'] ?? null, "Cost");

$check = $pdo->prepare("
    SELECT d.destination_id FROM destinations d
    JOIN trips t ON d.trip_id = t.trip_id
    WHERE d.destination_id = ? AND t.user_id = ?
");
$check->execute([$destination_id, $user_id]);
if (!$check->fetch()) {
    fail(403, "You don't have access to this destination.");
}

$stmt = $pdo->prepare("INSERT INTO activities (destination_id, activity_name, estimated_cost, category) VALUES (?, ?, ?, ?)");
$stmt->execute([$destination_id, $activity_name, $estimated_cost, $category]);

echo json_encode(["success" => true, "activity_id" => $pdo->lastInsertId()]);
?>
