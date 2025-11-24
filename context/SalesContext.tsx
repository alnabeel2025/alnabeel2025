
import React, { createContext, useReducer, useContext, ReactNode, useEffect, useState } from 'react';
import type { SaleEntry } from '../types';
import { getSales, addSale as apiAddSale, updateSale as apiUpdateSale, deleteSale as apiDeleteSale } from '../api';

type SalesState = {
  sales: SaleEntry[];
};

type Action =
  | { type: 'ADD_SALE'; payload: SaleEntry }
  | { type: 'UPDATE_SALE'; payload: SaleEntry }
  | { type: 'DELETE_SALE'; payload: { id: string } }
  | { type: 'SET_SALES'; payload: SaleEntry[] };

const SalesContext = createContext<{
  state: SalesState;
  addSale: (sale: Omit<SaleEntry, 'id' | 'total'>) => Promise<void>;
  updateSale: (sale: SaleEntry) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
} | undefined>(undefined);

// Helper function to get today's date in YYYY-MM-DD format
// الدالة المساعدة getTodaysDate لم تعد ضرورية لأن التاريخ سيتم إدارته في الواجهة الخلفية أو سيتم إرساله من الواجهة الأمامية
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


// البيانات الوهمية تم استبدالها باستدعاءات API
    { id: '1', date: getTodaysDate(), networkNumber: 101, mastercardAmount: 150.50, madaAmount: 2000, visaAmount: 500, gccAmount: 120, total: 2770.50, employeeId: 'emp3' },
    { id: '2', date: getTodaysDate(), networkNumber: 102, mastercardAmount: 200.00, madaAmount: 1500, visaAmount: 300, gccAmount: 0, total: 2000.00, employeeId: 'emp1' },
    { id: '3', date: '2023-10-25', networkNumber: 101, mastercardAmount: 100.00, madaAmount: 1800, visaAmount: 450, gccAmount: 50, total: 2400.00, employeeId: 'emp3' }
];


const initialState: SalesState = {
  sales: [],
};

const salesReducer = (state: SalesState, action: Action): SalesState => {
  switch (action.type) {
    case 'SET_SALES':
      return { ...state, sales: action.payload };
  switch (action.type) {
    case 'ADD_SALE':
      return {
        ...state,
        sales: [...state.sales, action.payload],
      };
    case 'UPDATE_SALE':
      return {
        ...state,
        sales: state.sales.map(sale =>
          sale.id === action.payload.id ? action.payload : sale
        ),
      };
    case 'DELETE_SALE':
        return {
            ...state,
            sales: state.sales.filter(sale => sale.id !== action.payload.id),
        };
    default:
      return state;
  }
};

export const SalesProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(salesReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);

  // جلب المبيعات عند تحميل التطبيق
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const sales = await getSales();
        dispatch({ type: 'SET_SALES', payload: sales });
      } catch (error) {
        console.error("Failed to fetch sales:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSales();
  }, []);

  const addSale = async (sale: Omit<SaleEntry, 'id' | 'total'>) => {
    try {
      const newSale = await apiAddSale(sale);
      dispatch({ type: 'ADD_SALE', payload: newSale });
    } catch (error) {
      console.error("Failed to add sale:", error);
      throw error;
    }
  };
  
  const updateSale = async (sale: SaleEntry) => {
    try {
      const updatedSale = await apiUpdateSale(sale);
      dispatch({ type: 'UPDATE_SALE', payload: updatedSale });
    } catch (error) {
      console.error("Failed to update sale:", error);
      throw error;
    }
  };

  const deleteSale = async (id: string) => {
    try {
      await apiDeleteSale(id);
      dispatch({ type: 'DELETE_SALE', payload: { id } });
    } catch (error) {
      console.error("Failed to delete sale:", error);
      throw error;
    }
  };

  if (isLoading) {
    // يمكن عرض شاشة تحميل هنا
    return <div>Loading Sales...</div>;
  }

  return (
    <SalesContext.Provider value={{ state, addSale, updateSale, deleteSale }}>
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SalesContext);
  if (context === undefined) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};