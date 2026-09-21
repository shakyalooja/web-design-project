<?php
require '../config/db.php';
header('Content-Type: application/json');

$code = $_GET['code'] ?? '';

if (!preg_match('/^[a-f0-9]{16,32}$/', $code)) {
    fail(404, "Trip not found or not shared.");
}

$stmt = $pdo->prepare("SELECT trip_id, trip_name, start_date, end_date FROM trips WHERE share_code = ? AND is_shared = 1");
$stmt->execute([$code]);
$trip = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$trip) {
    fail(404, "Trip not found or not shared.");
}

$rows = $pdo->prepare("
    SELECT d.destination_id, d.location_name, d.arrival_date, d.departure_date, d.notes,
           a.activity_name, a.category, a.estimated_cost
    FROM destinations d
    LEFT JOIN activities a ON a.destination_id = d.destination_id
    WHERE d.trip_id = ?
    ORDER BY d.destination_id ASC, a.activity_id ASC
");
$rows->execute([$trip['trip_id']]);

$destinations = [];
foreach ($rows->fetchAll(PDO::FETCH_ASSOC) as $row) {
    $id = $row['destination_id'];
    if (!isset($destinations[$id])) {
        $destinations[$id] = [
            "location_name" => $row['location_name'],
            "arrival_date" => $row['arrival_date'],
            "departure_date" => $row['departure_date'],
            "notes" => $row['notes'],
            "activities" => []
        ];
    }
    if ($row['activity_name'] !== null) {
        $destinations[$id]['activities'][] = [
            "activity_name" => $row['activity_name'],
            "category" => $row['category'],
            "estimated_cost" => (float)$row['estimated_cost']
        ];
    }
}

[$total, $by_category] = trip_costs($pdo, $trip['trip_id']);
unset($trip['trip_id']);
$trip['total_cost'] = $total;
$trip['cost_by_category'] = $by_category;

echo json_encode(["success" => true, "trip" => $trip, "destinations" => array_values($destinations)]);
?>
