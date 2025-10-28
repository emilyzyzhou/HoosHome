<?php
require 'db_connect.php';

function runSQLFile($pdo, $filePath) {
    echo "<h3>Running $filePath...</h3>";
    $sql = file_get_contents($filePath);

    // Split on semicolons unless inside DELIMITER blocks
    $delimiterPattern = '/DELIMITER\s+\/\/(.*?)\/\/\s*DELIMITER\s*;/s';
    if (preg_match_all($delimiterPattern, $sql, $matches)) {
        // Handle stored procedure sections separately
        foreach ($matches[1] as $block) {
            try {
                $pdo->exec($block);
                echo "<p>Stored procedure executed successfully.</p>";
            } catch (PDOException $e) {
                echo "<p style='color:red;'>Error in procedure: " . $e->getMessage() . "</p>";
            }
        }
    } else {
        // Run normal SQL (no DELIMITER)
        try {
            $pdo->exec($sql);
            echo "<p>Executed successfully.</p>";
        } catch (PDOException $e) {
            echo "<p style='color:red;'>Error: " . $e->getMessage() . "</p>";
        }
    }
}

// List of files in order
$sqlFiles = [
    __DIR__ . '/../db/01_schema.sql',
    __DIR__ . '/../db/02_constraints.sql',
    __DIR__ . '/../db/03_procedures.sql',
    __DIR__ . '/../db/10_seed.sql'
];

foreach ($sqlFiles as $file) {
    runSQLFile($pdo, $file);
}

echo "<h3>All SQL scripts executed.</h3>";