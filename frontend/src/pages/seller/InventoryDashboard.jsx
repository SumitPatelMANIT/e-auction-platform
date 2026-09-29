import React, { useState, useMemo } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { Plus, Package, Send, Tag, Box, TrendingUp, Activity, Filter, X, Image as ImageIcon, Upload, Trash2, RefreshCw, Trophy } from 'lucide-react';

const InventoryDashboard = () => {
  const { currentUser, getSellerItems, addItem, deleteItem, submitItemForAuction, getHighestBid, refreshData, isLoading } = useAuction();
  const sellerItems = getSellerItems(currentUser.id);
  
  const [activeTab, setActiveTab] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', basePrice: '', imageUrl: '' });

  const stats = useMemo(() => {
    const totalItems = sellerItems.length;
    
    // Only calculate Total Value for sold/completed items using their final sold price
    const totalValue = sellerItems
      .filter(item => item.status === 'SOLD' || item.status === 'COMPLETED')
      .reduce((acc, item) => {
        const highestBid = getHighestBid(item.id);
        const finalPrice = highestBid ? highestBid.amount : item.basePrice;
        return acc + finalPrice;
      }, 0);

    const activeAuctions = sellerItems.filter(item => item.status === 'ACTIVE').length;
    return { totalItems, totalValue, activeAuctions };
  }, [sellerItems, getHighestBid]);

  const filteredItems = useMemo(() => {
    if (activeTab === 'ALL') return sellerItems;
    return sellerItems.filter(item => item.status === activeTab);
  }, [sellerItems, activeTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await addItem({ ...formData, basePrice: Number(formData.basePrice) });
      setIsModalOpen(false);
      setFormData({ title: '', description: '', basePrice: '', imageUrl: '' });
      alert('Item added successfully!');
    } catch (err) {
      alert('Failed to add item: ' + err.message);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteItem(itemId);
    } catch (err) {
      console.error(err);
      alert('Failed to delete item: ' + (err.message || 'Unknown error'));
    }
  };

  const handleSubmitAuction = async (itemId) => {
    try {
      await submitItemForAuction(itemId);
      alert('Item successfully submitted for auction approval!');
    } catch (err) {
      console.error(err);
      alert('Failed to submit item: ' + (err.message || 'Unknown error'));
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PENDING_AUCTION': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'COMPLETED': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'SOLD': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'UNSOLD': return 'bg-red-100 text-red-800 border-red-200';
      case 'DRAFT': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const tabs = [
    { id: 'ALL', label: 'All Items' },
    { id: 'DRAFT', label: 'Drafts' },
    { id: 'PENDING_AUCTION', label: 'Pending' },
    { id: 'SCHEDULED', label: 'Scheduled' },
    { id: 'ACTIVE', label: 'Active' },
    { id: 'SOLD', label: 'Sold' },
    { id: 'UNSOLD', label: 'Unsold' }
  ];

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Inventory Command Center</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">Manage your catalog, track statuses, and submit items for auction.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => refreshData()}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2.5 border border-slate-200 shadow-sm text-sm font-bold rounded-xl text-slate-700 bg-white hover:bg-slate-50 focus:outline-none transition-all disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin text-teal-600' : 'text-slate-500'}`} aria-hidden="true" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-5 py-2.5 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white bg-teal-600 hover:bg-teal-700 focus:outline-none transition-all hover:shadow-[0_0_20px_rgba(13,148,136,0.3)]"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add New Item
          </button>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-teal-100 transition-colors"></div>
          <div className="p-4 bg-teal-50 text-teal-600 rounded-2xl relative z-10">
            <Package className="h-8 w-8" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Items</p>
            <p className="text-3xl font-extrabold text-slate-900">{stats.totalItems}</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-100 transition-colors"></div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl relative z-10">
            <TrendingUp className="h-8 w-8" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Value</p>
            <p className="text-3xl font-extrabold text-slate-900">₹{stats.totalValue.toLocaleString()}</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-100 transition-colors"></div>
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl relative z-10">
            <Activity className="h-8 w-8" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Auctions</p>
            <p className="text-3xl font-extrabold text-slate-900">{stats.activeAuctions}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto pb-2" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm transition-colors
                ₹{activeTab === tab.id
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }
              `}
            >
              {tab.label}
              <span className={`ml-3 py-0.5 px-2.5 rounded-full text-xs font-semibold ${
                activeTab === tab.id ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.id === 'ALL' ? sellerItems.length : sellerItems.filter(i => i.status === tab.id).length}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500 glass-panel border border-slate-200 shadow-sm rounded-3xl">
            <div className="flex flex-col items-center">
              <div className="p-5 bg-slate-50 rounded-full mb-4 border border-slate-100">
                <Filter className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No items found</h3>
              <p className="text-sm font-medium mt-1">There are no items matching this status.</p>
            </div>
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const highestBid = getHighestBid(item.id);
            const currentOrFinalPrice = highestBid ? highestBid.amount : item.basePrice;

            return (
            <div 
              key={item.id} 
              className="glass-panel glass-panel-hover flex flex-col group overflow-hidden border border-slate-200 shadow-sm rounded-3xl"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="aspect-w-16 aspect-h-12 bg-slate-50 relative overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="object-cover w-full h-56 group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-56 text-slate-400 bg-slate-100">
                    <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                    <span className="text-sm font-medium">No Image</span>
                  </div>
                )}
                
                {/* Gradient Overlay for badges */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="absolute top-4 right-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border shadow-sm backdrop-blur-md ${getStatusColor(item.status)}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex-grow flex flex-col justify-between bg-white/60 backdrop-blur-sm relative z-10">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 line-clamp-1 group-hover:text-teal-600 transition-colors">{item.title}</h3>
                  <p className="text-sm font-medium text-slate-500 mt-2 line-clamp-2 leading-relaxed">{item.description}</p>
                </div>
                
                <div className="mt-6 space-y-5">
                   <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-bold flex items-center uppercase tracking-wider text-xs">
                      <Tag className="h-4 w-4 mr-1.5 text-teal-400" />
                      {item.status === 'COMPLETED' || item.status === 'SOLD' ? 'Final Sold Price' : (item.status === 'ACTIVE' ? 'Current Bid' : 'Base Price')}
                    </span>
                    <span className="font-extrabold text-slate-900 text-xl">₹{currentOrFinalPrice.toLocaleString()}</span>
                  </div>

                  {(item.status === 'COMPLETED' || item.status === 'SOLD') && highestBid && (
                    <div className="flex items-center justify-between text-sm mt-3 pt-3 border-t border-slate-100">
                      <span className="text-emerald-600 font-bold flex items-center uppercase tracking-wider text-xs">
                        <Trophy className="h-4 w-4 mr-1.5" />
                        Winner
                      </span>
                      <span className="font-bold text-slate-700">{highestBid.bidderName || `Bidder #${highestBid.bidderId}`}</span>
                    </div>
                  )}
                  
                  {item.status === 'DRAFT' && (
                    <div className="pt-5 border-t border-slate-100 flex space-x-3">
                      <button 
                        onClick={async () => {
                          try {
                            await submitItemForAuction(item.id);
                            alert('Item submitted for auction successfully!');
                          } catch (err) {
                            alert('Failed to submit: ' + err.message);
                          }
                        }}
                        className="flex-1 inline-flex justify-center items-center px-4 py-2.5 text-sm font-bold rounded-xl text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-sm"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Submit for Auction
                      </button>
                      <button 
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this item?')) {
                            try {
                              await deleteItem(item.id);
                              alert('Item deleted successfully!');
                            } catch (err) {
                              alert('Failed to delete: ' + err.message);
                            }
                          }
                        }}
                        className="inline-flex justify-center items-center px-4 py-2.5 text-sm font-bold rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors shadow-sm"
                        title="Delete Draft"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                  {item.status !== 'DRAFT' && (
                    <div className="pt-5 border-t border-slate-100">
                      <button 
                        disabled
                        className="w-full inline-flex justify-center items-center px-4 py-2.5 text-sm font-bold rounded-xl text-slate-400 bg-slate-50 border border-slate-200 cursor-not-allowed"
                      >
                        {item.status === 'PENDING_AUCTION' ? 'Awaiting Approval' : 
                         item.status === 'SCHEDULED' ? 'Auction Scheduled' : 
                         item.status === 'COMPLETED' || item.status === 'SOLD' ? 'Item Sold' :
                         item.status === 'UNSOLD' ? 'Auction Failed (Unsold)' :
                         'Auction Active'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            );
          })
        )}
      </div>

      {/* Add Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 max-h-[90vh] flex flex-col animate-fade-in-up overflow-hidden">
            
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-5 flex items-center justify-between z-20">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center">
                <Box className="h-6 w-6 mr-3 text-teal-500" />
                Add New Inventory Item
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddItem} className="flex flex-col overflow-y-auto">
              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Item Title</label>
                  <input 
                    type="text" 
                    name="title" 
                    required 
                    value={formData.title} 
                    onChange={handleInputChange} 
                    className="block w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 p-3 font-medium transition-shadow" 
                    placeholder="E.g., Vintage Rolex Submariner" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                  <textarea 
                    name="description" 
                    required 
                    rows={4} 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    className="block w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 p-3 font-medium transition-shadow resize-none" 
                    placeholder="Describe the condition, history, and details..." 
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Base Price (₹)</label>
                    <input 
                      type="number" 
                      name="basePrice" 
                      required 
                      min="1" 
                      value={formData.basePrice} 
                      onChange={handleInputChange} 
                      className="block w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 p-3 font-medium transition-shadow" 
                      placeholder="1000" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Item Image (Optional)</label>
                    <div className="mt-1.5">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        id="item-image-upload"
                        className="hidden"
                      />
                      <label 
                        htmlFor="item-image-upload" 
                        className="w-full inline-flex justify-center items-center px-4 py-3 border border-slate-300 rounded-xl shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </label>
                    </div>
                  </div>
                </div>

                {formData.imageUrl && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 h-48 bg-slate-50 flex items-center justify-center relative">
                    <img src={formData.imageUrl} alt="Preview" className="h-full w-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end space-x-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-6 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;

