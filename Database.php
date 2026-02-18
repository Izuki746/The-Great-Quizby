<?php
$database_host = "dbhost.cs.man.ac.uk";
$database_user = "m89432yt";
$database_pass = "smYz9wBtocktQM3X8UEN0og0/A9B/sgRYWWzAG67MrQ";
$database_name = "m89432yt";

try {
    $pdo = new PDO(
        "mysql:host=$database_host;dbname=$database_name;charset=utf8",
        $database_user,
        $database_pass
    );

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}
?>
