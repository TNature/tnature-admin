import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Categories
      const { data: catData, error: catError } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (catError) throw catError;
      setCategories(catData || []);

      // Fetch Products with category details
      const { data: prodData, error: prodError } = await supabase
        .from("products")
        .select(`
          *,
          categories (
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (prodError) throw prodError;

      // Transform data for compatibility with existing components
      const transformedProducts = (prodData || []).map(p => ({
        ...p,
        category: p.categories?.name || "Uncategorized"
      }));

      setProducts(transformedProducts);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const value = {
    products,
    categories,
    loading,
    refreshData: fetchData
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
