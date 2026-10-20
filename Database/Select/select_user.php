<?php

require_once '../../Core/dbconnection.php';
require_once '../../Core/dbprocess.php';
require_once '../database.php';
$data = json_decode(file_get_contents('php://input'), true);

$process = new DBProcess(
    name: 'Select User by Username and Password',
    query: "SELECT * FROM users WHERE username = :username AND password = :password LIMIT 1",
    type: 'get',
    database: 'main',
    params: [
        ':username' => $data['username'],
        ':password' => $data['password']
    ]
);

echo $process->execute();
