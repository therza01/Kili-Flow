<?php
include 'db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit();
}

try {
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Validate required fields
    if (!isset($data['type']) || !isset($data['description'])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing required fields"]);
        exit();
    }
    
    // Set default coordinates for Kilimani if not provided
    $latitude = $data['latitude'] ?? -1.2860 + (rand(-100, 100) / 10000);
    $longitude = $data['longitude'] ?? 36.7871 + (rand(-100, 100) / 10000);
    
    $stmt = $conn->prepare("INSERT INTO issues (user_id, type, description, latitude, longitude, location, photo_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    
    $user_id = $data['user_id'] ?? null;
    $type = $data['type'];
    $description = $data['description'];
    $location = $data['location'] ?? 'Kilimani';
    $photo_url = $data['photo_url'] ?? null;
    $status = 'reported';
    
    $stmt->execute([$user_id, $type, $description, $latitude, $longitude, $location, $photo_url, $status]);
    
    $issue_id = $conn->lastInsertId();
    
    echo json_encode([
        "success" => true,
        "issue_id" => $issue_id,
        "message" => "Issue reported successfully"
    ]);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to report issue: " . $e->getMessage()]);
}
?>