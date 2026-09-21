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

$trip_name = trim($data['trip_name'] ?? '');
$start_date = $data['start_date'] ?: null;
$end_date = $data['end_date'] ?: null;

if (!$trip_name) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Trip name is required."]);
    exit;
}

$stmt = $pdo->prepare("INSERT INTO trips (user_id, trip_name, start_date, end_date) VALUES (?, ?, ?, ?)");
$stmt->execute([$user_id, $trip_name, $start_date, $end_date]);

echo json_encode(["success" => true, "trip_id" => $pdo->lastInsertId()]);
?>