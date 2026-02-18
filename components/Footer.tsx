
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <i className="fas fa-bolt text-xl"></i>
              </div>
              <span className="text-2xl font-black tracking-tighter">ELECTRA</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Experience the future of electronics shopping. Curated selection of premium gadgets with high-performance standards.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition"><i className="fab fa-twitter"></i></a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition"><i className="fab fa-instagram"></i></a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition"><i className="fab fa-linkedin"></i></a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6">Shop</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-blue-500 transition">Smartphones</a></li>
              <li><a href="#" className="hover:text-blue-500 transition">Laptops</a></li>
              <li><a href="#" className="hover:text-blue-500 transition">Audio Gear</a></li>
              <li><a href="#" className="hover:text-blue-500 transition">Smart TV</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6">Support</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-blue-500 transition">Help Center</a></li>
              <li><a href="#" className="hover:text-blue-500 transition">Track Order</a></li>
              <li><a href="#" className="hover:text-blue-500 transition">Returns</a></li>
              <li><a href="#" className="hover:text-blue-500 transition">Shipping Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6">Newsletter</h4>
            <p className="text-xs text-gray-400 mb-4">Get the latest drops and exclusive tech deals.</p>
            <div className="flex">
              <input type="email" placeholder="Email address" className="bg-gray-800 border-none rounded-l-xl py-3 px-4 w-full focus:ring-1 focus:ring-blue-600 text-sm" />
              <button className="bg-blue-600 rounded-r-xl px-4 hover:bg-blue-700 transition"><i className="fas fa-paper-plane"></i></button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 font-medium">
          <p>© 2024 Electra Electronics. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
