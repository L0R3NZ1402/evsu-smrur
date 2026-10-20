<?php

require_once __DIR__ . '../../Core/dbconnection.php';


#region-start
Database::register(
    name: 'main',
    host: 'localhost',
    database: 'evsuroomlogger',
    username: 'root',
    password: ''
);

#region-end

// // JSON response
// header('Content-Type: application/json; charset=utf-8');

// echo json_encode(
//     Database::all(),
//     JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
// );