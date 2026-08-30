import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { 
  LayoutDashboard, 
  DollarSign, 
  PackageCheck, 
  ShoppingBag, 
  RefreshCw, 
  Layers, 
  Save, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Image, 
  FilePlus 
} from 'lucide-react';

const VendorDashboard = ({ currentLang }) => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [salesOrders, setSalesOrders] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sales');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 📝 ইনপুট বক্সের মান ট্র্যাকিং (টাইপ করার জন্য)
  const [editableStocks, setEditableStocks] = useState({});
  // 🔥 শুধুমাত্র যে প্রোডাক্টগুলোর স্টক পরিবর্তন করা হয়েছে, সেগুলোর আইডি ট্র্যাক রাখার জন্য
  const [modifiedProducts, setModifiedProducts] = useState(new Set());
  const [bulkSaving, setBulkSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    unit: '1 kg',
    subcategory: '',
  });
  const [productImage, setProductImage] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchVendorData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const authHeaders = { headers: { Authorization: token ? `Bearer ${token}` : '' } };
      
      const statsRes = await apiClient.get('orders/vendor/stats/', authHeaders);
      setStats(statsRes.data.analytics);
      setSalesOrders(statsRes.data.sales_orders || []);

      const productsRes = await apiClient.get('products/list/');
      const vendorProducts = (productsRes.data || []).filter(
        p => p.vendor === user?.id || p.vendor_id === user?.id
      );
      setMyProducts(vendorProducts);

      // ইনপুট স্টেট ইনিশিয়ালাইজেশন
      const initialStocks = {};
      vendorProducts.forEach(p => {
        initialStocks[p.id] = p.stock;
      });
      setEditableStocks(initialStocks);
      setModifiedProducts(new Set()); // পরিবর্তন ট্র্যাকার রিসেট
      const catRes = await apiClient.get('products/categories/');
      setCategories(catRes.data || []);
    } catch (err) {
      console.error("Vendor data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorData();
  }, []);

  // ইনপুট বক্সে টাইপ করার সময় হ্যান্ডেলার
  const handleInputChange = (productId, val, originalStock) => {
    const intVal = parseInt(val);
    const finalVal = isNaN(intVal) ? '' : intVal;

    setEditableStocks(prev => ({
      ...prev,
      [productId]: finalVal
    }));

    // যদি মান অরিজিনাল স্টক থেকে ভিন্ন হয়, তবে মডিফাইড সেটে অ্যাড হবে, মিললে রিমুভ হবে
    setModifiedProducts(prevSet => {
      const newSet = new Set(prevSet);
      if (finalVal !== originalStock && finalVal !== '') {
        newSet.add(productId);
      } else {
        newSet.delete(productId);
      }
      return newSet;
    });
  };

  // 🔥 একমাত্র মাস্টার কনফার্ম বাটন একশন (সব পরিবর্তিত স্টক একসাথে সেভ হবে)
  const handleBulkConfirmStock = async () => {
    if (modifiedProducts.size === 0) {
      alert(currentLang === 'en' ? "No stock changes to save!" : "পরিবর্তন করার মতো কোনো স্টক পাওয়া যায়নি!");
      return;
    }

    try {
      setBulkSaving(true);
      const token = localStorage.getItem('access_token');
      
      // পরিবর্তিত প্রতিটি প্রোডাক্টের জন্য এপিআই কল লুপ চালানো
      const promises = Array.from(modifiedProducts).map(productId => {
        const finalStock = editableStocks[productId];
        return apiClient.patch(
          `products/vendor/stock/${productId}/`, 
          { stock: finalStock }, 
          { headers: { Authorization: token ? `Bearer ${token}` : '' } }
        );
      });

      await Promise.all(promises);

      // সফলভাবে সেভ হলে ব্যাকএন্ড থেকে ফ্রেশ ডেটা রিলোড করা
      await fetchVendorData();
      alert(currentLang === 'en' ? "All stock changes saved successfully!" : "সব পণ্যের স্টক একসাথে সফলভাবে আপডেট হয়েছে!");
    } catch (err) {
      console.error("Bulk stock update error:", err);
      alert(currentLang === 'en' ? "Failed to save some stock updates!" : "স্টক সংরক্ষণ করতে সমস্যা হয়েছে!");
    } finally {
      setBulkSaving(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subcategory || !productImage) {
      alert(currentLang === 'en' ? "Please select a category and upload an image!" : "অনুগ্রহ করে ক্যাটাগরি এবং প্রোডাক্টের ছবি সিলেক্ট করুন!");
      return;
    }

    try {
      setFormLoading(true);
      const token = localStorage.getItem('access_token');
      const dataPayload = new FormData();
      dataPayload.append('name', formData.name);
      dataPayload.append('description', formData.description);
      dataPayload.append('price', formData.price);
      dataPayload.append('stock', formData.stock);
      dataPayload.append('unit', formData.unit);
      dataPayload.append('subcategory', formData.subcategory);
      dataPayload.append('image', productImage);

      await apiClient.post('products/products/', dataPayload, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'multipart/form-data'
        }
      });

      setIsModalOpen(false);
      setFormData({ name: '', description: '', price: '', stock: '', unit: '1 kg', subcategory: '' });
      setProductImage(null);
      await fetchVendorData();
      alert(currentLang === 'en' ? "Product published successfully!" : "প্রোডাক্টটি সফলভাবে আপনার দোকানে যুক্ত হয়েছে!");
    } catch (err) {
      console.error("Product creation error:", err);
      alert(currentLang === 'en' ? "Upload failed, check inputs." : "প্রোডাক্ট আপলোড ব্যর্থ হয়েছে, ইনপুটগুলো চেক করুন।");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5 select-none relative">
      {/* হেডার রিবন */}
      <div className="flex justify-between items-center">
        <h2 className="text-base font-black text-gray-800 flex items-center gap-1.5">
          <LayoutDashboard className="w-5 h-5 text-indigo-600" />
          {currentLang === 'en' ? 'Vendor Merchant Console' : 'ভেন্ডর মার্চেন্ট কনসোল'} 
          <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">@{user?.username}</span>
        </h2>
        <button 
          onClick={fetchVendorData}
          className="p-1.5 bg-white border text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition shadow-3xs flex items-center gap-1 text-xs font-bold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{currentLang === 'en' ? 'Refresh' : 'রিফ্রেশ'}</span>
        </button>
      </div>

      {/* অ্যানালিটিক্স গ্রিড */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-3xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">মোট বিক্রয় রেভিনিউ</span>
            <h3 className="text-xl sm:text-2xl font-black text-gray-800 tracking-tight">৳{stats?.total_revenue || 0}</h3>
          </div>
          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center shadow-3xs">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-3xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">বিক্রিত মোট পণ্য</span>
            <h3 className="text-xl sm:text-2xl font-black text-gray-800 tracking-tight">{stats?.total_items_sold || 0} টি</h3>
          </div>
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shadow-3xs">
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-3xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">মোট ইউনিক অর্ডার</span>
            <h3 className="text-xl sm:text-2xl font-black text-gray-800 tracking-tight">{stats?.total_orders_count || 0} টি</h3>
          </div>
          <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center shadow-3xs">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* নেভিগেশন ট্যাব */}
      <div className="flex items-center justify-between border-b border-gray-100 text-xs font-black">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('sales')}
            className={`pb-2 transition-all ${activeTab === 'sales' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {currentLang === 'en' ? 'Sales Ledger' : 'বিক্রয় খতিয়ান ফিড'}
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`pb-2 transition-all flex items-center gap-1 ${activeTab === 'inventory' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Layers className="w-3.5 h-3.5" />
            {currentLang === 'en' ? 'Inventory Stock Manager' : 'ইনভেন্টরি স্টক ম্যানেজার'}
          </button>
        </div>

        {activeTab === 'inventory' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mb-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black px-2.5 py-1.5 rounded-lg text-[11px] flex items-center gap-1 transition shadow-3xs"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>{currentLang === 'en' ? 'Add Product' : 'নতুন প্রোডাক্ট যোগ করুন'}</span>
          </button>
        )}
      </div>

      {/* ট্যাব ১: সেলস লেজার টেবিল */}
      {activeTab === 'sales' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-3xs overflow-hidden animate-fadeIn">
          <div className="overflow-x-auto">
            {salesOrders.length === 0 ? (
              <div className="text-center py-12 text-xs text-gray-400 font-medium">
                {currentLang === 'en' ? 'No sales records found yet.' : 'আপনার কোনো পণ্য এখনো বিক্রি হয়নি!'}
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/40 text-gray-400 uppercase tracking-wider font-black text-[10px] border-b border-gray-100">
                    <th className="px-4 py-2.5">Order ID</th>
                    <th className="px-4 py-2.5">Product Name</th>
                    <th className="px-4 py-2.5 text-center">Qty</th>
                    <th className="px-4 py-2.5 text-right">Unit Price</th>
                    <th className="px-4 py-2.5 text-right">Total Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-600 font-medium">
                  {salesOrders.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-bold text-gray-800">#ORD-{item.order || item.id}</td>
                      <td className="px-4 py-3">{item.product_name}</td>
                      <td className="px-4 py-3 text-center font-bold">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">৳{parseInt(item.price)}</td>
                      <td className="px-4 py-3 text-right font-black text-indigo-600">৳{parseInt(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ট্যাব ২: ইনভেন্টরি স্টক ম্যানেজার (একক মাস্টার কনফার্ম বাটন লেআউট) */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-3xs overflow-hidden">
            {myProducts.length === 0 ? (
              <div className="text-center py-12 text-xs text-gray-400 font-medium">
                {currentLang === 'en' ? 'No products uploaded yet.' : 'আপনার কোনো পণ্য আপলোড করা নেই!'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50/40 text-gray-400 uppercase tracking-wider font-black text-[10px] border-b border-gray-100">
                      <th className="px-4 py-2.5">Product</th>
                      <th className="px-4 py-2.5">Base Price</th>
                      <th className="px-4 py-2.5">Current Live Stock</th>
                      <th className="px-4 py-2.5 text-center">New Stock Input</th>
                      <th className="px-4 py-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-600 font-medium">
                    {myProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-bold text-gray-800">{product.name}</td>
                        <td className="px-4 py-3">৳{parseInt(product.price)} / {product.unit || '1 kg'}</td>
                        <td className="px-4 py-3 font-black text-indigo-600">{product.stock}</td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            min="0"
                            value={editableStocks[product.id] ?? ''}
                            onChange={(e) => handleInputChange(product.id, e.target.value, product.stock)}
                            className={`w-20 border px-2 py-1 rounded-lg text-center font-bold focus:outline-none focus:border-indigo-500 ${
                              modifiedProducts.has(product.id) ? 'border-amber-500 bg-amber-50 text-amber-900' : 'bg-gray-50'
                            }`}
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          {product.stock === 0 ? (
                            <span className="inline-flex items-center gap-1 text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full text-[10px]">
                              <AlertTriangle className="w-3 h-3" /> Out of stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full text-[10px]">
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 🔥 মেগা একক মাস্টার কনফার্ম বাটন (টেবিলের ঠিক নিচে রাইট এলাইন্ড) */}
          {myProducts.length > 0 && (
            <div className="flex justify-end">
              <button
                type="button"
                disabled={bulkSaving || modifiedProducts.size === 0}
                onClick={handleBulkConfirmStock}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-black px-5 py-2.5 rounded-xl transition shadow-md flex items-center gap-2 text-xs uppercase tracking-wider"
              >
                <Save className="w-4 h-4" />
                {bulkSaving ? (
                  <span className="animate-pulse">{currentLang === 'en' ? 'Saving...' : 'সংরক্ষণ হচ্ছে...'}</span>
                ) : (
                  currentLang === 'en'
                    ? `Confirm All Changes (${modifiedProducts.size})`
                    : `সব পরিবর্তন নিশ্চিত করুন (${modifiedProducts.size})`
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* নতুন প্রোডাক্ট মডেল ফর্ম */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-black text-gray-800">
                {currentLang === 'en' ? 'Add New Product to Store' : 'দোকানে নতুন পণ্য যোগ করুন'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-gray-600 mb-1">পণ্যের নাম (Product Name) *</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 bg-gray-50/50"
                  placeholder="যেমন: ফ্রেশ মিনিকেট চাল"
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1">ক্যাটাগরি সিলেক্ট করুন *</label>
                <select
                  required
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  className="w-full border px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 bg-gray-50/50 font-medium text-gray-700"
                >
                  <option value="">-- একটি সাব-ক্যাটাগরি বেছে নিন --</option>
                  {Array.isArray(categories) && categories.map((cat) => (
                    cat.subcategories && cat.subcategories.length > 0 ? (
                      <optgroup key={cat.id || cat.name} label={cat.name}>
                        {cat.subcategories.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name}
                          </option>
                        ))}
                      </optgroup>
                    ) : (
                      /* যদি কোনো ক্যাটাগরির ভেতরে আলাদা subcategories না থেকে নিজেই ক্যাটাগরি হয় */
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    )
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-600 mb-1">মূল্য (৳) *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full border px-2 py-2 rounded-xl focus:outline-none focus:border-indigo-500 bg-gray-50/50"
                    placeholder="৳"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">স্টক সংখ্যা *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full border px-2 py-2 rounded-xl focus:outline-none focus:border-indigo-500 bg-gray-50/50"
                    placeholder="Qty"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">ইউনিট টাইপ</label>
                  <input
                    required
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full border px-2 py-2 rounded-xl focus:outline-none focus:border-indigo-500 bg-gray-50/50"
                    placeholder="1 kg / 1 pc"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 mb-1">বিবরণ (Description)</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border px-3 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500 bg-gray-50/50 resize-none"
                  placeholder="পণ্যটি সম্পর্কে কিছু লিখুন..."
                ></textarea>
              </div>

              <div>
                <label className="block text-gray-600 mb-1">পণ্যের ছবি (Product Image) *</label>
                <div className="relative border-2 border-dashed rounded-xl p-3 text-center bg-gray-50/50 hover:bg-gray-50 transition cursor-pointer flex items-center justify-center gap-2">
                  <Image className="w-4 h-4 text-gray-400" />
                  <input
                    required
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProductImage(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <span className="text-gray-500 text-xs">
                    {productImage ? productImage.name : (currentLang === 'en' ? 'Click to upload image' : 'ক্লিক করে ছবি আপলোড করুন')}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl transition disabled:opacity-50"
                >
                  {formLoading ? (
                    <span className="animate-pulse">{currentLang === 'en' ? 'Uploading...' : 'আপলোড হচ্ছে...'}</span>
                  ) : (
                    currentLang === 'en' ? 'Publish Product' : 'পণ্যটি স্টোরে লাইভ করুন'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;