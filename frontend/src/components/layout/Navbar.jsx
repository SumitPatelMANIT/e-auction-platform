import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Gavel, User, LogOut, LayoutDashboard, Settings, Search, Package } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for conditional tailwind classes
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Navbar = ({ userRole, setUserRole }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getNavLinks = () => {
    switch (userRole) {
      case 'ADMIN':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Lifecycle Manager', path: '/admin/lifecycle', icon: Settings },
        ];
      case 'BIDDER':
        return [
          { name: 'Catalogue', path: '/bidder/catalogue', icon: Search },
          { name: 'My Bids', path: '/bidder/my-bids', icon: Gavel },
        ];
      case 'SELLER':
        return [
          { name: 'My Inventory', path: '/seller/inventory', icon: Package },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  const handleLoginClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const el = document.getElementById('roles');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById('roles');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex flex-shrink-0 items-center gap-2 group">
              <img src="/logo.png" alt="E-Auction Logo" className="h-10 object-contain" />
              <span className="font-bold text-xl tracking-tight text-slate-900 hidden sm:block">
                E-Auction
              </span>
            </Link>
            
            {/* Main Navigation Links */}
            <div className="hidden sm:ml-10 sm:flex sm:space-x-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      "inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                      isActive
                        ? "bg-teal-50 text-teal-700 shadow-[0_0_15px_rgba(13,148,136,0.1)]"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 mr-2.5 transition-colors duration-300", isActive ? "text-teal-600" : "text-slate-400")} />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">


            {userRole !== 'GUEST' ? (
              <div className="flex items-center gap-2 ml-2 pl-4 border-l border-slate-200">
                <Link to="/profile" className="p-2 text-slate-500 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-100">
                  <User className="h-5 w-5" />
                </Link>
                <button 
                  onClick={() => setUserRole('GUEST')}
                  className="p-2 text-slate-500 hover:text-pink-600 transition-colors rounded-xl hover:bg-pink-50"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-2 pl-4 border-l border-slate-200">
                <a href="#roles" onClick={handleLoginClick} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                  Log in
                </a>
                <Link to="/register" className="text-sm font-medium bg-teal-600 text-white px-5 py-2 rounded-xl hover:shadow-[0_0_20px_rgba(13,148,136,0.4)] transition-all duration-300">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

