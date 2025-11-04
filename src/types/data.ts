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
// Định nghĩa cấu trúc của một Transaction nhận từ API
export interface Transaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  transaction_date: string;
  note: string | null;
  category_name: string;
  category_icon: string;
}
// Định nghĩa cấu trúc của dữ liệu tóm tắt giao dịch
export interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
// Định nghĩa cấu trúc của dữ liệu biểu đồ tròn
export interface PieChartData {
    categoryName: string;
    totalAmount: number;
}