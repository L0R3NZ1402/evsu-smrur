<?php

require_once '../../Core/dbconnection.php';
require_once '../../Core/dbprocess.php';
require_once '../database.php';
$data = json_decode(file_get_contents('php://input'), true);

$process = new DBProcess(
    name: 'Select All Users',
    query: "SELECT a.id, a.u_start, a.u_end, b.room, c.fname, c.lname, c.department, a.timestamp FROM logs a INNER JOIN rooms b ON b.id = a.room INNER JOIN users c ON c.id = a.user ORDER BY a.timestamp DESC",
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
