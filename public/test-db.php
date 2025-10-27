<?php
require __DIR__ . '/../src/db.php';
echo "DB OK. Row count: " .
  $pdo->query('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE()')
      ->fetchColumn();