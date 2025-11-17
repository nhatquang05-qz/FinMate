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

INSERT INTO `users` (`id`, `username`, `email`, `password`, `full_name`, `date_of_birth`, `created_at`) VALUES
(1, 'admin', 'admin@admin.com', '$2b$10$dWadhBQe.kW9bUcg9QIhZuC8eQsZFc/tpTpRCVv5jyDxiGq37xl8G', 'Nguyễn Văn Admin 1', '1995-10-19', '2025-10-20 03:32:41'),
(8, 'phattran', 'phat@phat.com', '$2b$10$n5/.ahDLPkZVUG1eUheKg.L7wQ9vhseylkFMdAYsx4/DmguVXxXfu', 'Phat Tran', '2002-09-15', '2025-10-20 14:24:03');


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
('Bạn bè', 'expense', 'friends-icon', 1),
('Lãi tiết kiệm', 'income', 'piggy-bank-icon', 1);

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
(20000000.00, 'income',  '2025-09-01 08:30:00', 'Lương tháng 9', 1, 6),
(500000.00,  'income',  '2025-09-05 15:00:00', 'Phụ cấp đi lại', 1, 7),
(48000.00,   'expense', '2025-09-02 12:15:00', 'Cơm trưa', 1, 1),
(280000.00,  'expense', '2025-09-03 20:00:00', 'Đi xem phim CGV', 1, 1),
(70000.00,   'expense', '2025-09-04 07:45:00', 'Đổ xăng', 1, 2),
(150000.00,  'expense', '2025-09-06 18:00:00', 'Sửa xe', 1, 2),
(1250000.00, 'expense', '2025-09-08 16:30:00', 'Mua áo sơ mi và quần tây', 1, 3),
(65000.00,   'expense', '2025-09-10 12:30:00', 'Cơm gà xối mỡ', 1, 1),
(1200000.00, 'income',  '2025-09-12 11:00:00', 'Dạy thêm cuối tuần', 1, 8),
(85000.00,   'expense', '2025-09-15 09:00:00', 'Khám răng định kỳ', 1, 4),
(320000.00,  'expense', '2025-09-18 21:00:00', 'Mua sắm online trên Tiki', 1, 3),
(550000.00,  'expense', '2025-09-22 10:00:00', 'Đóng tiền khoá học online', 1, 5),
(450000.00,  'expense', '2025-09-25 14:00:00', 'Đi siêu thị Lotte Mart', 1, 1),
(25000.00,   'expense', '2025-09-28 17:45:00', 'Grab bike', 1, 2),
(500000.00,  'income',  '2025-10-05 16:00:00', 'Phụ cấp ăn trưa', 1, 7),
(62000.00,   'expense', '2025-10-02 12:20:00', 'Bún bò Huế', 1, 1),
(18000.00,   'expense', '2025-10-03 08:30:00', 'Gửi xe', 1, 2),
(990000.00,  'expense', '2025-10-06 19:30:00', 'Mua giày mới', 1, 3),
(78000.00,   'expense', '2025-10-08 12:00:00', 'Cơm tấm', 1, 1),
(750000.00,  'income',  '2025-10-10 22:00:00', 'Lãi cổ tức', 1, 10),
(250000.00,  'expense', '2025-10-12 11:30:00', 'Mua thuốc cho mẹ', 1, 4),
(1500000.00, 'expense', '2025-10-18 10:15:00', 'Đăng ký khoá học tiếng Anh', 1, 5),
(35000.00,   'expense', '2025-10-21 08:10:00', 'Cà phê sáng', 1, 1),
(60000.00,   'expense', '2025-10-24 12:00:00', 'Cơm niêu', 1, 1),
(80000.00,   'expense', '2025-10-26 17:30:00', 'Đổ xăng', 1, 2),
(500000.00,  'expense', '2025-10-30 19:45:00', 'Ăn lẩu Kichi Kichi', 1, 1),
(500000.00,  'income',  '2025-11-05 14:20:00', 'Phụ cấp điện thoại', 1, 7),
(3000000.00, 'income',  '2025-11-10 10:00:00', 'Thưởng nóng dự án ABC', 1, 9),
(88000.00,   'expense', '2025-11-06 12:00:00', 'Cơm sườn', 1, 1),
(45000.00,   'expense', '2025-11-07 18:30:00', 'Grab car', 1, 2),
(2500000.00, 'expense', '2025-11-09 20:15:00', 'Mua quà sinh nhật', 1, 3),
(95000.00,   'expense', '2025-11-11 12:05:00', 'Pizza Hut', 1, 1),
(300000.00,  'expense', '2025-11-12 16:00:00', 'Khám sức khoẻ tổng quát', 1, 4),
(1200000.00, 'income',  '2025-11-14 11:45:00', 'Viết bài freelance', 1, 8),
(600000.00,  'expense', '2025-11-15 09:30:00', 'Mua tài liệu học tập', 1, 5),
(15000.00,   'expense', '2025-11-16 10:00:00', 'Gửi xe tháng', 1, 2),
(30000.00,   'expense', '2025-11-17 08:00:00', 'Bánh mì và sữa', 1, 1),
(20000000.00, 'income',  '2025-08-01 09:00:00', 'Lương tháng 8', 1, 6),
(1500000.00,  'income',  '2025-08-05 18:30:00', 'Thưởng hoàn thành tốt dự án', 1, 9),
(52000.00,   'expense', '2025-08-02 12:00:00', 'Cơm trưa', 1, 1),
(75000.00,   'expense', '2025-08-02 20:00:00', 'Trà sữa với bạn bè', 1, 1),
(100000.00,  'expense', '2025-08-03 08:00:00', 'Đổ xăng', 1, 2),
(250000.00,  'expense', '2025-08-05 19:00:00', 'Ăn tối nhà hàng', 1, 1),
(1800000.00, 'expense', '2025-08-07 15:00:00', 'Mua tai nghe Sony mới', 1, 3),
(45000.00,   'expense', '2025-08-08 07:30:00', 'Cà phê', 1, 1),
(800000.00,  'income',  '2025-08-10 14:00:00', 'Thiết kế logo freelance', 1, 8),
(200000.00,  'expense', '2025-08-12 11:00:00', 'Khám da liễu', 1, 4),
(45000.00,   'expense', '2025-08-14 12:30:00', 'Bún chả', 1, 1),
(180000.00,  'expense', '2025-08-20 10:00:00', 'Mua sách chuyên ngành', 1, 5),
(70000.00,   'expense', '2025-08-22 18:00:00', 'Grab car đi họp', 1, 2),
(300000.00,  'expense', '2025-08-25 13:00:00', 'Đi siêu thị', 1, 1),
(1500000.00, 'expense', '2025-08-28 19:30:00', 'Mua vé máy bay Tết', 1, 2),
(350000.00,  'income',  '2025-08-30 16:00:00', 'Lãi tiết kiệm', 1, 10),
(20000000.00, 'income',  '2025-09-01 09:05:00', 'Lương tháng 9', 1, 6),
(500000.00,  'income',  '2025-09-04 10:00:00', 'Phụ cấp trách nhiệm', 1, 7),
(950000.00,  'expense', '2025-09-09 11:00:00', 'Săn sale 9/9 mua quần áo', 1, 3),
(68000.00,   'expense', '2025-09-10 12:00:00', 'Phở bò', 1, 1),
(25000.00,   'expense', '2025-09-11 17:30:00', 'Gửi xe', 1, 2),
(120000.00,  'expense', '2025-09-13 16:00:00', 'Mua thuốc đau đầu', 1, 4),
(1500000.00, 'income',  '2025-09-15 14:00:00', 'Dịch thuật tài liệu', 1, 8),
(420000.00,  'expense', '2025-09-17 19:00:00', 'Ăn buffer lẩu', 1, 1),
(80000.00,   'expense', '2025-09-20 08:30:00', 'Đổ xăng', 1, 2),
(350000.00,  'expense', '2025-09-24 10:00:00', 'Mua đồ dùng học tập cho em', 1, 5),
(55000.00,   'expense', '2025-09-26 12:10:00', 'Cơm gà', 1, 1),
(180000.00,  'expense', '2025-09-29 20:30:00', NULL, 1, 1),
(1800000.00, 'income',  '2025-11-18 19:00:00', 'Bán lại điện thoại cũ', 1, 8);

    -- "username": "admin",
    -- "password": "password123"
-- Thêm côt avatar_url vào bảng users để lưu trữ URL ảnh đại diện người dùng
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255);
