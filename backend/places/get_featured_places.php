<?php
require '../config/db.php';
header('Content-Type: application/json');

$stmt = $pdo->query("SELECT * FROM featured_places ORDER BY place_id ASC");
$places = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(["success" => true, "places" => $places]);
?>