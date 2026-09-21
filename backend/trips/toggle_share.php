<?php
require '../config/db.php';
header('Content-Type: application/json');

$user_id = require_login();
$data = read_json();
$trip_id = $data['trip_id'] ?? null;

if (!$trip_id) {
    fail(400, "trip_id is required.");
}

$stmt = $pdo->prepare("SELECT is_shared FROM trips WHERE trip_id = ? AND user_id = ?");
$stmt->execute([$trip_id, $user_id]);
$trip = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$trip) {
    fail(404, "Trip not found.");
}

// A new random code on every enable means an old link stops working after sharing is turned off.
$turn_on = !$trip['is_shared'];
$code = $turn_on ? bin2hex(random_bytes(12)) : null;

$update = $pdo->prepare("UPDATE trips SET is_shared = ?, share_code = ? WHERE trip_id = ? AND user_id = ?");
$update->execute([$turn_on ? 1 : 0, $code, $trip_id, $user_id]);

echo json_encode(["success" => true, "is_shared" => $turn_on ? 1 : 0, "share_code" => $code]);
?>
