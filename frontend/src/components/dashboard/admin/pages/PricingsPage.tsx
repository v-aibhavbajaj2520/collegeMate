import React, { useState, useEffect } from 'react';
import { 
  MdSearch, 
  MdAdd,
  MdEdit,
  MdDelete,
  MdAttachMoney,
  MdCategory
} from 'react-icons/md';
import ResponsiveTable from '../../shared/ResponsiveTable';
import api from '../../../../utils/api';

interface Category {
  id: string;
  name: string;
  pricePerSlot: number;
}

interface CategoryFormData {
  name: string;
  pricePerSlot: number;
}

const AdminPricingsPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    pricePerSlot: 0
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch categories from backend
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get<{ success: boolean; data: Category[] }>('/api/categories');
      if (response.data.success) {
        setCategories(response.data.data);
        setFilteredCategories(response.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  // Filter categories based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [searchTerm, categories]);

  const handleAddCategory = () => {
    setFormData({ name: '', pricePerSlot: 0 });
    setFormErrors({});
    setEditingCategory(null);
    setShowAddModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setFormData({
      name: category.name,
      pricePerSlot: category.pricePerSlot
    });
    setFormErrors({});
    setEditingCategory(category);
    setShowAddModal(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone if mentors are assigned to it.')) {
      return;
    }

    try {
      await api.delete(`/api/categories/${id}`);
      await fetchCategories();
    } catch (err: any) {
      console.error('Error deleting category:', err);
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);

    // Validation
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    }
    if (formData.pricePerSlot <= 0) {
      errors.pricePerSlot = 'Price must be greater than 0';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitting(false);
      return;
    }

    try {
      if (editingCategory) {
        // Update category
        await api.put(`/api/categories/${editingCategory.id}`, formData);
      } else {
        // Create category
        await api.post('/api/categories', formData);
      }
      await fetchCategories();
      setShowAddModal(false);
      setFormData({ name: '', pricePerSlot: 0 });
      setEditingCategory(null);
    } catch (err: any) {
      console.error('Error saving category:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save category';
      if (err.response?.data?.errors) {
        setFormErrors({ general: errorMessage });
      } else {
        setFormErrors({ general: errorMessage });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Pricings</h1>
          <p className="text-gray-600 mt-2">Set slot prices for different mentor categories</p>
        </div>
        <button 
          onClick={handleAddCategory}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MdAdd className="w-4 h-4 mr-2" />
          Add Pricing Plan
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <MdCategory className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Pricing Plans</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <MdAttachMoney className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Price per Slot</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{categories.length > 0 
                  ? (categories.reduce((sum, cat) => sum + cat.pricePerSlot, 0) / categories.length).toFixed(2)
                  : '0.00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search pricing plans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <ResponsiveTable>
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Pricing Plans</h2>
          <p className="text-gray-600 mt-1 text-sm">Manage pricing plans for mentor slots</p>
        </div>
        
        <table className="w-full divide-y divide-gray-200" style={{ minWidth: '600px' }}>
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price per Slot
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-3 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={3} className="px-4 py-3 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-3 text-center text-gray-500">
                  No pricing plans found
                </td>
              </tr>
            ) : (
              filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {category.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <MdAttachMoney className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-sm font-semibold text-gray-900">
                        ₹{category.pricePerSlot.toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <MdEdit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <MdDelete className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </ResponsiveTable>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingCategory ? 'Edit Pricing Plan' : 'Add New Pricing Plan'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {formErrors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {formErrors.general}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pricing Plan Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Engineering, Medical, Business"
                />
                {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price per Slot (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.pricePerSlot}
                  onChange={(e) => setFormData({ ...formData, pricePerSlot: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.pricePerSlot ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {formErrors.pricePerSlot && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.pricePerSlot}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">Price for a 30-minute slot</p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ name: '', pricePerSlot: 0 });
                    setFormErrors({});
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPricingsPage;

