import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  Folder,
  FolderPlus,
  AlertTriangle,
  X,
  Check
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';

const AdminCategories = () => {
  const { t } = useTranslation();
  const { get, post, put, del } = useApi();
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  
  // Form data
  const [categoryData, setCategoryData] = useState({
    name: '',
    description: '',
    parentId: '',
    imageUrl: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = categories.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories.filter(cat => !cat.parentId)); // Only root categories when not searching
    }
  }, [categories, searchTerm]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await get('/categories');
      const categoriesData = response.data || [];
      setCategories(categoriesData);
      setFilteredCategories(categoriesData.filter(cat => !cat.parentId));
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError(t('failed_to_load_categories'));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpandCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const getChildCategories = (parentId) => {
    return categories.filter(category => category.parentId === parentId);
  };

  const handleCreateCategory = () => {
    setCurrentCategory(null);
    setModalMode('create');
    setCategoryData({
      name: '',
      description: '',
      parentId: '',
      imageUrl: ''
    });
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category) => {
    setCurrentCategory(category);
    setModalMode('edit');
    setCategoryData({
      name: category.name,
      description: category.description || '',
      parentId: category.parentId || '',
      imageUrl: category.imageUrl || ''
    });
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = (category) => {
    setCurrentCategory(category);
    setShowDeleteModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    
    try {
      if (modalMode === 'create') {
        await post('/categories', categoryData);
      } else {
        await put(`/categories/${currentCategory.id}`, categoryData);
      }
      
      setShowCategoryModal(false);
      fetchCategories(); // Refresh the list
      
    } catch (error) {
      console.error('Error saving category:', error);
      setError(modalMode === 'create' ? t('failed_to_create_category') : t('failed_to_update_category'));
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await del(`/categories/${currentCategory.id}`);
      setShowDeleteModal(false);
      fetchCategories(); // Refresh the list
      
    } catch (error) {
      console.error('Error deleting category:', error);
      setError(t('failed_to_delete_category'));
    }
  };

  const renderCategoryTree = (parentId = null, level = 0) => {
    const categoriesToRender = parentId === null 
      ? filteredCategories 
      : getChildCategories(parentId);
    
    if (categoriesToRender.length === 0) return null;

    return (
      <ul className={`${level > 0 ? 'pl-6 border-l border-gray-200' : ''}`}>
        {categoriesToRender.map((category) => {
          const hasChildren = getChildCategories(category.id).length > 0;
          const isExpanded = expandedCategories[category.id];
          
          return (
            <li key={category.id} className="py-2">
              <div className="flex items-center justify-between hover:bg-gray-50 p-2 rounded">
                <div className="flex items-center">
                  {hasChildren ? (
                    <button
                      onClick={() => toggleExpandCategory(category.id)}
                      className="p-1 rounded-full hover:bg-gray-200 mr-2"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  ) : (
                    <span className="ml-6"></span>
                  )}
                  
                  <Folder className="h-5 w-5 text-gray-500 mr-2" />
                  
                  <div>
                    <div className="font-medium text-gray-900">{category.name}</div>
                    {category.description && (
                      <div className="text-sm text-gray-500">{category.description}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="p-1 rounded hover:bg-gray-200"
                    title={t('edit_category')}
                  >
                    <Edit className="h-4 w-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category)}
                    className="p-1 rounded hover:bg-gray-200"
                    title={t('delete_category')}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
              
              {hasChildren && isExpanded && renderCategoryTree(category.id, level + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('categories')}</h1>
        
        <button 
          onClick={handleCreateCategory}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('add_category')}
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder={t('search_categories')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        {categories.length > 0 ? (
          renderCategoryTree()
        ) : (
          <div className="text-center py-8">
            <FolderPlus className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <h3 className="text-lg font-medium text-gray-500 mb-1">{t('no_categories_yet')}</h3>
            <p className="text-gray-500 mb-4">{t('create_first_category')}</p>
            <button
              onClick={handleCreateCategory}
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('create_category')}
            </button>
          </div>
        )}
      </div>
      
      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {modalMode === 'create' ? t('add_new_category') : t('edit_category')}
            </h2>
            
            <form onSubmit={handleSubmitCategory}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('category_name')} *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={categoryData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('description')}
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={categoryData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('parent_category')}
                </label>
                <select
                  id="parentId"
                  name="parentId"
                  value={categoryData.parentId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="">{t('none')}</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('image_url')}
                </label>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  value={categoryData.imageUrl}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                >
                  {modalMode === 'create' ? t('create') : t('update')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && currentCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{t('confirm_delete')}</h2>
            <p className="mb-6">{t('delete_category_confirmation', { name: currentCategory.name })}</p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
