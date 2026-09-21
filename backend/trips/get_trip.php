<?php
require '../config/db.php';
header('Content-Type: application/json');

$user_id = require_login();
$trip_id = $_GET['trip_id'] ?? null;

if (!$trip_id) {
    fail(400, "trip_id is required.");
}

$stmt = $pdo->prepare("SELECT trip_id, trip_name, start_date, end_date, budget, is_shared, share_code FROM trips WHERE trip_id = ? AND user_id = ?");
$stmt->execute([$trip_id, $user_id]);
$trip = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$trip) {
    fail(404, "Trip not found.");
}

[$total, $by_category] = trip_costs($pdo, $trip_id);
$trip['total_cost'] = $total;
$trip['cost_by_category'] = $by_category;

echo json_encode(["success" => true, "trip" => $trip]);
?>
