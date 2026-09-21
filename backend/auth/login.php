<?php
require '../config/db.php';
header('Content-Type: application/json');
session_start();

$data = read_json();

$email = strtolower(trim((string)($data['email'] ?? '')));
$password = (string)($data['password'] ?? '');

if (!$email || !$password) {
    fail(400, "Email and password are required.");
}

$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($password, $user['password_hash'])) {
    session_regenerate_id(true);
    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['full_name'] = $user['full_name'];

    echo json_encode(["success" => true, "user_id" => $user['user_id']]);
} else {
    fail(401, "Invalid email or password.");
}
?>
