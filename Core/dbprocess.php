<?php

class DBProcess
{
    private string $name;
    private string $query;
    private string $type;
    private string $database;
    private array $params;

    public function __construct(
        string $name,
        string $query,
        string $type = 'get',
        string $database = 'main',
        array $params = []
    ) {
        $this->name = $name;
        $this->query = $query;
        $this->type = strtolower($type);
        $this->database = $database;
        $this->params = $params;
    }

    public function execute(): string
    {
        try {

            $pdo = Database::get($this->database);

            $stmt = $pdo->prepare($this->query);

            $stmt->execute($this->params);

            if ($this->type === 'get') {

                return json_encode([
                    'status' => 'Success',
                    'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)
                ]);
            }

            if ($this->type === 'set') {

                return json_encode([
                    'status' => 'Success',
                    'data' => [
                        'affectedRows' => $stmt->rowCount(),
                        'lastInsertId' => $pdo->lastInsertId()
                    ]
                ]);
            }

            return json_encode([
                'status' => 'Failed',
                'message' => "Unknown process type: {$this->type}"
            ]);

        } catch (PDOException $e) {

            return json_encode([
                'status' => 'Failed',
                'message' => $e->getMessage()
            ]);
        }
    }
}