import React, {
  createContext,
  useReducer,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";

import type { SaleEntry } from "../types";
import {
  getSales,
  addSale as apiAddSale,
  updateSale as apiUpdateSale,
  deleteSale as apiDeleteSale,
} from "../api";

// ==========================
// Helper: Today's Date
// ==========================
const getTodaysDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ==========================
// Types
// ==========================
type SalesState = {
  sales: SaleEntry[];
};

type Action =
  | { type: "ADD_SALE"; payload: SaleEntry }
  | { type: "UPDATE_SALE"; payload: SaleEntry }
  | { type: "DELETE_SALE"; payload: { id: string } }
  | { type: "SET_SALES"; payload: SaleEntry[] };

const SalesContext = createContext<
  | {
      state: SalesState;
      addSale: (sale: Omit<SaleEntry, "id" | "total">) => Promise<void>;
      updateSale: (sale: SaleEntry) => Promise<void>;
      deleteSale: (id: string) => Promise<void>;
    }
  | undefined
>(undefined);

// ==========================
// Reducer
// ==========================
const initialState: SalesState = {
  sales: [],
};

const salesReducer = (state: SalesState, action: Action): SalesState => {
  switch (action.type) {
    case "SET_SALES":
      return { ...state, sales: action.payload };

    case "ADD_SALE":
      return { ...state, sales: [...state.sales, action.payload] };

    case "UPDATE_SALE":
      return {
        ...state,
        sales: state.sales.map((sale) =>
          sale.id === action.payload.id ? action.payload : sale
        ),
      };

    case "DELETE_SALE":
      return {
        ...state,
        sales: state.sales.filter((sale) => sale.id !== action.payload.id),
      };

    default:
      return state;
  }
};

// ==========================
// Provider
// ==========================
export const SalesProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(salesReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const sales = await getSales();
        dispatch({ type: "SET_SALES", payload: sales });
      } catch (error) {
        console.error("Failed to fetch sales:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSales();
  }, []);

  // Add
  const addSale = async (sale: Omit<SaleEntry, "id" | "total">) => {
    const newSale = await apiAddSale(sale);
    dispatch({ type: "ADD_SALE", payload: newSale });
  };

  // Update
  const updateSale = async (sale: SaleEntry) => {
    const updated = await apiUpdateSale(sale);
    dispatch({ type: "UPDATE_SALE", payload: updated });
  };

  // Delete
  const deleteSale = async (id: string) => {
    await apiDeleteSale(id);
    dispatch({ type: "DELETE_SALE", payload: { id } });
  };

  if (isLoading) return <div>Loading Sales...</div>;

  return (
    <SalesContext.Provider value={{ state, addSale, updateSale, deleteSale }}>
      {children}
    </SalesContext.Provider>
  );
};

// Hook
export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) throw new Error("useSales must be used within SalesProvider");
  return context;
};
