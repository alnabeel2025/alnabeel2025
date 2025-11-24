
import React, { createContext, useReducer, useContext, ReactNode, useEffect, useState } from 'react';
import type { Employee } from '../types';
import { getEmployees, addEmployee, updateEmployee as apiUpdateEmployee, deleteEmployee as apiDeleteEmployee } from '../api';

type EmployeeState = {
  employees: Employee[];
  currentUser: Employee | null;
};

type Action =
  | { type: 'LOGIN'; payload: Employee }
  | { type: 'LOGOUT' }
  | { type: 'ADD_EMPLOYEE'; payload: Employee }
  | { type: 'UPDATE_EMPLOYEE'; payload: Employee }
  | { type: 'DELETE_EMPLOYEE'; payload: { id: string } }
  | { type: 'SET_EMPLOYEES'; payload: Employee[] }; // إضافة نوع جديد لتعيين الموظفين بعد الجلب

// البيانات الوهمية تم استبدالها باستدعاءات API
    { id: 'emp1', name: 'أحمد محمود', username: 'ahmed', password_hash: '123', branch: 'فرع طويق' },
    { id: 'emp2', name: 'فاطمة علي', username: 'fatima', password_hash: '456', branch: 'فرع الحزم' },
    { id: 'emp3', name: 'همدان', username: '101', password_hash: '123', branch: 'فرع عكاظ' },
];

const initialState: EmployeeState = {
  employees: [], // تبدأ فارغة
  currentUser: null,
};

const employeeReducer = (state: EmployeeState, action: Action): EmployeeState => {
  // ... (بقية الدالة)
  switch (action.type) {
    case 'SET_EMPLOYEES':
      return { ...state, employees: action.payload };
  switch (action.type) {
    case 'LOGIN':
      return { ...state, currentUser: action.payload };
    case 'LOGOUT':
      return { ...state, currentUser: null };
    case 'ADD_EMPLOYEE':
      return { ...state, employees: [...state.employees, action.payload] };
    case 'UPDATE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.map(emp =>
          emp.id === action.payload.id ? action.payload : emp
        ),
      };
    case 'DELETE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.filter(emp => emp.id !== action.payload.id),
      };
    default:
      return state;
  }
};

const EmployeeContext = createContext<{
  state: EmployeeState;
  login: (username: string, password_hash: string) => Promise<boolean>; // تغيير نوع الإرجاع إلى Promise<boolean>
  logout: () => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>; // تغيير نوع الإرجاع إلى Promise<void>
  updateEmployee: (employee: Employee) => Promise<void>; // تغيير نوع الإرجاع إلى Promise<void>
  deleteEmployee: (id: string) => Promise<void>; // تغيير نوع الإرجاع إلى Promise<void>
} | undefined>(undefined);
  state: EmployeeState;
  login: (username: string, password_hash: string) => boolean;
  logout: () => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => void;
} | undefined>(undefined);

export const EmployeeProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(employeeReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);

  // جلب الموظفين عند تحميل التطبيق
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const employees = await getEmployees();
        dispatch({ type: 'SET_EMPLOYEES', payload: employees });
      } catch (error) {
        console.error("Failed to fetch employees:", error);
        // يمكن إضافة معالجة خطأ هنا
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const login = async (username: string, password_hash: string): Promise<boolean> => {
    // بما أننا لا نستخدم تشفيرًا لكلمة المرور في الواجهة الخلفية حاليًا، سنقوم بالمطابقة محليًا
    // بعد جلب جميع الموظفين. في تطبيق حقيقي، يجب أن يتم هذا في الواجهة الخلفية.
    const user = state.employees.find(
      emp => emp.username === username && emp.password_hash === password_hash
    );
    if (user) {
      dispatch({ type: 'LOGIN', payload: user });
      return true;
    }
    return false;
  };

  const logout = () => dispatch({ type: 'LOGOUT' });

  const addEmployee = async (employee: Omit<Employee, 'id'>) => {
    try {
      const newEmployee = await addEmployee(employee);
      dispatch({ type: 'ADD_EMPLOYEE', payload: newEmployee });
    } catch (error) {
      console.error("Failed to add employee:", error);
      throw error;
    }
  };

  const updateEmployee = async (employee: Employee) => {
    try {
      const updatedEmployee = await apiUpdateEmployee(employee);
      dispatch({ type: 'UPDATE_EMPLOYEE', payload: updatedEmployee });
    } catch (error) {
      console.error("Failed to update employee:", error);
      throw error;
    }
  };
  
  const deleteEmployee = async (id: string) => {
    try {
      await apiDeleteEmployee(id);
      dispatch({ type: 'DELETE_EMPLOYEE', payload: { id } });
    } catch (error) {
      console.error("Failed to delete employee:", error);
      throw error;
    }
  };

  if (isLoading) {
    // يمكن عرض شاشة تحميل هنا
    return <div>Loading Employees...</div>;
  }

  return (
    <EmployeeContext.Provider value={{ state, login, logout, addEmployee, updateEmployee, deleteEmployee }}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployees = () => {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error('useEmployees must be used within an EmployeeProvider');
  }
  return context;
};