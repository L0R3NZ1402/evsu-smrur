<?php

require_once '../../Core/dbconnection.php';
require_once '../../Core/dbprocess.php';
require_once '../database.php';
$data = json_decode(file_get_contents('php://input'), true);

$process = new DBProcess(
    name: 'Select User by username',
    query: "SELECT * FROM users WHERE username = :username LIMIT 1",
    type: 'get',
    database: 'main',
    params: [
        ':username' => $data['username'],
    ]
);

echo $process->execute();
