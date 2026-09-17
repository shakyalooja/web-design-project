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

$stmt = $pdo->prepare("SELECT * FROM trips WHERE user_id = ? ORDER BY created_at DESC");
$stmt->execute([$user_id]);
$trips = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(["success" => true, "trips" => $trips]);
?>