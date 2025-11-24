
export interface SaleEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  networkNumber: number;
  mastercardAmount: number;
  madaAmount: number;
  visaAmount: number;
  gccAmount: number;
  total: number;
  employeeId: string;
}

export interface Employee {
  id: string;
  name: string;
  username: string;
  password_hash: string; // For simulation, plaintext is fine
  branch: 'فرع طويق' | 'فرع الحزم' | 'فرع عكاظ';
}