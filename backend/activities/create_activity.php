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

$destination_id = $data['destination_id'] ?? null;
$activity_name = trim($data['activity_name'] ?? '');
$category = trim($data['category'] ?? '');
$estimated_cost = $data['estimated_cost'] ?? 0;
if ($estimated_cost === '') $estimated_cost = 0;

if (!is_numeric($estimated_cost) || $estimated_cost < 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Cost must be a number of 0 or more."]);
    exit;
}

if (!$destination_id || !$activity_name) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "destination_id and activity_name are required."]);
    exit;
}

// Security check: make sure this destination belongs to a trip owned by this user
$check = $pdo->prepare("
    SELECT d.destination_id FROM destinations d
    JOIN trips t ON d.trip_id = t.trip_id
    WHERE d.destination_id = ? AND t.user_id = ?
");
$check->execute([$destination_id, $user_id]);
if (!$check->fetch()) {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "You don't have access to this destination."]);
    exit;
}

$stmt = $pdo->prepare("INSERT INTO activities (destination_id, activity_name, estimated_cost, category) VALUES (?, ?, ?, ?)");
$stmt->execute([$destination_id, $activity_name, $estimated_cost, $category]);

echo json_encode(["success" => true, "activity_id" => $pdo->lastInsertId()]);
?>