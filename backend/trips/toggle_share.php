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

// Check current share status first
$stmt = $pdo->prepare("SELECT is_shared FROM trips WHERE trip_id = ? AND user_id = ?");
$stmt->execute([$trip_id, $user_id]);
$trip = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$trip) {
    http_response_code(404);
    echo json_encode(["success" => false, "error" => "Trip not found."]);
    exit;
}

// Flip it: if currently shared (1), turn off (0), and vice versa
$new_status = $trip['is_shared'] ? 0 : 1;

$update = $pdo->prepare("UPDATE trips SET is_shared = ? WHERE trip_id = ? AND user_id = ?");
$update->execute([$new_status, $trip_id, $user_id]);

echo json_encode(["success" => true, "is_shared" => $new_status]);
?>