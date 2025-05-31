import { useState, useCallback, useEffect } from 'react';
import { useGet } from './useApi';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [hierarchicalCategories, setHierarchicalCategories] = useState([]);
  const { data, loading, error, fetchData: fetchCategories } = useGet('/api/categories');

  // Load all categories
  const loadCategories = useCallback(async () => {
    try {
      const response = await fetchCategories();
      setCategories(response.data.categories || []);
      return response.data.categories;
    } catch (error) {
      console.error('Failed to load categories:', error);
      return [];
    }
  }, [fetchCategories]);

  // Get category by ID
  const getCategoryById = useCallback((categoryId) => {
    return categories.find(category => category.id === categoryId) || null;
  }, [categories]);

  // Get subcategories of a category
  const getSubcategories = useCallback((parentId) => {
    return categories.filter(category => category.parentId === parentId);
  }, [categories]);

  // Transform flat category list to hierarchical structure
  const buildHierarchicalCategories = useCallback(() => {
    // First, find all top-level categories (no parent)
    const topLevel = categories.filter(cat => !cat.parentId);
    
    // Recursive function to add children
    const addChildren = (category) => {
      const children = categories.filter(c => c.parentId === category.id);
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
      currentId = category.parentId;
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
