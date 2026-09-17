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
$trip_id = $_GET['trip_id'] ?? null;

if (!$trip_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "trip_id is required."]);
    exit;
}

// Security check: make sure this trip belongs to the logged-in user
$check = $pdo->prepare("SELECT trip_id FROM trips WHERE trip_id = ? AND user_id = ?");
$check->execute([$trip_id, $user_id]);
if (!$check->fetch()) {
    http_response_code(403);
    echo json_encode(["success" => false, "error" => "You don't have access to this trip."]);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM destinations WHERE trip_id = ? ORDER BY destination_id ASC");
$stmt->execute([$trip_id]);
$destinations = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(["success" => true, "destinations" => $destinations]);
?>