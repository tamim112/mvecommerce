import { Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';

const OrderSuccess = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center pt-12 max-w-md mx-auto px-4">
      <div className="bg-green-50 p-4 rounded-full border border-green-100 mb-4 animate-bounce">
        <CheckCircle className="w-16 h-16 text-green-500" />
      </div>
      
      <h2 className="text-2xl font-black text-gray-900 mb-2">অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!</h2>
      <p className="text-sm text-gray-500 mb-6">আমাদের সাথে কেনাকাটা করার জন্য ধন্যবাদ। খুব শীঘ্রই আমাদের একজন প্রতিনিধি আপনার সাথে যোগাযোগ করবেন।</p>

      <div className="w-full space-y-2">
        <Link to="/" className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-indigo-700 transition text-sm flex items-center justify-center gap-2">
          <ShoppingBag className="w-4 h-4" />
          <span>আরও কেনাকাটা করুন</span>
        </Link>

      </div>
    </div>
  );
};

export default OrderSuccess;
