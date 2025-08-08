<?php
include 'db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit();
}

try {
    // Get unique estates from users and community posts
    $stmt = $conn->prepare("
        SELECT DISTINCT estate 
        FROM (
            SELECT estate FROM users WHERE estate IS NOT NULL
            UNION
            SELECT estate FROM community_posts WHERE estate IS NOT NULL
            UNION
            SELECT estate FROM businesses WHERE estate IS NOT NULL
        ) as estates 
        ORDER BY estate
    ");
    
    $stmt->execute();
    $estates = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Add default estates if none exist
    if (empty($estates)) {
        $estates = ['Kilimani', 'Westlands', 'Karen', 'Lavington', 'Kileleshwa'];
    }
    
    echo json_encode([
        "success" => true,
        "estates" => $estates,
        "count" => count($estates)
    ]);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch estates: " . $e->getMessage()]);
}
?>