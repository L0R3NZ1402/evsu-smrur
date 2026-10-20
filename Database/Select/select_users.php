<?php

require_once '../../Core/dbconnection.php';
require_once '../../Core/dbprocess.php';
require_once '../database.php';
$data = json_decode(file_get_contents('php://input'), true);

$process = new DBProcess(
    name: 'Select All Users',
    query: "SELECT * FROM users ORDER BY lname",
    type: 'get',
    database: 'main',
    // params: [
    //     ':name' => $data['name'],
    //     ':address' => $data['address'],
    //     ':email' => $data['email'],
    //     ':phone' => $data['phone']
    // ]
);

echo $process->execute();
