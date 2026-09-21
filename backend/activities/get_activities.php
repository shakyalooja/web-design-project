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
$destination_id = $_GET['destination_id'] ?? null;

if (!$destination_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "destination_id is required."]);
    exit;
}

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

$stmt = $pdo->prepare("SELECT * FROM activities WHERE destination_id = ? ORDER BY activity_id ASC");
$stmt->execute([$destination_id]);
$activities = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(["success" => true, "activities" => $activities]);
?>