export interface Category {
    id: number;
    name: string;
    type: 'income' | 'expense';
    icon: string;
    budget_limit?: number;
}

export interface NewTransaction {
    amount: number;
    type: 'income' | 'expense';
    transaction_date: string;
    note?: string;
    category_id: number;
}
export interface Transaction {
    id: number;
    amount: number;
    type: 'income' | 'expense';
    transaction_date: string;
    note: string | null;
    category_name: string;
    category_icon: string;
}
export interface SummaryData {
    totalIncome: number;
    totalExpense: number;
    balance: number;
}
export interface PieChartData {
    categoryName: string;
    totalAmount: number;
}
export interface CategoryStats {
    categoryId: number;
    categoryName: string;
    totalAmount: number;
    transactionCount: number;
    budgetLimit?: number;
}
