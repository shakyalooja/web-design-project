<?php
require '../config/db.php';
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "You must be logged in."]);
    exit;
}

$user_id = $_SESSION['user_id'];
$data = json_decode(file_get_contents("php://input"), true);

$activity_id = $data['activity_id'] ?? null;
$activity_name = trim($data['activity_name'] ?? '');
$category = trim($data['category'] ?? '');
$estimated_cost = $data['estimated_cost'] ?? 0;
if ($estimated_cost === '') $estimated_cost = 0;

if (!is_numeric($estimated_cost) || $estimated_cost < 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Cost must be a number of 0 or more."]);
    exit;
}

if (!$activity_id || !$activity_name) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "activity_id and activity_name are required."]);
    exit;
}

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