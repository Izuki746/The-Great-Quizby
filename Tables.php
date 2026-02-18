<?php
// This file creates all tables 

require_once "Database.php"; 
try {
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1) Users table 
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS Users (
            user_id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL
        ) ENGINE=InnoDB;
    ");

    // 2) UserProfiles table (profile details)

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS UserProfiles (
            user_id INT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            score INT DEFAULT 0,

            FOREIGN KEY (user_id) REFERENCES Users(user_id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        ) ENGINE=InnoDB;
    ");

    // 3) Quizzes table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS Quizzes (
            quiz_id INT AUTO_INCREMENT PRIMARY KEY,
            no_question INT,
            questions TEXT,
            answers TEXT
        ) ENGINE=InnoDB;
    ");

    // 4) Responses table (links Users + Quizzes)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS Responses (
            response_id INT AUTO_INCREMENT PRIMARY KEY,
            score INT,
            time DATETIME DEFAULT CURRENT_TIMESTAMP,
            user_id INT NOT NULL,
            quiz_id INT NOT NULL,

            FOREIGN KEY (user_id) REFERENCES Users(user_id)
                ON DELETE CASCADE
                ON UPDATE CASCADE,

            FOREIGN KEY (quiz_id) REFERENCES Quizzes(quiz_id)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        ) ENGINE=InnoDB;
    ");

    echo " All tables created successfully (Users, UserProfiles, Quizzes, Responses)!";

} catch (PDOException $e) {
    echo " Error creating tables: " . $e->getMessage();
}
?>
