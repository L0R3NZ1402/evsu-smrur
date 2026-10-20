<?php

class Database
{
    private static array $connections = [];

    /**
     * Register a database connection.
     */
    public static function register(
        string $name,
        string $host,
        string $database,
        string $username,
        string $password,
        string $charset = 'utf8mb4'
    ): void {

        self::$connections[$name] = [
            'host' => $host,
            'database' => $database,
            'username' => $username,
            'password' => $password,
            'charset' => $charset,
            'pdo' => null
        ];
    }

    /**
     * Get a PDO connection.
     */
    public static function get(string $name): PDO
    {
        if (!isset(self::$connections[$name])) {
            throw new Exception(
                "Database '{$name}' is not registered."
            );
        }

        if (self::$connections[$name]['pdo'] === null) {

            $db = self::$connections[$name];

            $dsn =
                "mysql:" .
                "host={$db['host']};" .
                "dbname={$db['database']};" .
                "charset={$db['charset']}";

            $pdo = new PDO(
                $dsn,
                $db['username'],
                $db['password']
            );

            $pdo->setAttribute(
                PDO::ATTR_ERRMODE,
                PDO::ERRMODE_EXCEPTION
            );

            $pdo->setAttribute(
                PDO::ATTR_DEFAULT_FETCH_MODE,
                PDO::FETCH_ASSOC
            );

            self::$connections[$name]['pdo'] = $pdo;
        }

        return self::$connections[$name]['pdo'];
    }

    /**
     * Check whether a database exists.
     */
    public static function exists(string $name): bool
    {
        return isset(self::$connections[$name]);
    }

    public static function all(): array
    {
        $connections = [];

        foreach (self::$connections as $name => $db) {
            $connections[$name] = [
                'name' => $name,
                'host' => $db['host'],
                'database' => $db['database'],
                'username' => $db['username'],
                'charset' => $db['charset'],
                'password' => $db['password']
            ];
        }

        return $connections;
    }
}