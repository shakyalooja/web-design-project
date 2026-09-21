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

if (!$activity_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "activity_id is required."]);
    exit;
}

$stmt = $pdo->prepare("
    DELETE a FROM activities a
    JOIN destinations d ON a.destination_id = d.destination_id
    JOIN trips t ON d.trip_id = t.trip_id
    WHERE a.activity_id = ? AND t.user_id = ?
");
$stmt->execute([$activity_id, $user_id]);

echo json_encode(["success" => true]);
?>