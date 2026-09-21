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
$location_name = trim($data['location_name'] ?? '');
$arrival_date = $data['arrival_date'] ?: null;
$departure_date = $data['departure_date'] ?: null;
$notes = trim($data['notes'] ?? '');

if (!$destination_id || !$location_name) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "destination_id and location_name are required."]);
    exit;
}

// Security check: make sure this destination belongs to a trip owned by this user
$stmt = $pdo->prepare("
    UPDATE destinations d
    JOIN trips t ON d.trip_id = t.trip_id
    SET d.location_name = ?, d.arrival_date = ?, d.departure_date = ?, d.notes = ?
    WHERE d.destination_id = ? AND t.user_id = ?
");
$stmt->execute([$location_name, $arrival_date, $departure_date, $notes, $destination_id, $user_id]);

echo json_encode(["success" => true]);
?>