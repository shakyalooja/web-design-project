<?php
require '../config/db.php';
header('Content-Type: application/json');

$user_id = require_login();

$stmt = $pdo->prepare("
    SELECT t.trip_id, t.trip_name, t.start_date, t.end_date, t.budget, t.is_shared,
        (SELECT COUNT(*) FROM destinations d WHERE d.trip_id = t.trip_id) AS destination_count,
        (SELECT COALESCE(SUM(a.estimated_cost), 0)
            FROM activities a
            JOIN destinations d ON a.destination_id = d.destination_id
            WHERE d.trip_id = t.trip_id) AS total_cost
    FROM trips t
    WHERE t.user_id = ?
    ORDER BY t.created_at DESC, t.trip_id DESC
");
$stmt->execute([$user_id]);
$trips = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(["success" => true, "trips" => $trips]);
?>
