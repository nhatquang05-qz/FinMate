-- 1. Tạo cơ sở dữ liệu (database) mới
CREATE DATABASE finmate_db;

-- 2. Chọn cơ sở dữ liệu vừa tạo để làm việc
USE finmate_db;

-- 3. Tạo bảng users bên trong finmate_db
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    icon VARCHAR(100), -- Tùy chọn: để lưu tên icon
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    amount DECIMAL(15, 2) NOT NULL, -- Dùng DECIMAL cho tiền tệ để tránh sai số
    type ENUM('income', 'expense') NOT NULL,
    transaction_date DATETIME NOT NULL,
    note TEXT,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

INSERT INTO users (username, email, password, full_name, date_of_birth)
VALUES ('admin', 'admin@admin.com', '$2b$10$dWadhBQe.kW9bUcg9QIhZuC8eQsZFc/tpTpRCVv5jyDxiGq37xl8G', 'Nguyễn Văn Admin', '1995-10-20');

-- Thêm các danh mục CHI (Expense)
INSERT INTO categories (name, type, icon, user_id) VALUES
('Ăn uống', 'expense', 'food-icon', 1),
('Đi lại', 'expense', 'transport-icon', 1),
('Quần áo', 'expense', 'clothes-icon', 1),
('Y tế', 'expense', 'medicine-icon', 1),
('Giáo dục', 'expense', 'education-icon', 1);

-- Thêm các danh mục THU (Income)
INSERT INTO categories (name, type, icon, user_id) VALUES
('Lương', 'income', 'salary-icon', 1),
('Phụ cấp', 'income', 'subsidy-icon', 1),
('Việc phụ', 'income', 'part-time-icon', 1),
('Tiền thưởng', 'income', 'bonus-icon', 1),
('Đầu tư', 'income', 'investment-icon', 1);

    -- "username": "admin",
    -- "password": "password123"