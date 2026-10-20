<?php

require_once '../../Core/dbconnection.php';
require_once '../../Core/dbprocess.php';
require_once '../database.php';
$data = json_decode(file_get_contents('php://input'), true);

$process = new DBProcess(
    name: 'Add new room usage log',
    query: "INSERT INTO logs(room, u_start, u_end, user) VALUES(:room, :u_start, NOW(), :user)",
    type: 'set',
    database: 'main',
    params: [
        ':room' => $data['room'],
        ':u_start' => $data['u_start'],
        ':user' => $data['user']
    ]
);

echo $process->execute();
