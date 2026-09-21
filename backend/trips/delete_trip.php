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
$trip_id = $data['trip_id'] ?? null;

if (!$trip_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "trip_id is required."]);
    exit;
}

$stmt = $pdo->prepare("DELETE FROM trips WHERE trip_id = ? AND user_id = ?");
$stmt->execute([$trip_id, $user_id]);

echo json_encode(["success" => true]);
?>