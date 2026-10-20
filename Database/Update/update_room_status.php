<?php

require_once '../../Core/dbconnection.php';
require_once '../../Core/dbprocess.php';
require_once '../database.php';
$data = json_decode(file_get_contents('php://input'), true);

$process = new DBProcess(
    name: 'Update the Room Status',
    query: "UPDATE rooms
            SET status = :status,
                usage_stamp = IF(:usage_stamp = '', NULL, NOW()),
                user = IF(:user = '', NULL, :user)
            WHERE id = :id",
    type: 'set',
    database: 'main',
    params: [
        ':status' => $data['status'],
        ':usage_stamp' => $data['usage_stamp'] ?? '',
        ':user' => $data['user'] ?? '',
        ':id' => $data['id']
    ]
);

echo $process->execute();
