import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/productApi';
import { getCategories, createCategory } from '../api/categoryApi';
import './Products.css';
import { SkeletonTableRow } from '../components/Skeleton';

function Products() {
  const [products, setProducts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: '',
    purchasePrice: '',
    sellingPrice: '',
    currentStock: '',
    minStock: '',
  });

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditId(null);
    setFormData({
      name: '',
      sku: '',
      categoryId: '',
      purchasePrice: '',
      sellingPrice: '',
      currentStock: '',
      minStock: '',
    });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditId(product.id);
    setFormData({
      name: product.name,
      sku: product.sku,
      categoryId: product.categoryId,
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      currentStock: product.currentStock,
      minStock: product.minStock,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateProduct(editId, formData);
      } else {
        await createProduct(formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      fetchData();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="dashboard-layout">
     <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-main">
        <Navbar title="Products" onMenuClick={() => setSidebarOpen(true)} />

        <div className="dashboard-content">
          <div className="page-header">
            <div>
              <h2>All Products</h2>
              <p>{products.length} products in inventory</p>
            </div>
            <button className="btn-primary" onClick={openAddModal}>
              <Plus size={18} />
              Add Product
            </button>
          </div>

         <div className="table-card">
            {loading ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Purchase Price</th>
                    <th>Selling Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <SkeletonTableRow key={index} columns={8} />
                  ))}
                </tbody>
              </table>
            ) : products.length === 0 ? (
              <p className="empty-state">No products yet. Click "Add Product" to create one.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Purchase Price</th>
                    <th>Selling Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.sku}</td>
                      <td>{p.category?.name}</td>
                      <td>₹{p.purchasePrice}</td>
                      <td>₹{p.sellingPrice}</td>
                      <td>
                        <span className={p.currentStock <= p.minStock ? 'stock-low' : 'stock-ok'}>
                          {p.currentStock}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${p.isActive ? 'badge-active' : 'badge-inactive'}`}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="icon-btn" onClick={() => openEditModal(p)}>
                            <Pencil size={16} />
                          </button>
                          <button className="icon-btn delete" onClick={() => handleDelete(p.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Edit Product' : 'Add Product'}</h3>
              <X size={20} className="close-icon" onClick={() => setShowModal(false)} />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name</label>
                  <input name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>SKU</label>
                  <input name="sku" value={formData.sku} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label>Category</label>
                <select name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Purchase Price</label>
                  <input type="number" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Selling Price</label>
                  <input type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Current Stock</label>
                  <input type="number" name="currentStock" value={formData.currentStock} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Min Stock Alert</label>
                  <input type="number" name="minStock" value={formData.minStock} onChange={handleChange} />
                </div>
              </div>

              <button type="submit" className="btn-primary full-width">
                {editId ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;