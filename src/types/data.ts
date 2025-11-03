// Định nghĩa cấu trúc của một Category từ API
export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  icon: string; // Tên của icon (ví dụ: 'food-icon')
}

// Định nghĩa cấu trúc của một Transaction để gửi lên API
export interface NewTransaction {
  amount: number;
  type: 'income' | 'expense';
  transaction_date: string; // Định dạng ISO string 'YYYY-MM-DDTHH:mm:ss.sssZ'
  note?: string;
  category_id: number;
}