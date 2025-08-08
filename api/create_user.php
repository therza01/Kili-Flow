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
    if (!isset($data['name']) || empty(trim($data['name']))) {
        http_response_code(400);
        echo json_encode(["error" => "Name is required"]);
        exit();
    }
    
    // Check if user already exists by WhatsApp or name
    $checkStmt = $conn->prepare("SELECT id FROM users WHERE whatsapp = ? OR name = ?");
    $checkStmt->execute([$data['whatsapp'] ?? '', $data['name']]);
    
    if ($checkStmt->rowCount() > 0) {
        // Update existing user
        $existingUser = $checkStmt->fetch(PDO::FETCH_ASSOC);
        $updateStmt = $conn->prepare("UPDATE users SET name = ?, whatsapp = ?, estate = ?, latitude = ?, longitude = ? WHERE id = ?");
        
        $latitude = $data['latitude'] ?? -1.2860;
        $longitude = $data['longitude'] ?? 36.7871;
        $estate = $data['estate'] ?? 'Kilimani';
        
        $updateStmt->execute([
            $data['name'],
            $data['whatsapp'] ?? null,
            $estate,
            $latitude,
            $longitude,
            $existingUser['id']
        ]);
        
        echo json_encode([
            "success" => true,
            "user_id" => $existingUser['id'],
            "message" => "User updated successfully"
        ]);
    } else {
        // Create new user
        $stmt = $conn->prepare("INSERT INTO users (name, whatsapp, estate, latitude, longitude) VALUES (?, ?, ?, ?, ?)");
        
        $latitude = $data['latitude'] ?? -1.2860;
        $longitude = $data['longitude'] ?? 36.7871;
        $estate = $data['estate'] ?? 'Kilimani';
        
        $stmt->execute([
            $data['name'],
            $data['whatsapp'] ?? null,
            $estate,
            $latitude,
            $longitude
        ]);
        
        $user_id = $conn->lastInsertId();
        
        echo json_encode([
            "success" => true,
            "user_id" => $user_id,
            "message" => "User created successfully"
        ]);
    }
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to create/update user: " . $e->getMessage()]);
}
?>