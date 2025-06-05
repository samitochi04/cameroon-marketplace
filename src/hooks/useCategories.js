import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useApi';
import { supabase } from '@/lib/supabase';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [hierarchicalCategories, setHierarchicalCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load all categories directly from Supabase
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      setCategories(data || []);
      setLoading(false);
      return data;
    } catch (error) {
      console.error('Failed to load categories:', error);
      setError(error.message);
      setLoading(false);
      return [];
    }
  }, []);

  // Get category by ID
  const getCategoryById = useCallback((categoryId) => {
    return categories.find(category => category.id === categoryId) || null;
  }, [categories]);

  // Get subcategories of a category
  const getSubcategories = useCallback((parentId) => {
    return categories.filter(category => category.parent_id === parentId);
  }, [categories]);

  // Transform flat category list to hierarchical structure
  const buildHierarchicalCategories = useCallback(() => {
    // First, find all top-level categories (no parent)
    const topLevel = categories.filter(cat => !cat.parent_id);
    
    // Recursive function to add children
    const addChildren = (category) => {
      const children = categories.filter(c => c.parent_id === category.id);
      return {
        ...category,
        children: children.length > 0 ? children.map(addChildren) : [],
      };
    };
    
    // Build the tree
    const hierarchical = topLevel.map(addChildren);
    setHierarchicalCategories(hierarchical);
    
    return hierarchical;
  }, [categories]);

  // Get path to a category (breadcrumbs)
  const getCategoryPath = useCallback((categoryId) => {
    const path = [];
    let currentId = categoryId;
    
    while (currentId) {
      const category = getCategoryById(currentId);
      if (!category) break;
      
      path.unshift(category);
      currentId = category.parent_id;
    }
    
    return path;
  }, [getCategoryById]);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Build hierarchical categories when flat list changes
  useEffect(() => {
    if (categories.length > 0) {
      buildHierarchicalCategories();
    }
  }, [categories, buildHierarchicalCategories]);

  return {
    categories,
    hierarchicalCategories,
    loading,
    error,
    loadCategories,
    getCategoryById,
    getSubcategories,
    getCategoryPath,
  };
};
