CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `type` enum(''income'',''expense'') NOT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `budget_limit` decimal(15,2) DEFAULT ''0.00'',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `recurring_transactions` (
   `id` int NOT NULL AUTO_INCREMENT,
   `amount` decimal(15,2) NOT NULL,
   `type` enum('income','expense') NOT NULL,
   `note` text,
   `category_id` int NOT NULL,
   `user_id` int NOT NULL,
   `frequency` enum('daily','weekly','monthly') DEFAULT 'monthly',
   `start_date` date NOT NULL,
   `next_run_date` date NOT NULL,
   `is_active` tinyint(1) DEFAULT '1',
   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (`id`),
   KEY `user_id` (`user_id`),
   KEY `category_id` (`category_id`),
   CONSTRAINT `recurring_transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
   CONSTRAINT `recurring_transactions_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
 ) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

 CREATE TABLE `savings_goals` (
   `id` int NOT NULL AUTO_INCREMENT,
   `name` varchar(100) NOT NULL,
   `target_amount` decimal(15,2) NOT NULL,
   `current_amount` decimal(15,2) DEFAULT '0.00',
   `deadline` date DEFAULT NULL,
   `icon` varchar(100) DEFAULT NULL,
   `color` varchar(20) DEFAULT '#04D1C1',
   `status` enum('active','completed') DEFAULT 'active',
   `user_id` int NOT NULL,
   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (`id`),
   KEY `user_id` (`user_id`),
   CONSTRAINT `savings_goals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
 ) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

 CREATE TABLE `transactions` (
   `id` int NOT NULL AUTO_INCREMENT,
   `amount` decimal(15,2) NOT NULL,
   `type` enum('income','expense') NOT NULL,
   `transaction_date` datetime NOT NULL,
   `note` text,
   `user_id` int NOT NULL,
   `category_id` int NOT NULL,
   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   PRIMARY KEY (`id`),
   KEY `user_id` (`user_id`),
   KEY `category_id` (`category_id`),
   CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
   CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
 ) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

 CREATE TABLE `users` (
   `id` int NOT NULL AUTO_INCREMENT,
   `username` varchar(50) NOT NULL,
   `email` varchar(100) NOT NULL,
   `password` varchar(255) DEFAULT NULL,
   `full_name` varchar(100) NOT NULL,
   `date_of_birth` date NOT NULL,
   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   `avatar_url` varchar(255) DEFAULT NULL,
   `google_id` varchar(255) DEFAULT NULL,
   PRIMARY KEY (`id`),
   UNIQUE KEY `username` (`username`),
   UNIQUE KEY `email` (`email`),
   UNIQUE KEY `google_id` (`google_id`)
 ) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci