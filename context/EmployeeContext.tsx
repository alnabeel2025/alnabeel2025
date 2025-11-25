import React, { createContext, useReducer, useContext, ReactNode, useEffect, useState } from 'react';
import type { Employee } from '../types';
import { 
  getEmployees, 
  addEmployee as apiAddEmployee, 
  updateEmployee as apiUpdateEmployee, 
  deleteEmployee as apiDeleteEmployee 
} from '../api';

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
  | { type: 'SET_EMPLOYEES'; payload: Employee[] };

const initialState: EmployeeState = {
  employees: [],
  currentUser: null,
};

const employeeReducer = (state: EmployeeState, action: Action): EmployeeState => {
  switch (action.type) {
    case 'SET_EMPLOYEES':
      return { ...state, employees: action.payload };

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
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (employee: Employee) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
} | undefined>(undefined);

export const EmployeeProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(employeeReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const employees = await getEmployees();
        dispatch({ type: 'SET_EMPLOYEES', payload: employees });
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const user = state.employees.find(
      emp => emp.username === username && emp.password_hash === password
    );
    if (user) {
      dispatch({ type: 'LOGIN', payload: user });
      return true;
    }
    return false;
  };

  const logout = () => dispatch({ type: 'LOGOUT' });

  const addEmployee = async (employee: Omit<Employee, 'id'>) => {
    const newEmployee = await apiAddEmployee(employee);
    dispatch({ type: 'ADD_EMPLOYEE', payload: newEmployee });
  };

  const updateEmployee = async (employee: Employee) => {
    const updated = await apiUpdateEmployee(employee);
    dispatch({ type: 'UPDATE_EMPLOYEE', payload: updated });
  };

  const deleteEmployee = async (id: string) => {
    await apiDeleteEmployee(id);
    dispatch({ type: 'DELETE_EMPLOYEE', payload: { id } });
  };

  if (isLoading) return <div>Loading Employees...</div>;

  return (
    <EmployeeContext.Provider value={{ state, login, logout, addEmployee, updateEmployee, deleteEmployee }}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployees = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('useEmployees must be used within an EmployeeProvider');
  }
  return context;
};
