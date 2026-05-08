import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <Wallet className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">RentBridge</span>
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-sm font-medium text-gray-600 hover:text-black flex items-center gap-1">
                  <ShieldCheck size={18} /> Admin
                </Link>
              )}
              <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-black flex items-center gap-1">
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <button 
                onClick={onLogout}
                className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <Link 
              to="/auth" 
              className="px-5 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
