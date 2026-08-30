import { useState, useEffect, useContext } from 'react';
import apiClient from '../api/apiClient';
import { Layers, Plus, ChevronRight, List } from 'lucide-react';
import { CartContext } from '../context/CartContext';

const Home = ({ selectedCategory, selectedSubCategory, setSelectedCategory, setSelectedSubCategory, currentLang, searchQuery }) => {
  const { addToCart } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const [productRes, categoryRes] = await Promise.all([
          apiClient.get('store/products/'),
          apiClient.get('store/categories/')
        ]);
        setProducts(productRes.data || []);
        setCategories(categoryRes.data || []);
      } catch (error) {
        console.error("Error loading store data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStoreData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const activeCategoryObj = categories.find(c => c.id === selectedCategory);
  const activeSubCategoryObj = activeCategoryObj?.subcategories?.find(s => s.id === selectedSubCategory);

  return (
    <div className="space-y-4 select-none">
      
            {/* 🧭 ১. টপ হেডার: ক্যাটাগরি ও সাব-ক্যাটাগরি বাবল লিস্ট (মোবাইল টেক্সট ব্রেকিং ফিক্সড) */}
      <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-3xs space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => { setSelectedCategory(null); setSelectedSubCategory(null); }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all flex-shrink-0 whitespace-nowrap ${
              !selectedCategory ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-gray-50 text-gray-600 border-gray-200'
            }`}
          >
            <List className="w-3 h-3" />
            <span>{currentLang === 'en' ? 'All' : 'সব'}</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setSelectedSubCategory(null); }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all flex-shrink-0 whitespace-nowrap ${
                selectedCategory === cat.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {cat.image && <img src={`${cat.image}`} alt="" className="w-4 h-4 object-contain rounded-full" />}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {selectedCategory && activeCategoryObj?.subcategories?.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-gray-50 pt-1.5 animate-fadeIn">
            <button
              onClick={() => setSelectedSubCategory(null)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold border flex-shrink-0 whitespace-nowrap ${
                !selectedSubCategory ? 'bg-orange-500 text-white border-orange-500 shadow-xs' : 'bg-gray-50 text-gray-500 border-gray-200'
              }`}
            >
              {currentLang === 'en' ? 'All Sub-items' : 'সব উপ-ক্যাটাগরি'}
            </button>
            {activeCategoryObj.subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubCategory(sub.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all flex-shrink-0 whitespace-nowrap ${
                  selectedSubCategory === sub.id ? 'bg-orange-500 text-white border-orange-500 shadow-xs' : 'bg-gray-50 text-gray-500 border-gray-200'
                }`}
              >
                {sub.image && <img src={`${sub.image}`} alt="" className="w-3.5 h-3.5 object-cover rounded" />}
                <span>{sub.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>


      {/* 🧭 ২. আল্ট্রা-স্লিম স্পেস-সেভিং ব্রেডক্রাম্ব */}
      <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded-md border border-gray-100 shadow-3xs w-fit">
        <span>{currentLang === 'en' ? 'Home' : 'হোম'}</span>
        {selectedCategory && activeCategoryObj && (
          <>
            <ChevronRight className="w-2.5 h-2.5 text-gray-300" />
            <span className="text-gray-600">{activeCategoryObj.name}</span>
          </>
        )}
        {selectedSubCategory && activeSubCategoryObj && (
          <>
            <ChevronRight className="w-2.5 h-2.5 text-gray-300" />
            <span className="text-indigo-600">{activeSubCategoryObj.name}</span>
          </>
        )}
      </div>

      {/* 🚀 ৩. ফিল্টার অথবা সার্চ একটিভ থাকলে ভিউ */}
      {(selectedCategory || selectedSubCategory || searchQuery) ? (
        <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-3xs">
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-1.5 p-1">
            {products
              .filter(p => {
                const matchesCat = selectedCategory ? p.category_id === selectedCategory : true;
                const matchesSub = selectedSubCategory ? p.subcategory === selectedSubCategory : true;
                const text = searchQuery?.toLowerCase() || '';
                return matchesCat && matchesSub && (text ? (
                  p.name.toLowerCase().includes(text) || p.subcategory_name?.toLowerCase().includes(text)
                ) : true);
              })
              .map(product => <TextProductRow key={product.id} product={product} addToCart={addToCart} />)
            }
          </div>
        </div>
      ) : (
        /* 🔥 ৪. মূল পার্ট: আপনার ডেমো স্ট্রাকচার অনুযায়ী ক্লিন রো লুপ (ইমেজ থাম্বনেইল সহ) */
        <div className="space-y-4">
          {categories.map((category) => {
            const hasProductsInCat = products.some(p => p.category_id === category.id);
            if (!hasProductsInCat) return null;

            return (
              <div key={category.id} className="bg-white p-2.5 rounded-xl border border-gray-100/80 shadow-3xs space-y-2">
                
                {/* ──── প্যারেন্ট ক্যাটাগরি হেডার ──── */}
                <div className="text-xs font-black text-gray-800 tracking-tight uppercase border-b border-gray-100 pb-1 flex items-center gap-1.5">
                  <span className="w-1 h-3 bg-indigo-600 rounded-full"></span>
                  {category.name}
                </div>

                {/* ──── সাব-ক্যাটাগরি এবং তার প্রোডাক্ট সমূহের লুপ ──── */}
                <div className="space-y-3 pl-1">
                  {category.subcategories?.map((sub) => {
                    const subProducts = products.filter(p => p.subcategory === sub.id);
                    if (subProducts.length === 0) return null;

                    return (
                      <div key={sub.id} className="space-y-1.5">
                        <div className="text-[11px] font-bold text-indigo-600">
                          {sub.name}
                        </div>

                        {/* 📱 মোবাইলে ৩-কলাম স্লিম রো গ্রিড */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-1.5 py-0.5 border-b border-gray-50/50 pb-2">
                          {subProducts.map((product) => (
                            <TextProductRow key={product.id} product={product} addToCart={addToCart} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* 📄 ফাইনাল অপ্টিমাইজড চালডাল পণ্য কার্ড (নামের নিচে কম স্পেস + বড় প্লাস বাটন + বড় প্রাইস ফন্ট) */
const TextProductRow = ({ product, addToCart }) => {
  return (
    <div className="flex flex-col justify-between min-h-[114px] bg-white p-1 rounded-xl border border-gray-100/80 hover:shadow-2xs transition duration-150 select-none relative group w-full">
      
      {/* 📦 ক. ইমেজ এবং বড় আকৃতির ভাসমান প্লাস বাটন [ + ] */}
      <div className="relative w-full aspect-square bg-gray-50/40 rounded-lg flex items-center justify-center p-0.5 overflow-hidden">
        {product.image ? (
          <img 
            src={product.image.startsWith('http') ? product.image : `${product.image}`} 
            alt="" 
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <div className="text-[8px] text-gray-300">No Image</div>
        )}

        {/* 🌟 প্লাস বাটনের সাইজ আরেকটু বাড়িয়ে w-9 h-9 এবং আইকন w-5.5 করা হলো */}
        <button 
          onClick={async (e) => { 
            e.stopPropagation(); 
            await addToCart(product.id); 
          }} 
          className="absolute bottom-1 right-1 bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white w-9 h-9 rounded-full flex items-center justify-center border border-indigo-100 shadow-md transition-all duration-150 transform active:scale-90 z-10"
          title="Add to Cart"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
        </button>
      </div>
      
      {/* 📄  খ. পণ্য বিবরণ সেকশন */}
      <div className="mt-1 flex flex-col justify-between flex-grow">
        
        {/* ১. পণ্যের নাম (নামের নিচের মার্জিন কমিয়ে mb-0.5 করা হলো) */}
        <h5 className="font-bold text-gray-700 text-[12px] leading-tight line-clamp-2 h-6 sm:h-7 overflow-hidden mb-0 px-1">
          {product.name}
        </h5>

        {/* ২. মডার্ন ও প্রিমিয়াম ডিজাইন করা বটম ইনফো স্ট্রিপ (নিচে প্যাডিং pb-0.5 যুক্ত) */}
        <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold border-t border-gray-100/80 pt-1 pb-1 mt-auto px-1">
          {/* বামপাশে বড় আকৃতির প্রিমিয়াম প্রাইস ট্যাগ (ফন্ট সাইজ বাড়ানো হয়েছে) */}
          <div className="flex items-baseline leading-none text-gray-900">
            <span className="text-[10px] font-bold text-indigo-500 mr-0.5">৳</span>
            <span className="text-xs sm:text-base font-black tracking-tight">{parseInt(product.price)}</span>
          </div>

          {/* ডানপাশে স্লিম ও ক্লিন ডাইনামিক পরিমাপ বা ইউনিট */}
          <span className="bg-gray-100/80 px-1 py-0.5 rounded-md text-[8.5px] text-gray-600 max-w-[50%] truncate font-semibold border border-gray-200/20">
            {product.unit || '1 kg'}
          </span>
        </div>

      </div>

    </div>
  );
};



export default Home;
