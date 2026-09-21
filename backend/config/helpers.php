<?php
const ACTIVITY_CATEGORIES = ['flight', 'accommodation', 'transport', 'food', 'sightseeing', 'other'];

function fail($code, $message) {
    http_response_code($code);
    echo json_encode(["success" => false, "error" => $message]);
    exit;
}

function require_login() {
    session_start();
    if (!isset($_SESSION['user_id'])) {
        fail(401, "You must be logged in.");
    }
    return $_SESSION['user_id'];
}

function read_json() {
    $data = json_decode(file_get_contents("php://input"), true);
    return is_array($data) ? $data : [];
}

function clean_text($value, $label, $max, $required = true) {
    $value = trim((string)($value ?? ''));
    if ($required && $value === '') {
        fail(400, "$label is required.");
    }
    if (mb_strlen($value) > $max) {
        fail(400, "$label must be $max characters or fewer.");
    }
    return $value;
}

// Returns [start, end] as 'YYYY-MM-DD' or null; fails on a bad date or an end before the start.
function clean_dates($startRaw, $endRaw) {
    $out = [];
    foreach ([$startRaw, $endRaw] as $raw) {
        $raw = trim((string)($raw ?? ''));
        if ($raw === '') {
            $out[] = null;
            continue;
        }
        $d = DateTime::createFromFormat('Y-m-d', $raw);
        if (!$d || $d->format('Y-m-d') !== $raw) {
            fail(400, "Dates must be valid, like 2026-11-05.");
        }
        $out[] = $raw;
    }
    if ($out[0] && $out[1] && $out[1] < $out[0]) {
        fail(400, "The end date cannot be before the start date.");
    }
    return $out;
}

// Returns a float, or null when empty and $allowEmpty is true.
function clean_money($value, $label, $allowEmpty = false) {
    if ($value === null || $value === '') {
        if ($allowEmpty) return null;
        return 0.0;
    }
    if (!is_numeric($value) || $value < 0 || $value > 1000000) {
        fail(400, "$label must be a number from 0 to 1,000,000.");
    }
    return round((float)$value, 2);
}

function clean_category($value) {
    $value = strtolower(trim((string)($value ?? '')));
    if (!in_array($value, ACTIVITY_CATEGORIES, true)) {
        fail(400, "Please choose a valid category.");
    }
    return $value;
}

function trip_costs($pdo, $trip_id) {
    $stmt = $pdo->prepare("
        SELECT a.category, SUM(a.estimated_cost) AS total
        FROM activities a
        JOIN destinations d ON a.destination_id = d.destination_id
        WHERE d.trip_id = ?
        GROUP BY a.category
        ORDER BY total DESC
    ");
    $stmt->execute([$trip_id]);
    $by_category = [];
    $total = 0.0;
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $by_category[] = ["category" => $row['category'], "total" => (float)$row['total']];
        $total += (float)$row['total'];
    }
    return [$total, $by_category];
}
?>
