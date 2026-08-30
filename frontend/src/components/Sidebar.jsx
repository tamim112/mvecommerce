import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { ChevronDown, ChevronRight, Grid, Layers } from 'lucide-react';

const Sidebar = ({ onSelectSubCategory, onSelectCategory, selectedCategory, selectedSubCategory, currentLang, closeMobileSidebar }) => {
  const [categories, setCategories] = useState([]);
  const [openCategoryId, setOpenCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchSidebarCategories = async () => {
      try {
        // রেন্ডার ও লোকাল হোস্টে ডাবল স্ল্যাশ এড়াতে পাথ ফিক্স
        const res = await apiClient.get('store/categories/');
        setCategories(res.data || []);
      } catch (err) {
        console.error("Sidebar loading error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSidebarCategories();
  }, []);

  const handleCategoryClick = (catId, hasSubcategories) => {
    if (location.pathname !== '/') navigate('/');
    setOpenCategoryId(openCategoryId === catId ? null : catId);
    if (onSelectCategory) onSelectCategory(catId);

    // মোবাইলের জন্য: সাবক্যাটাগরি না থাকলে অটো ক্লোজ
    if (window.innerWidth < 768 && !hasSubcategories && closeMobileSidebar) {
      closeMobileSidebar();
    }
  };

  const handleSubCategoryClick = (subId) => {
    if (location.pathname !== '/') navigate('/');
    if (onSelectSubCategory) onSelectSubCategory(subId);
    if (window.innerWidth < 768 && closeMobileSidebar) {
      closeMobileSidebar();
    }
  };

  if (loading) {
    return (
      <div className="p-2 space-y-1">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-6 bg-gray-100 rounded-md animate-pulse w-full"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-1.5 space-y-0.5 select-none overflow-y-auto h-full overflow-x-hidden scrollbar-none bg-white">
      <div className="px-2 py-1 text-[9px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
        <Layers className="w-2.5 h-3" /> 
        <span>{currentLang === 'en' ? 'Categories' : 'পণ্য ক্যাটাগরি'}</span>
      </div>

      {/* সব কালেকশন বাটন */}
      <button
        onClick={() => {
          if (location.pathname !== '/') navigate('/');
          if (onSelectCategory) onSelectCategory(null);
          if (onSelectSubCategory) onSelectSubCategory(null);
          if (window.innerWidth < 768 && closeMobileSidebar) closeMobileSidebar();
        }}
        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold transition text-left ${
          !selectedCategory && !selectedSubCategory ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Grid className="w-3.5 h-3.5" />
        <span>{currentLang === 'en' ? 'All Collections' : 'সব কালেকশন'}</span>
      </button>

      {/* 🔥 ডাইনামিক নেসটেড ক্যাটাগরি ও সাব-ক্যাটাগরি লিস্ট */}
      {categories.map((cat) => {
        const hasSub = cat.subcategories && cat.subcategories.length > 0;
        const isParentActive = selectedCategory === cat.id;
        const isOpen = openCategoryId === cat.id || isParentActive;
        
        return (
          <div key={cat.id} className="space-y-0.5">
            {/* প্যারেন্ট ক্যাটাগরি আইটেম */}
            <button
              onClick={() => handleCategoryClick(cat.id, hasSub)}
              className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium transition text-left ${
                isParentActive ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2 max-w-[85%]">
                {cat.image ? (
                  <img src={cat.image.startsWith('http') ? cat.image : `${cat.image}`} alt="" className="w-4 h-4 object-cover rounded" />
                ) : (
                  <div className="w-4 h-4 bg-gray-100 rounded"></div>
                )}
                <span className="truncate">{cat.name}</span>
              </div>
              {hasSub && (
                isOpen ? <ChevronDown className="w-3 h-3 text-indigo-600" /> : <ChevronRight className="w-3 h-3 text-gray-400" />
              )}
            </button>

            {/* 🏷️ চাইল্ড সাব-ক্যাটাগরি ড্রপডাউন লিস্ট */}
            {isOpen && hasSub && (
              <div className="pl-4 pr-1 py-0.5 space-y-0.5 border-l border-dashed border-gray-200 ml-4">
                {cat.subcategories.map((sub) => {
                  const isSubActive = selectedSubCategory === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => handleSubCategoryClick(sub.id)}
                      className={`w-full text-left px-2 py-1 text-[11px] rounded-md transition flex items-center gap-1.5 ${
                        isSubActive ? 'bg-orange-500 text-white font-bold' : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'
                      }`}
                    >
                      {sub.image && (
                        <img src={sub.image.startsWith('http') ? sub.image : `${sub.image}`} alt="" className="w-3 h-3 object-cover rounded" />
                      )}
                      <span className="truncate">{sub.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Sidebar;
