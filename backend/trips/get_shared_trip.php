<?php
require '../config/db.php';
header('Content-Type: application/json');

$trip_id = $_GET['trip_id'] ?? null;

if (!$trip_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "trip_id is required."]);
    exit;
}

// Only return the trip if it's actually marked as shared
$stmt = $pdo->prepare("SELECT trip_id, trip_name, start_date, end_date FROM trips WHERE trip_id = ? AND is_shared = 1");
$stmt->execute([$trip_id]);
$trip = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$trip) {
    http_response_code(404);
    echo json_encode(["success" => false, "error" => "Trip not found or not shared."]);
    exit;
}

$destStmt = $pdo->prepare("SELECT * FROM destinations WHERE trip_id = ? ORDER BY destination_id ASC");
$destStmt->execute([$trip_id]);
$destinations = $destStmt->fetchAll(PDO::FETCH_ASSOC);

// Attach each destination's activities
foreach ($destinations as &$dest) {
    $actStmt = $pdo->prepare("SELECT activity_name, category, estimated_cost FROM activities WHERE destination_id = ?");
    $actStmt->execute([$dest['destination_id']]);
    $dest['activities'] = $actStmt->fetchAll(PDO::FETCH_ASSOC);
}

echo json_encode(["success" => true, "trip" => $trip, "destinations" => $destinations]);
?>