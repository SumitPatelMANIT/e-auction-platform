import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Shared Pages
import Home from '../pages/shared/Home';
import Login from '../pages/shared/Login';
import Register from '../pages/shared/Register';
import Profile from '../pages/shared/Profile';
import ForgotPassword from '../pages/shared/ForgotPassword';

// Admin Pages
import SystemDashboard from '../pages/admin/SystemDashboard';
import AuctionLifecycle from '../pages/admin/AuctionLifecycle';

// Bidder Pages
import CatalogueSearch from '../pages/bidder/CatalogueSearch';
import MyBidsDashboard from '../pages/bidder/MyBidsDashboard';

// Seller Pages
import InventoryDashboard from '../pages/seller/InventoryDashboard';

const AppRoutes = ({ userRole }) => {
  return (
    <Routes>
      {/* Public / Shared Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Protected Shared Routes */}
      {userRole !== 'GUEST' && (
        <Route path="/profile" element={<Profile />} />
      )}

      {/* Admin Routes */}
      {userRole === 'ADMIN' && (
        <>
          <Route path="/admin/dashboard" element={<SystemDashboard />} />
          <Route path="/admin/lifecycle" element={<AuctionLifecycle />} />
        </>
      )}

      {/* Bidder Routes */}
      {userRole === 'BIDDER' && (
        <>
          <Route path="/bidder/catalogue" element={<CatalogueSearch />} />
          <Route path="/bidder/my-bids" element={<MyBidsDashboard />} />
        </>
      )}

      {/* Seller Routes */}
      {userRole === 'SELLER' && (
        <>
          <Route path="/seller/inventory" element={<InventoryDashboard />} />
        </>
      )}

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
