import * as SQLite from 'expo-sqlite';

// Định nghĩa các kiểu dữ liệu để sử dụng trong ứng dụng
export type User = {
  id: number;
  email: string;
};

export type Transaction = {
  id: number;
  userId: number;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  note?: string;
};

const DATABASE_NAME = 'finmate.db';

// Mở CSDL bằng API mới nhất.
// Thao tác này trả về một đối tượng database với các phương thức async hiện đại.
const db = SQLite.openDatabaseSync(DATABASE_NAME);

// Hàm khởi tạo CSDL và các bảng
export const initDatabase = async () => {
  // Bật foreign key (nên làm)
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Câu lệnh tạo bảng users
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `);

  // Câu lệnh tạo bảng transactions
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      note TEXT,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  
  console.log("Database and tables initialized successfully using the new expo-sqlite API!");
};

// Export thẳng đối tượng db để các file khác có thể sử dụng
export { db };