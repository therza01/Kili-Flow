<?php
include 'db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Fetch community posts
    try {
        $estate = $_GET['estate'] ?? 'Kilimani';
        $limit = $_GET['limit'] ?? 20;
        
        $stmt = $conn->prepare("
            SELECT cp.*, u.name as user_name 
            FROM community_posts cp 
            LEFT JOIN users u ON cp.user_id = u.id 
            WHERE cp.estate = ? 
            ORDER BY cp.created_at DESC 
            LIMIT ?
        ");
        
        $stmt->execute([$estate, (int)$limit]);
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format the response
        $formatted_posts = array_map(function($post) {
            return [
                'id' => $post['id'],
                'user_id' => $post['user_id'],
                'estate' => $post['estate'],
                'content' => $post['content'],
                'created_at' => $post['created_at'],
                'user' => [
                    'name' => $post['user_name'] ?? 'Anonymous'
                ]
            ];
        }, $posts);
        
        echo json_encode([
            "success" => true,
            "posts" => $formatted_posts,
            "count" => count($formatted_posts)
        ]);
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to fetch posts: " . $e->getMessage()]);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Create new community post
    try {
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Validate required fields
        if (!isset($data['content']) || empty(trim($data['content']))) {
            http_response_code(400);
            echo json_encode(["error" => "Content is required"]);
            exit();
        }
        
        $stmt = $conn->prepare("INSERT INTO community_posts (user_id, estate, content) VALUES (?, ?, ?)");
        
        $user_id = $data['user_id'] ?? null;
        $estate = $data['estate'] ?? 'Kilimani';
        $content = trim($data['content']);
        
        $stmt->execute([$user_id, $estate, $content]);
        
        $post_id = $conn->lastInsertId();
        
        echo json_encode([
            "success" => true,
            "post_id" => $post_id,
            "message" => "Post created successfully"
        ]);
        
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to create post: " . $e->getMessage()]);
    }
    
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>