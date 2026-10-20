<?php

require_once '../../Core/dbconnection.php';
require_once '../../Core/dbprocess.php';
require_once '../database.php';
$data = json_decode(file_get_contents('php://input'), true);

$process = new DBProcess(
    name: 'Delete User',
    query: "DELETE FROM users WHERE id = :id",
    type: 'set',
    database: 'main',
    params: [
        ':id' => $data['id']
    ]
);

echo $process->execute();
