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
$location_name = trim($data['location_name'] ?? '');
$arrival_date = $data['arrival_date'] ?: null;
$departure_date = $data['departure_date'] ?: null;
$notes = trim($data['notes'] ?? '');

if (!$trip_id || !$location_name) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "trip_id and location_name are required."]);
    exit;
}

// Security check: make sure this trip actually belongs to the logged-in user
$check = $pdo->prepare("SELECT trip_id FROM trips WHERE trip_id = ? AND user_id = ?");
$check->execute([$trip_id, $user_id]);
if (!$check->fetch()) {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "You don't have access to this trip."]);
    exit;
}

$stmt = $pdo->prepare("INSERT INTO destinations (trip_id, location_name, arrival_date, departure_date, notes) VALUES (?, ?, ?, ?, ?)");
$stmt->execute([$trip_id, $location_name, $arrival_date, $departure_date, $notes]);

echo json_encode(["success" => true, "destination_id" => $pdo->lastInsertId()]);
?>