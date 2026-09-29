import React from 'react';
import { useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/layout/Navbar';
import { useAuction } from './context/AuctionContext';

function App() {
  const { currentUser, setCurrentUser } = useAuction();
  const location = useLocation();
  const userRole = currentUser.role;

  const setUserRole = (role) => {
    setCurrentUser(prev => ({ ...prev, role }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar userRole={userRole} setUserRole={setUserRole} />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AppRoutes userRole={userRole} />
      </main>
    </div>
  );
}

export default App;
