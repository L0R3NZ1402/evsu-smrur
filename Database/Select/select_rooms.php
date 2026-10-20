<?php

require_once '../../Core/dbconnection.php';
require_once '../../Core/dbprocess.php';
require_once '../database.php';
$data = json_decode(file_get_contents('php://input'), true);

$process = new DBProcess(
    name: 'Select all rooms',
    query: "SELECT a.*, b.fname, b.lname, b.department FROM rooms a LEFT JOIN users b ON b.id = a.user",
    type: 'get',
    database: 'main',
    // params: [
    //     ':username' => $data['username'],
    //     ':password' => $data['password']
    // ]
);

echo $process->execute();
