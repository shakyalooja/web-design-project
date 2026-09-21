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

$stmt = $pdo->prepare("SELECT * FROM trips WHERE trip_id = ? AND user_id = ?");
$stmt->execute([$trip_id, $user_id]);
$trip = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$trip) {
    http_response_code(404);
    echo json_encode(["success" => false, "error" => "Trip not found."]);
    exit;
}

$sum = $pdo->prepare("
    SELECT COALESCE(SUM(a.estimated_cost), 0) FROM activities a
    JOIN destinations d ON a.destination_id = d.destination_id
    WHERE d.trip_id = ?
");
$sum->execute([$trip_id]);
$trip['total_cost'] = (float)$sum->fetchColumn();

echo json_encode(["success" => true, "trip" => $trip]);
?>