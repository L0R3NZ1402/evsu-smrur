<?php

require_once '../../Core/dbconnection.php';
require_once '../../Core/dbprocess.php';
require_once '../database.php';
$data = json_decode(file_get_contents('php://input'), true);

$process = new DBProcess(
    name: 'Update the User Status',
    query: "UPDATE users SET status = :status WHERE id = :id",
    type: 'set',
    database: 'main',
    params: [
        ':status' => $data['status'],
        ':id' => $data['id']
    ]
);

echo $process->execute();
