<?php
require '../config/db.php';
header('Content-Type: application/json');

$data = read_json();

$full_name = clean_text($data['full_name'] ?? '', "Full name", 100);
$email = strtolower(clean_text($data['email'] ?? '', "Email", 255));
$password = (string)($data['password'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fail(400, "Please enter a valid email address.");
}
if (strlen($password) < 8 || strlen($password) > 72) {
    fail(400, "Password must be 8 to 72 characters.");
}

$password_hash = password_hash($password, PASSWORD_DEFAULT);

try {
    $stmt = $pdo->prepare("INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)");
    $stmt->execute([$full_name, $email, $password_hash]);

    echo json_encode(["success" => true, "user_id" => $pdo->lastInsertId()]);
} catch (PDOException $e) {
    fail(409, "That email is already registered.");
}
?>
