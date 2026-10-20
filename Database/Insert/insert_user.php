<?php

require_once '../../Core/dbconnection.php';
require_once '../../Core/dbprocess.php';
require_once '../database.php';
$data = json_decode(file_get_contents('php://input'), true);

$process = new DBProcess(
    name: 'Add a user with pending status',
    query: "INSERT INTO users(fname, lname, department, username, password, status) VALUES(:fname, :lname, :department, :username, :password, :status)",
    type: 'set',
    database: 'main',
    params: [
        ':fname' => $data['fname'],
        ':lname' => $data['lname'],
        ':department' => $data['department'],
        ':username' => $data['username'],
        ':password' => $data['password'],
        ':status' => 'Pending'
    ]
);

echo $process->execute();
