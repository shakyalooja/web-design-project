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
$trip_name = trim($data['trip_name'] ?? '');
$start_date = $data['start_date'] ?: null;
$end_date = $data['end_date'] ?: null;

if (!$trip_id || !$trip_name) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "trip_id and trip_name are required."]);
    exit;
}

// Only allow updating a trip that belongs to the logged-in user
$stmt = $pdo->prepare("UPDATE trips SET trip_name = ?, start_date = ?, end_date = ? WHERE trip_id = ? AND user_id = ?");
$stmt->execute([$trip_name, $start_date, $end_date, $trip_id, $user_id]);

echo json_encode(["success" => true]);
?>