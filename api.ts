import { Employee, SaleEntry } from './types';

const API_BASE_URL = '/.netlify/functions';

// دالة مساعدة لإرسال طلبات API
async function apiRequest<T>(endpoint: string, method: string = 'GET', data?: any): Promise<T> {
  const url = `${API_BASE_URL}/${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  if (response.status === 204) { // No Content for successful DELETE
    return {} as T;
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorBody.message || `HTTP error! status: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// ----------------------------------------------------------------
// Employee API Calls
// ----------------------------------------------------------------

export const getEmployees = () => apiRequest<Employee[]>('employees-api');

export const addEmployee = (employee: Omit<Employee, 'id'>) => apiRequest<Employee>('employees-api', 'POST', employee);

export const updateEmployee = (employee: Employee) => apiRequest<Employee>(`employees-api/${employee.id}`, 'PUT', employee);

export const deleteEmployee = (id: string) => apiRequest<void>(`employees-api/${id}`, 'DELETE');

// ----------------------------------------------------------------
// Sales API Calls
// ----------------------------------------------------------------

export const getSales = () => apiRequest<SaleEntry[]>('sales-api');

export const addSale = (sale: Omit<SaleEntry, 'id' | 'total'>) => apiRequest<SaleEntry>('sales-api', 'POST', sale);

export const updateSale = (sale: SaleEntry) => apiRequest<SaleEntry>(`sales-api/${sale.id}`, 'PUT', sale);

export const deleteSale = (id: string) => apiRequest<void>(`sales-api/${id}`, 'DELETE');

// ----------------------------------------------------------------
// Auth API Calls (Mocked for now, will use employee-api for login)
// ----------------------------------------------------------------

// سنقوم بتنفيذ منطق تسجيل الدخول مباشرة في EmployeeContext باستخدام getEmployees
// لأننا لا نملك وظيفة مصادقة منفصلة في الواجهة الخلفية حاليًا.
// في تطبيق حقيقي، يجب أن تكون هناك دالة login منفصلة في الواجهة الخلفية.
