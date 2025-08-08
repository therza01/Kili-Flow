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
    $limit = $_GET['limit'] ?? 50;
    
    $stmt = $conn->prepare("
        SELECT i.*, u.name as user_name 
        FROM issues i 
        LEFT JOIN users u ON i.user_id = u.id 
        WHERE i.location = ? OR i.location IS NULL
        ORDER BY i.created_at DESC 
        LIMIT ?
    ");
    
    $stmt->execute([$estate, (int)$limit]);
    $issues = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format the response
    $formatted_issues = array_map(function($issue) {
        return [
            'id' => $issue['id'],
            'type' => $issue['type'],
            'description' => $issue['description'],
            'latitude' => (float)$issue['latitude'],
            'longitude' => (float)$issue['longitude'],
            'location' => $issue['location'],
            'status' => $issue['status'],
            'photo_url' => $issue['photo_url'],
            'created_at' => $issue['created_at'],
            'user_name' => $issue['user_name']
        ];
    }, $issues);
    
    echo json_encode([
        "success" => true,
        "issues" => $formatted_issues,
        "count" => count($formatted_issues)
    ]);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch issues: " . $e->getMessage()]);
}
?>