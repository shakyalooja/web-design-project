<?php
require '../config/db.php';
header('Content-Type: application/json');

$user_id = require_login();
$data = read_json();

$activity_id = $data['activity_id'] ?? null;
if (!$activity_id) {
    fail(400, "activity_id is required.");
}
$activity_name = clean_text($data['activity_name'] ?? '', "Activity name", 150);
$category = clean_category($data['category'] ?? '');
$estimated_cost = clean_money($data['estimated_cost'] ?? null, "Cost");

$stmt = $pdo->prepare("
    UPDATE activities a
    JOIN destinations d ON a.destination_id = d.destination_id
    JOIN trips t ON d.trip_id = t.trip_id
    SET a.activity_name = ?, a.category = ?, a.estimated_cost = ?
    WHERE a.activity_id = ? AND t.user_id = ?
");
$stmt->execute([$activity_name, $category, $estimated_cost, $activity_id, $user_id]);

echo json_encode(["success" => true]);
?>
