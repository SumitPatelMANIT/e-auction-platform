import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Zap, Trophy, Gavel, ArrowRight, LayoutDashboard, Package, Search } from 'lucide-react';
import { useAuction } from '../../context/AuctionContext';

const Home = () => {
  const { setUserRole } = useAuction();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    navigate('/login', { state: { role } });
  };

  const features = [
    {
      name: 'Real-time Bidding',
      description: 'Experience the thrill of live auctions with instant bid updates and milliseconds-latency synchronization.',
      icon: Zap,
      color: 'text-amber-500',
      bgColor: 'bg-amber-100 border-amber-200'
    },
    {
      name: 'Secure Transactions',
      description: 'Enterprise-grade security ensures every bid, item listing, and user profile is completely protected.',
      icon: Shield,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-100 border-emerald-200'
    },
    {
      name: 'Exclusive Inventory',
      description: 'Discover rare, authenticated, and high-value items curated by our expert administration team.',
      icon: Trophy,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-100 border-cyan-200'
    }
  ];

  const roles = [
    {
      id: 'BIDDER',
      title: 'Bidder',
      description: 'Browse the catalogue and place bids on exclusive items.',
      icon: Search,
      gradient: 'bg-cyan-500'
    },
    {
      id: 'SELLER',
      title: 'Seller',
      description: 'List your valuable items and track their auction performance.',
      icon: Package,
      gradient: 'bg-teal-500'
    },
    {
      id: 'ADMIN',
      title: 'Administrator',
      description: 'Manage the auction lifecycle, schedule events, and view system analytics.',
      icon: LayoutDashboard,
      gradient: 'bg-emerald-500'
    }
  ];

  return (
    <div className="relative overflow-hidden pt-16 pb-32 space-y-32">
      {/* Background Decorators */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-teal-300/30 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 text-center animate-fade-in-up">
        <div className="inline-flex items-center px-4 py-2 rounded-full border border-teal-200 bg-teal-50 text-teal-700 text-sm font-semibold mb-8 backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-teal-500 mr-2 animate-pulse"></span>
          The Ultimate E-Auction Ecosystem
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-8">
          A Secure Platform For <br className="hidden md:block" />
          <span className="text-teal-600 animate-pulse-slow">
            Premium Assets
          </span>
        </h1>
        
        <p className="mt-4 max-w-3xl mx-auto text-xl text-slate-600 mb-12 leading-relaxed">
          E-Auction is a comprehensive platform designed for modern auctions. Whether you are liquidating enterprise assets, selling fine art, or hunting for rare collectibles, our platform provides a transparent, secure, and lightning-fast bidding experience.
        </p>
        
        <div className="flex justify-center">
          <button 
            onClick={() => {
              const el = document.getElementById('roles');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex justify-center items-center px-8 py-4 text-base font-bold rounded-2xl text-white bg-teal-600 hover:bg-teal-700 shadow-[0_0_20px_rgba(13,148,136,0.3)] hover:shadow-[0_0_30px_rgba(13,148,136,0.5)] transition-all duration-300 transform hover:-translate-y-1"
          >
            Select Your Role to Begin
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Role Selection / Login Section */}
      <div id="roles" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Access the Platform</h2>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto text-lg">Select your role below to simulate logging in and access your dedicated dashboard.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              className="group relative text-left glass-panel p-8 rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(20,184,166,0.15)]"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Hover Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              
              <div className={`inline-flex items-center justify-center p-4 rounded-2xl mb-6 bg-gradient-to-br ${role.gradient} shadow-lg`}>
                <role.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors">{role.title}</h3>
              <p className="text-slate-600 leading-relaxed mb-8">
                {role.description}
              </p>
              
              <div className="flex items-center text-sm font-bold text-teal-600 uppercase tracking-wider">
                Log in as {role.title}
                <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-2 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* About The Platform Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden bg-white/80">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-200/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">How It Works</h2>
              <div className="space-y-6">
                <div className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-teal-100 text-teal-600 font-bold border border-teal-200">1</div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold text-slate-900">Sellers List Items</h4>
                    <p className="mt-1 text-slate-600">Sellers draft detailed listings for their items, setting starting prices and uploading high-quality images.</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-cyan-100 text-cyan-600 font-bold border border-cyan-200">2</div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold text-slate-900">Admins Verify & Schedule</h4>
                    <p className="mt-1 text-slate-600">Our administrative team reviews all submissions to ensure authenticity, then schedules them for live auction blocks.</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-pink-100 text-pink-600 font-bold border border-pink-200">3</div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold text-slate-900">Bidders Compete</h4>
                    <p className="mt-1 text-slate-600">Once live, verified bidders can place incremental bids in real-time until the auction concludes.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {features.map((feature) => (
                <div key={feature.name} className={`p-6 rounded-2xl border bg-white ${feature.bgColor} flex items-start shadow-sm`}>
                  <feature.icon className={`h-8 w-8 flex-shrink-0 ${feature.color} mr-4`} />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{feature.name}</h3>
                    <p className="text-sm text-slate-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32 pt-12 border-t border-slate-200 text-center sm:text-left">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 justify-center sm:justify-start mb-4">
              <img src="/logo.png" alt="E-Auction Logo" className="h-8 object-contain" />
              <span className="font-bold text-xl tracking-tight text-slate-900">
                E-Auction
              </span>
            </Link>
            <p className="text-slate-600 text-sm max-w-sm mx-auto sm:mx-0">
              The premier destination for secure, real-time, and exclusive online auctions. Empowering collectors and sellers worldwide.
            </p>
          </div>
          
          <div>
            <h4 className="text-slate-900 font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="#" className="hover:text-teal-600 transition-colors">How it Works</a></li>
              <li><a href="#" className="hover:text-teal-600 transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-teal-600 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-teal-600 transition-colors">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-slate-900 font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="#" className="hover:text-teal-600 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-teal-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-teal-600 transition-colors">Auction Rules</a></li>
              <li><a href="#" className="hover:text-teal-600 transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-slate-200 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} E-Auction. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-teal-600 transition-colors">Twitter</a>
            <a href="#" className="hover:text-teal-600 transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-teal-600 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
