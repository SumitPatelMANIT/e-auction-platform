import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, Gavel, Package, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';

import { apiFetch } from '../../utils/api';

const Login = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.role || 'BIDDER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { setCurrentUser } = useAuction();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // Save token
      localStorage.setItem('token', data.token);

      // Set user in context
      setCurrentUser({
        id: data.user_id,
        name: `${data.first_name} ${data.last_name}`,
        role: data.role,
        email: data.email,
        phone: data.phone,
        dob: data.dob,
        photoUrl: data.photoUrl,
        address: {
          houseNo: data.house_no,
          street: data.street,
          city: data.city,
          state: data.state,
          country: data.country,
          pin: data.pin_code,
        }
      });

      // Navigate based on role
      if (data.role === 'ADMIN') navigate('/admin/dashboard');
      else if (data.role === 'BIDDER') navigate('/bidder/catalogue');
      else if (data.role === 'SELLER') navigate('/seller/inventory');
      
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'BIDDER', label: 'Bidder', icon: Gavel },
    { id: 'SELLER', label: 'Seller', icon: Package },
    { id: 'ADMIN', label: 'Admin', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center animate-fade-in-up py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 flex flex-col md:flex-row">
        
        {/* Left Side - Graphic/Branding */}
        <div className="hidden md:flex md:w-5/12 bg-slate-900 relative items-center justify-center p-12 overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?q=80&w=1470" 
              alt="Premium Auction" 
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-teal-900/90 mix-blend-multiply"></div>
          </div>
          
          <div className="relative z-10 text-white space-y-6">
            <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl backdrop-blur-md mb-4 border border-white/20 shadow-lg">
              <LogIn className="h-10 w-10 text-teal-300" />
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight">Welcome Back</h2>
            <p className="text-lg text-teal-100 leading-relaxed">
              Log in to access your dashboard, track your bids, and manage your premium assets.
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-7/12 p-8 sm:p-12">
          <div className="text-center md:text-left mb-8">
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Sign In</h3>
            <p className="mt-2 text-slate-500">Please enter your credentials to proceed.</p>
          </div>

          {/* Role Tabs for Prototype */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-900 mb-3">Login As:</label>
            <div className="flex space-x-2 p-1 bg-slate-100 rounded-xl">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center py-2.5 px-3 rounded-lg text-sm font-bold transition-all ${
                      isActive 
                        ? 'bg-white text-teal-700 shadow-sm border border-slate-200' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                  >
                    <Icon className={`h-4 w-4 mr-2 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-semibold flex items-start">
                <ShieldCheck className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 bg-white border border-slate-300 text-slate-900 rounded-xl p-3.5 focus:ring-teal-500 focus:border-teal-500 transition-colors shadow-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative rounded-xl shadow-sm mb-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 bg-white border border-slate-300 text-slate-900 rounded-xl p-3.5 focus:ring-teal-500 focus:border-teal-500 transition-colors shadow-sm"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm font-semibold text-teal-600 hover:text-teal-500 transition-colors">Forgot password?</Link>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-teal-600  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all transform hover:-translate-y-0.5 mt-8"
            >
              Sign In
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-teal-600 hover:text-teal-500 transition-colors">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
