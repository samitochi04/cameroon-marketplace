import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, PlusCircle, Edit, Trash, AlertCircle, ChevronRight, ChevronDown } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CategoryModal } from "@/components/admin/modals/CategoryModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";

export const CategoriesPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});

  // Get admin methods from hook
  const { 
    getCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    loading 
  } = useAdmin();
  
  // State for categories data
  const [categories, setCategories] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  // Load categories
  const loadCategories = async () => {
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
      filterCategories(categoriesData, searchQuery);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Filter categories based on search query
  const filterCategories = (categoriesData, query) => {
    if (!query) {
      // Show only top-level categories when no search query
      const topLevel = categoriesData.filter(category => !category.parentId);
      setFilteredCategories(topLevel);
    } else {
      // Show all categories that match search query
      const filtered = categoriesData.filter(category => 
        category.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCategories(filtered);
      
      // Expand parent categories of matched children
      const parentIds = new Set();
      filtered.forEach(category => {
        if (category.parentId) {
          let currentParent = categoriesData.find(c => c.id === category.parentId);
          while (currentParent) {
            parentIds.add(currentParent.id);
            currentParent = currentParent.parentId 
              ? categoriesData.find(c => c.id === currentParent.parentId)
              : null;
          }
        }
      });
      
      // Set expanded state
      const newExpandedState = {};
      parentIds.forEach(id => {
        newExpandedState[id] = true;
      });
      setExpandedCategories({...expandedCategories, ...newExpandedState});
    }
  };

  // Handle search input change
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterCategories(categories, query);
  };

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Create new category
  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setIsCreating(true);
    setIsModalOpen(true);
  };

  // Edit category
  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setIsCreating(false);
    setIsModalOpen(true);
  };

  // Delete category
  const handleDeleteClick = (category) => {
    setSelectedCategory(category);
    setIsConfirmDialogOpen(true);
  };

  // Confirm category deletion
  const handleConfirmDelete = async () => {
    try {
      await deleteCategory(selectedCategory.id);
      loadCategories();
      setIsConfirmDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  // Handle category save from modal
  const handleCategorySave = async (categoryData) => {
    try {
      if (isCreating) {
        await createCategory(categoryData);
      } else {
        await updateCategory(selectedCategory.id, categoryData);
      }
      loadCategories();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save category:", error);
    }
  };

  // Get child categories for a parent
  const getChildCategories = (parentId) => {
    return categories.filter(category => category.parentId === parentId);
  };

  // Recursive function to render category tree
  const renderCategoryTree = (category, level = 0) => {
    const children = getChildCategories(category.id);
    const isExpanded = expandedCategories[category.id];
    
    return (
      <div key={category.id} className="border-b border-gray-100 last:border-b-0">
        <div 
          className={`flex justify-between items-center py-3 px-4 hover:bg-gray-50 ${level > 0 ? 'pl-' + (4 + level * 6) : ''}`}
        >
          <div className="flex items-center">
            {children.length > 0 && (
              <button 
                onClick={() => toggleCategory(category.id)} 
                className="mr-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </button>
            )}
            
            <div className="flex items-center">
              <span className="font-medium text-gray-900">{category.name}</span>
              {category.isActive === false && (
                <Badge variant="secondary" className="ml-2">{t("inactive")}</Badge>
              )}
              {!category.parentId && (
                <Badge variant="primary" className="ml-2">{t("root")}</Badge>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleEditCategory(category)}
              aria-label={t("edit")}
              title={t("edit")}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDeleteClick(category)}
              aria-label={t("delete")}
              title={t("delete")}
              className="text-red-600 hover:text-red-800"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {isExpanded && children.length > 0 && (
          <div className="border-t border-gray-50">
            {children.map(child => renderCategoryTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t("manage_categories")}</h1>
          <p className="text-gray-500">{t("manage_categories_description")}</p>
        </div>
        <Button
          onClick={handleCreateCategory}
          leftIcon={PlusCircle}
          variant="primary"
        >
          {t("add_category")}
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <Input
          placeholder={t("search_categories")}
          value={searchQuery}
          onChange={handleSearch}
          leftIcon={Search}
        />
      </Card>

      {/* Categories List */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {searchQuery ? t("no_categories_found") : t("no_categories_yet")}
            </h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              {searchQuery 
                ? t("no_categories_with_search", { search: searchQuery })
                : t("no_categories_description")}
            </p>
            
            <Button
              onClick={handleCreateCategory}
              leftIcon={PlusCircle}
              variant="primary"
            >
              {t("create_first_category")}
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredCategories.map(category => renderCategoryTree(category))}
          </div>
        )}
      </Card>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCategorySave}
        category={selectedCategory}
        categories={categories}
        isCreating={isCreating}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t("delete_category_title")}
        message={t("delete_category_confirmation", { name: selectedCategory?.name })}
        confirmText={t("delete")}
        confirmVariant="danger"
      />
    </div>
  );
};
