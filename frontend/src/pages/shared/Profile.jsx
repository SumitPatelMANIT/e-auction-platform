import React, { useState } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { apiFetch } from '../../utils/api';
import { User, Mail, Phone, Calendar, MapPin, Building, Globe, Edit3, Shield, Star, Clock, X, Camera, Upload, Lock, CheckCircle, AlertTriangle } from 'lucide-react';

const Profile = () => {
  const { currentUser, bids, setCurrentUser } = useAuction();
  
  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

  // Password State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // If user somehow lands here without logging in (safeguard)
  if (!currentUser || currentUser.role === 'GUEST') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-slate-500 font-medium">Please log in to view your profile.</p>
      </div>
    );
  }

  // Calculate mock stats
  const userBids = bids ? bids.filter(b => b.bidderId === currentUser.id) : [];
  const totalBids = userBids.length;
  const activeAuctions = [...new Set(userBids.map(b => b.itemId))].length;

  // --- EDIT PROFILE LOGIC ---
  const handleOpenEdit = () => {
    setEditForm({
      photoUrl: currentUser?.photoUrl || '',
      phone: currentUser?.phone || '',
      address: {
        houseNo: currentUser?.address?.houseNo || '',
        street: currentUser?.address?.street || '',
        city: currentUser?.address?.city || '',
        state: currentUser?.address?.state || '',
        country: currentUser?.address?.country || '',
        pin: currentUser?.address?.pin || ''
      }
    });
    setIsEditing(true);
  };

  const handleEditChange = (field, value, isAddress = false) => {
    // Restrictions
    if (field === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    if (field === 'pin' && isAddress) {
      value = value.replace(/\D/g, '').slice(0, 6);
    }

    if (isAddress) {
      setEditForm(prev => ({ ...prev, address: { ...prev.address, [field]: value } }));
    } else {
      setEditForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleEditChange('photoUrl', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Save to backend
      await apiFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          phone: editForm.phone,
          address: editForm.address,
          photoUrl: editForm.photoUrl
        })
      });

      // Update local state
      setCurrentUser({
        ...currentUser,
        photoUrl: editForm.photoUrl,
        phone: editForm.phone,
        address: editForm.address
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Could set an error state here if UI supports it
    }
  };

  // --- PASSWORD LOGIC ---
  const handleOpenPasswordModal = () => {
    setPasswordForm({ current: '', new: '', confirm: '' });
    setPasswordError('');
    setPasswordSuccess(false);
    setIsChangingPassword(true);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      setPasswordError('All fields are required.');
      return;
    }

    if (passwordForm.new.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          current: passwordForm.current,
          new: passwordForm.new
        })
      });

      // Success
      setPasswordSuccess(true);
      setTimeout(() => {
        setIsChangingPassword(false);
      }, 2000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      
      {/* Hero Header */}
      <div className="glass-panel overflow-hidden border border-slate-200 shadow-sm rounded-3xl relative">
        <div className="h-32 sm:h-48 bg-teal-500 w-full relative">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
        </div>
        
        <div className="px-4 sm:px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end sm:space-x-6">
            <div className="relative -mt-16 sm:-mt-20">
              <div className="h-32 w-32 rounded-full border-4 border-white bg-slate-50 overflow-hidden shadow-lg flex items-center justify-center relative z-10">
                {currentUser.photoUrl ? (
                  <img src={currentUser.photoUrl} alt={currentUser.name} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-16 w-16 text-teal-300" />
                )}
              </div>
              <div className="absolute bottom-1 right-1 bg-emerald-500 border-2 border-white h-5 w-5 rounded-full shadow-sm z-20"></div>
            </div>
            
            <div className="mt-4 sm:mt-0 text-center sm:text-left flex-1 relative z-10 pb-2">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{currentUser.name}</h1>
              <div className="flex items-center justify-center sm:justify-start mt-2 space-x-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold bg-teal-100 text-teal-700 border border-teal-200 uppercase tracking-wider">
                  <Shield className="h-3.5 w-3.5 mr-1.5" />
                  {currentUser.role}
                </span>
                <span className="text-sm font-medium text-slate-500 flex items-center">
                  <MapPin className="h-4 w-4 mr-1.5" />
                  {currentUser.address?.city || 'Location N/A'}
                </span>
              </div>
            </div>

            <div className="mt-6 sm:mt-0 flex-shrink-0 relative z-10 pb-2">
              <button 
                onClick={handleOpenEdit}
                className="inline-flex items-center px-5 py-2.5 border border-slate-300 rounded-xl shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 hover:text-teal-600 transition-colors"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Personal Info & Address */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Personal Information */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
             
             <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center">
               <User className="h-5 w-5 mr-2.5 text-teal-500" />
               Personal Information
             </h3>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</span>
                  <div className="text-slate-900 font-semibold text-lg">{currentUser.name}</div>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Date of Birth</span>
                  <div className="text-slate-900 font-semibold flex items-center text-lg">
                    <Calendar className="h-4 w-4 mr-2 text-teal-400" />
                    {currentUser.dob ? new Date(currentUser.dob).toLocaleDateString() : 'Not provided'}
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</span>
                  <div className="text-slate-900 font-semibold flex items-center text-lg">
                    <Mail className="h-4 w-4 mr-2 text-teal-400" />
                    {currentUser.email}
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</span>
                  <div className="text-slate-900 font-semibold flex items-center text-lg">
                    <Phone className="h-4 w-4 mr-2 text-teal-400" />
                    {currentUser.phone || 'Not provided'}
                  </div>
                </div>
             </div>
          </div>

          {/* Address Information */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-50/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

             <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center">
               <Building className="h-5 w-5 mr-2.5 text-cyan-500" />
               Address Details
             </h3>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
                <div className="sm:col-span-2">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Street Address</span>
                  <div className="text-slate-900 font-semibold text-lg">
                    {currentUser.address?.houseNo ? `${currentUser.address.houseNo}, ` : ''}{currentUser.address?.street || 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">City</span>
                  <div className="text-slate-900 font-semibold text-lg">{currentUser.address?.city || 'N/A'}</div>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">State / Province</span>
                  <div className="text-slate-900 font-semibold text-lg">{currentUser.address?.state || 'N/A'}</div>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Country</span>
                  <div className="text-slate-900 font-semibold flex items-center text-lg">
                    <Globe className="h-4 w-4 mr-2 text-cyan-400" />
                    {currentUser.address?.country || 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">ZIP / Postal Code</span>
                  <div className="text-slate-900 font-semibold text-lg">{currentUser.address?.pin || 'N/A'}</div>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Stats & Security */}
        <div className="space-y-8">
          
          <div className="rounded-3xl p-8 border border-teal-200 shadow-md bg-teal-600 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl -translate-y-1/4 translate-x-1/4 pointer-events-none"></div>
            <h3 className="text-xl font-extrabold mb-8 relative z-10">Activity Snapshot</h3>
            
            <div className="space-y-8 relative z-10">
              <div>
                <span className="block text-teal-100 text-sm font-semibold uppercase tracking-wider mb-2">Total Bids Placed</span>
                <div className="text-5xl font-extrabold flex items-center">
                  {totalBids}
                  <Star className="h-8 w-8 ml-3 text-amber-300" />
                </div>
              </div>
              
              <div className="h-px bg-white/20 w-full"></div>
              
              <div>
                <span className="block text-teal-100 text-sm font-semibold uppercase tracking-wider mb-2">Active Auctions</span>
                <div className="text-5xl font-extrabold flex items-center">
                  {activeAuctions}
                  <Clock className="h-8 w-8 ml-3 text-emerald-300" />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-extrabold text-slate-900 mb-3">Security</h3>
            <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed">
              Your account is secured with standard encryption. Ensure you update your password regularly to prevent unauthorized access.
            </p>
            <button 
              onClick={handleOpenPasswordModal}
              className="w-full inline-flex justify-center items-center px-4 py-3 border border-slate-300 rounded-xl shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 hover:text-teal-600 transition-colors"
            >
              <Shield className="h-4 w-4 mr-2 text-slate-400" />
              Change Password
            </button>
          </div>
          
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && editForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditing(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 max-h-[90vh] flex flex-col animate-fade-in-up">
            
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-5 flex items-center justify-between z-20 rounded-t-3xl">
              <h2 className="text-xl font-extrabold text-slate-900">Edit Profile</h2>
              <button onClick={() => setIsEditing(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-8 space-y-8 overflow-y-auto">
              
              {/* Photo */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Profile Photo</label>
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {editForm.photoUrl ? (
                      <img src={editForm.photoUrl} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <Camera className="h-6 w-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      id="photo-upload"
                      className="hidden"
                    />
                    <label 
                      htmlFor="photo-upload" 
                      className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-xl shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </label>
                    <p className="mt-2 text-xs font-medium text-slate-500">JPG, PNG, or GIF. Local files only.</p>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                <input 
                  type="text" 
                  value={editForm.phone}
                  onChange={(e) => handleEditChange('phone', e.target.value)}
                  placeholder="10 digit number"
                  className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 block w-full p-3 font-medium transition-shadow"
                />
              </div>

              {/* Address */}
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-4 border-b border-slate-100 pb-2">Address Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">House No. / Building</label>
                    <input 
                      type="text" 
                      value={editForm.address.houseNo}
                      onChange={(e) => handleEditChange('houseNo', e.target.value, true)}
                      className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 block w-full p-3 font-medium transition-shadow"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Street</label>
                    <input 
                      type="text" 
                      value={editForm.address.street}
                      onChange={(e) => handleEditChange('street', e.target.value, true)}
                      className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 block w-full p-3 font-medium transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">City</label>
                    <input 
                      type="text" 
                      value={editForm.address.city}
                      onChange={(e) => handleEditChange('city', e.target.value, true)}
                      className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 block w-full p-3 font-medium transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">State / Province</label>
                    <input 
                      type="text" 
                      value={editForm.address.state}
                      onChange={(e) => handleEditChange('state', e.target.value, true)}
                      className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 block w-full p-3 font-medium transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Country</label>
                    <input 
                      type="text" 
                      value={editForm.address.country}
                      onChange={(e) => handleEditChange('country', e.target.value, true)}
                      className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 block w-full p-3 font-medium transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">PIN / Postal Code</label>
                    <input 
                      type="text" 
                      value={editForm.address.pin}
                      onChange={(e) => handleEditChange('pin', e.target.value, true)}
                      placeholder="6 digit PIN"
                      className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 block w-full p-3 font-medium transition-shadow"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end space-x-4 rounded-b-3xl">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-6 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProfile}
                className="px-6 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangingPassword && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !passwordSuccess && setIsChangingPassword(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 animate-fade-in-up overflow-hidden">
            
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-5 flex items-center justify-between z-20">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center">
                <Lock className="h-5 w-5 mr-2 text-teal-500" />
                Change Password
              </h2>
              {!passwordSuccess && (
                <button onClick={() => setIsChangingPassword(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            
            <div className="p-6">
              {passwordSuccess ? (
                <div className="py-8 flex flex-col items-center text-center animate-fade-in">
                  <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Password Updated!</h3>
                  <p className="text-sm text-slate-500">Your password has been changed successfully.</p>
                </div>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                  {passwordError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold rounded-xl flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      {passwordError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
                    <input 
                      type="password" 
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                      placeholder="Enter current password"
                      className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 block w-full p-3 font-medium transition-shadow"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                    <input 
                      type="password" 
                      value={passwordForm.new}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                      placeholder="Min. 8 characters"
                      className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 block w-full p-3 font-medium transition-shadow"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                      placeholder="Re-type new password"
                      className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 block w-full p-3 font-medium transition-shadow"
                    />
                  </div>
                  
                  <div className="pt-2">
                    <button 
                      type="submit"
                      className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
