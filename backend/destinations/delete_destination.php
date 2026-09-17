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

if (!$destination_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "destination_id is required."]);
    exit;
}

$stmt = $pdo->prepare("
    DELETE d FROM destinations d
    JOIN trips t ON d.trip_id = t.trip_id
    WHERE d.destination_id = ? AND t.user_id = ?
");
$stmt->execute([$destination_id, $user_id]);

echo json_encode(["success" => true]);
?>