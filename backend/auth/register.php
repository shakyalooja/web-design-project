<?php
require '../config/db.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

$full_name = trim($data['full_name'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (!$full_name || !$email || !$password) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "All fields are required."]);
    exit;
}

$password_hash = password_hash($password, PASSWORD_DEFAULT);

try {
    $stmt = $pdo->prepare("INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)");
    $stmt->execute([$full_name, $email, $password_hash]);

    echo json_encode(["success" => true, "user_id" => $pdo->lastInsertId()]);
} catch (PDOException $e) {
    http_response_code(409);
    echo json_encode(["success" => false, "error" => "That email is already registered."]);
}
?>