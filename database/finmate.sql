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
    icon VARCHAR(100),
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    amount DECIMAL(15, 2) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    transaction_date DATETIME NOT NULL,
    note TEXT,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

INSERT INTO categories (name, type, icon, user_id) VALUES
('Ăn uống', 'expense', 'food-icon', 1),
('Đi lại', 'expense', 'transport-icon', 1),
('Quần áo', 'expense', 'clothes-icon', 1),
('Y tế', 'expense', 'medicine-icon', 1),
('Giáo dục', 'expense', 'education-icon', 1),
('Lương', 'income', 'salary-icon', 1),
('Phụ cấp', 'income', 'subsidy-icon', 1),
('Việc phụ', 'income', 'part-time-icon', 1),
('Tiền thưởng', 'income', 'bonus-icon', 1),
('Đầu tư', 'income', 'investment-icon', 1);

INSERT INTO transactions (amount, type, transaction_date, note, user_id, category_id) VALUES
(20000000.00, 'income', '2025-11-01 09:00:00', 'Lương tháng 11, 2025', 1, 6),
(850000.00, 'income', '2025-10-28 18:00:00', 'Dạy thêm buổi tối', 1, 8),
(2500000.00, 'income', '2025-10-15 14:30:00', 'Thưởng dự án Quý 3', 1, 9),
(55000.00, 'expense', '2025-11-01 12:30:00', 'Cơm trưa văn phòng', 1, 1),
(350000.00, 'expense', '2025-11-03 19:00:00', 'Ăn tối với bạn bè', 1, 1),
(45000.00, 'expense', '2025-11-04 08:00:00', 'Cà phê Highlands', 1, 1),
(250000.00, 'expense', '2025-10-29 12:35:00', 'Đi siêu thị mua đồ ăn vặt', 1, 1),
(120000.00, 'expense', '2025-10-27 19:15:00', NULL, 1, 1),
(150000.00, 'expense', '2025-11-02 07:00:00', 'Đổ đầy bình xăng', 1, 2),
(45000.00, 'expense', '2025-11-03 17:00:00', 'Grab về nhà', 1, 2),
(300000.00, 'expense', '2025-10-25 09:00:00', 'Vé xe khách về quê', 1, 2),
(750000.00, 'expense', '2025-10-29 20:00:00', 'Mua áo khoác mới', 1, 3),
(120000.00, 'expense', '2025-11-02 11:00:00', 'Thuốc cảm', 1, 4),
(450000.00, 'expense', '2025-10-20 15:00:00', 'Mua sách React Native', 1, 5);

    -- "username": "admin",
    -- "password": "password123"