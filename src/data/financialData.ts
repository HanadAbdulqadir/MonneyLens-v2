export interface DailyEntry {
  date: string;
  earnings: number;
  petrol: number;
  food: number;
  other: number;
  netChange: number;
  balance: number;
}

export interface Transaction {
  date: string;
  category: string;
  amount: number;
  dailyEntryId: number;
  week: string;
}

export const dailyData: DailyEntry[] = [
  { date: "2025-09-20", earnings: 180, petrol: 20, food: 50, other: 0, netChange: 110, balance: 450 },
  { date: "2025-09-21", earnings: 180, petrol: 20, food: 0, other: 0, netChange: 160, balance: 610 },
  { date: "2025-09-22", earnings: 180, petrol: 20, food: 50, other: 0, netChange: 110, balance: 720 },
  { date: "2025-09-23", earnings: 180, petrol: 20, food: 0, other: 0, netChange: 160, balance: 880 },
  { date: "2025-09-24", earnings: 180, petrol: 20, food: 0, other: 0, netChange: 160, balance: 1040 },
  { date: "2025-09-25", earnings: 180, petrol: 20, food: 0, other: 0, netChange: 160, balance: 1200 },
  { date: "2025-09-26", earnings: 180, petrol: 20, food: 0, other: 240, netChange: -80, balance: 1120 },
  { date: "2025-09-27", earnings: 180, petrol: 20, food: 0, other: 15, netChange: 145, balance: 1265 },
  { date: "2025-09-28", earnings: 180, petrol: 20, food: 0, other: 990, netChange: -830, balance: 435 },
  { date: "2025-09-29", earnings: 180, petrol: 20, food: 0, other: 0, netChange: 160, balance: 595 },
  { date: "2025-09-30", earnings: 180, petrol: 20, food: 0, other: 0, netChange: 160, balance: 755 },
];

export const transactions: Transaction[] = [
  { date: "2025-09-20", category: "Petrol", amount: 20, dailyEntryId: 1, week: "W3" },
  { date: "2025-09-20", category: "Food", amount: 50, dailyEntryId: 1, week: "W3" },
  { date: "2025-09-20", category: "Earnings", amount: 180, dailyEntryId: 1, week: "W3" },
  { date: "2025-09-21", category: "Petrol", amount: 20, dailyEntryId: 2, week: "W3" },
  { date: "2025-09-21", category: "Earnings", amount: 180, dailyEntryId: 2, week: "W3" },
  { date: "2025-09-22", category: "Petrol", amount: 20, dailyEntryId: 3, week: "W3" },
  { date: "2025-09-22", category: "Food", amount: 50, dailyEntryId: 3, week: "W3" },
  { date: "2025-09-22", category: "Earnings", amount: 180, dailyEntryId: 3, week: "W3" },
  { date: "2025-09-23", category: "Petrol", amount: 20, dailyEntryId: 4, week: "W3" },
  { date: "2025-09-23", category: "Earnings", amount: 180, dailyEntryId: 4, week: "W3" },
  { date: "2025-09-24", category: "Petrol", amount: 20, dailyEntryId: 5, week: "W4" },
  { date: "2025-09-24", category: "Earnings", amount: 180, dailyEntryId: 5, week: "W4" },
  { date: "2025-09-25", category: "Petrol", amount: 20, dailyEntryId: 6, week: "W4" },
  { date: "2025-09-25", category: "Earnings", amount: 180, dailyEntryId: 6, week: "W4" },
  { date: "2025-09-26", category: "Petrol", amount: 20, dailyEntryId: 7, week: "W4" },
  { date: "2025-09-26", category: "Other", amount: 240, dailyEntryId: 7, week: "W4" },
  { date: "2025-09-26", category: "Earnings", amount: 180, dailyEntryId: 7, week: "W4" },
  { date: "2025-09-27", category: "Petrol", amount: 20, dailyEntryId: 8, week: "W4" },
  { date: "2025-09-27", category: "Other", amount: 15, dailyEntryId: 8, week: "W4" },
  { date: "2025-09-27", category: "Earnings", amount: 180, dailyEntryId: 8, week: "W4" },
  { date: "2025-09-28", category: "Petrol", amount: 20, dailyEntryId: 9, week: "W4" },
  { date: "2025-09-28", category: "Other", amount: 990, dailyEntryId: 9, week: "W4" },
  { date: "2025-09-28", category: "Earnings", amount: 180, dailyEntryId: 9, week: "W4" },
  { date: "2025-09-29", category: "Petrol", amount: 20, dailyEntryId: 10, week: "W4" },
  { date: "2025-09-29", category: "Earnings", amount: 180, dailyEntryId: 10, week: "W4" },
  { date: "2025-09-30", category: "Petrol", amount: 20, dailyEntryId: 11, week: "W4" },
  { date: "2025-09-30", category: "Earnings", amount: 180, dailyEntryId: 11, week: "W4" },
];

export const getCurrentBalance = () => {
  return dailyData[dailyData.length - 1]?.balance || 0;
};

export const getTodaysData = () => {
  const today = new Date().toISOString().split('T')[0];
  return dailyData.find(entry => entry.date === today) || dailyData[dailyData.length - 1];
};

export const getRecentTransactions = (limit = 10) => {
  return transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};

export const getCategoryTotals = () => {
  const totals = { Petrol: 0, Food: 0, Other: 0, Earnings: 0 };
  transactions.forEach(transaction => {
    if (transaction.category in totals) {
      totals[transaction.category as keyof typeof totals] += transaction.amount;
    }
  });
  return totals;
};