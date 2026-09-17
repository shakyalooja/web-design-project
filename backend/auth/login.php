<?php
require '../config/db.php';
header('Content-Type: application/json');
session_start();

$data = json_decode(file_get_contents("php://input"), true);

$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Email and password are required."]);
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($password, $user['password_hash'])) {
    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['full_name'] = $user['full_name'];

    echo json_encode(["success" => true, "user_id" => $user['user_id']]);
} else {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Invalid email or password."]);
}
?>