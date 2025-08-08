<?php
include 'db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit();
}

try {
    $estate = $_GET['estate'] ?? 'Kilimani';
    $limit = $_GET['limit'] ?? 20;
    
    $stmt = $conn->prepare("
        SELECT * FROM businesses 
        WHERE estate = ? 
        ORDER BY created_at DESC 
        LIMIT ?
    ");
    
    $stmt->execute([$estate, (int)$limit]);
    $businesses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "success" => true,
        "businesses" => $businesses,
        "count" => count($businesses)
    ]);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch businesses: " . $e->getMessage()]);
}
?>