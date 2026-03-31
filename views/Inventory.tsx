
import React, { useState } from 'react';
import { Package, ShieldAlert, Plus, Edit2, ShoppingBag, X, Send, Sparkles, AlertCircle, Save, Minus, Trash2 } from 'lucide-react';
import { User, UserRole, InventoryItem, EquipmentRequest } from '@/types';

interface InventoryProps {
  user: User;
  requests: EquipmentRequest[];
  setRequests: React.Dispatch<React.SetStateAction<EquipmentRequest[]>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
}

const Inventory: React.FC<InventoryProps> = ({ user, requests, setRequests, inventory, setInventory }) => {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    itemId: '',
    quantity: 1,
    operation: 'add' as 'add' | 'subtract',
    reason: ''
  });

  const [requestFormData, setRequestFormData] = useState({
    category: 'Rackets',
    description: ''
  });

  // Only Captains and Vice Captains can update stock as per request
  const isCaptainOrVC = user.role === UserRole.CAPTAIN || user.role === UserRole.VICE_CAPTAIN;
  const isAdminOrCaptain = user.role === UserRole.ADMIN || isCaptainOrVC;
  // currentYear: 1 = 1st year, 2 = 2nd year, 3 = 3rd year, 4 = 4th year
  // So 2nd year and above means currentYear >= 2
  const isEligibleToRequest = (user.currentYear !== undefined && user.currentYear >= 2) || isAdminOrCaptain;

  const handleApprove = async (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    const token = localStorage.getItem('ace_token');
    const headers = { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    try {
      // 1. Update request status
      const reqRes = await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: 'approved' })
      });

      if (!reqRes.ok) throw new Error('Failed to approve request');

      // 2. Increment inventory
      if (request.itemId && request.itemId !== 'custom') {
        const item = inventory.find(i => i.id === request.itemId);
        if (item) {
          const invRes = await fetch(`/api/inventory/${item._id || item.id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ quantity: item.quantity + 1 })
          });
          if (invRes.ok) {
            const updatedItem = await invRes.json();
            setInventory(prev => prev.map(i => i.id === updatedItem.id || i._id === updatedItem._id ? updatedItem : i));
          }
        }
      }

      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      console.error('Error approving request:', err);
      alert('Error approving request');
    }
  };

  const handleReject = async (requestId: string) => {
    const token = localStorage.getItem('ace_token');
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'rejected' })
      });

      if (res.ok) {
        setRequests(prev => prev.filter(r => r.id !== requestId));
      }
    } catch (err) {
      console.error('Error rejecting request:', err);
    }
  };

  const handleUpdateStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateFormData.itemId) return;

    const item = inventory.find(i => i.id === updateFormData.itemId);
    if (!item) return;

    const adjustment = updateFormData.operation === 'add' ? updateFormData.quantity : -updateFormData.quantity;
    const newQuantity = Math.max(0, item.quantity + adjustment);

    const token = localStorage.getItem('ace_token');
    try {
      const res = await fetch(`/api/inventory/${item._id || item.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (res.ok) {
        const updatedItem = await res.json();
        setInventory(prev => prev.map(i => i.id === updatedItem.id || i._id === updatedItem._id ? updatedItem : i));
        setIsUpdateModalOpen(false);
        setUpdateFormData({ itemId: '', quantity: 1, operation: 'add', reason: '' });
      }
    } catch (err) {
      console.error('Error updating stock:', err);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestFormData.description.trim()) return;

    const categoryLower = requestFormData.category.toLowerCase().replace(/s$/, '');
    const matchedItem = inventory.find(item => 
      item.name.toLowerCase().includes(categoryLower)
    );

    const token = localStorage.getItem('ace_token');
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userName: user.name,
          itemId: matchedItem ? matchedItem.id : 'custom',
          itemDescription: `${requestFormData.category}: ${requestFormData.description}`,
          status: 'pending'
        })
      });

      if (res.ok) {
        const newRequest = await res.json();
        setRequests(prev => [newRequest, ...prev]);
        setRequestFormData({ ...requestFormData, description: '' });
        alert(`Requirement for ${requestFormData.category} submitted. Captains have been notified.`);
      }
    } catch (err) {
      console.error('Error submitting request:', err);
    }
  };

  const requestOptions = [
    'Court Cleanliness',
    'Rackets',
    'Balls',
    'Nets',
    'Cones',
    'Discs'
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Equipments & Services</h2>
          <p className="text-slate-500 text-sm">Real-time inventory and court service demands.</p>
        </div>
        {isCaptainOrVC && (
          <button 
            onClick={() => setIsUpdateModalOpen(true)}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-lg hover:bg-emerald-700 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus size={14} /> Update Stock
          </button>
        )}
      </div>

      {/* Inventory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
         {inventory.map((item) => {
           const itemId = item._id || item.id;
           const isNet = item.name.toLowerCase().includes('net');
           const isLow = isNet ? item.quantity <= 3 : item.quantity < 10;
           
           return (
             <div key={itemId} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 group relative overflow-hidden transition-all hover:shadow-md">
               <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mb-4 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    <Package size={24} />
                  </div>
                  <h3 className="font-bold text-slate-800 tracking-tight text-sm">{item.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-black text-slate-900 tabular-nums">{item.quantity}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.unit}</span>
                  </div>
                  {isLow && (
                    <div className="mt-4 flex items-center gap-1.5 text-red-500 bg-red-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit border border-red-100">
                      <ShieldAlert size={12} /> Low
                    </div>
                  )}
               </div>
               {isAdminOrCaptain && (
                 <button 
                  onClick={() => {
                    setUpdateFormData({ ...updateFormData, itemId: itemId });
                    setIsUpdateModalOpen(true);
                  }}
                  className="absolute top-6 right-6 text-slate-200 hover:text-emerald-600 transition-colors"
                 >
                   <Edit2 size={16} />
                 </button>
               )}
             </div>
           );
         })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
           {isAdminOrCaptain ? (
             <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[400px]">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">Incoming Demands</h3>
                  <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100">
                    {requests.length} PENDING
                  </span>
                </div>
                <div className="divide-y divide-slate-50 overflow-y-auto max-h-[500px]">
                  {requests.map((req) => {
                    const requestId = req._id || req.id;
                    return (
                    <div key={requestId} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all group">
                       <div className="flex items-center gap-5">
                         <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs shadow-inner uppercase">
                           {req.userName.charAt(0)}
                         </div>
                         <div>
                           <p className="text-[15px] font-bold text-slate-800 tracking-tight">{req.userName}</p>
                           <p className="text-xs text-slate-400 font-medium">Demand: <span className="text-slate-600">{req.itemDescription}</span></p>
                         </div>
                       </div>
                       <div className="flex items-center gap-3">
                         <button 
                           onClick={() => handleApprove(requestId)}
                           className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-sm transition-all"
                         >
                           Approve
                         </button>
                         <button 
                           onClick={() => handleReject(requestId)}
                           className="px-4 py-2 text-red-500 font-black text-[10px] uppercase tracking-widest hover:text-red-700 transition-all"
                         >
                           Reject
                         </button>
                       </div>
                    </div>
                  )})}
                  {requests.length === 0 && (
                    <div className="p-20 text-center">
                      <ShoppingBag size={48} className="text-slate-100 mx-auto mb-4" />
                      <p className="text-slate-400 font-bold text-sm tracking-tight">No active equipment demands.</p>
                    </div>
                  )}
                </div>
             </div>
           ) : (
             <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-10 animate-in slide-in-from-left-4 duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Requirement Form</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submit demands for court maintenance or equipment</p>
                  </div>
                </div>

                {!isEligibleToRequest && (
                  <div className="mb-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3 text-amber-700">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <p className="text-xs font-bold uppercase tracking-tight">Access Restricted: Only 2nd year and above members can submit demands.</p>
                  </div>
                )}

                <form onSubmit={handleSubmitRequest} className="space-y-6">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Demand Category</label>
                        <select 
                          disabled={!isEligibleToRequest}
                          value={requestFormData.category}
                          onChange={(e) => setRequestFormData({...requestFormData, category: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-slate-900 font-bold focus:ring-1 focus:ring-emerald-500 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50"
                        >
                          {requestOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Details / Justification</label>
                     <textarea 
                        disabled={!isEligibleToRequest}
                        required
                        value={requestFormData.description}
                        onChange={(e) => setRequestFormData({...requestFormData, description: e.target.value})}
                        placeholder="e.g. Current training balls are worn out. Need 2 fresh cans for evening session."
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-6 text-slate-900 font-bold focus:ring-1 focus:ring-emerald-500 outline-none transition-all min-h-[150px] resize-none disabled:opacity-50"
                     />
                   </div>
                   <button 
                     type="submit"
                     disabled={!isEligibleToRequest}
                     className="w-full py-5 emerald-gradient text-white rounded-[1.2rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:grayscale disabled:cursor-not-allowed"
                   >
                     <Send size={18} /> Send Demand
                   </button>
                </form>
             </div>
           )}
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-4">Inventory Policy</h4>
                <p className="text-sm font-medium text-slate-300 leading-relaxed mb-6">
                   Updating stock values is a leadership-only responsibility. Damaged equipment should be subtracted from active inventory records.
                </p>
                <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Last Audit</p>
                   <p className="text-sm font-bold mt-1">Checked on {new Date().toLocaleDateString()}</p>
                </div>
              </div>
           </div>

           <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-50">
                <h3 className="font-bold text-slate-900 text-sm">Stock Health</h3>
              </div>
              <div className="p-6 space-y-4">
                 {inventory.slice(0, 5).map((item, i) => {
                   const isNet = item.name.toLowerCase().includes('net');
                   const isLow = isNet ? item.quantity < 3 : item.quantity < 10;
                   return (
                   <div key={i} className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-slate-400">{item.name}</span>
                        <span className={isLow ? 'text-red-500' : 'text-emerald-600'}>{item.quantity} {item.unit}</span>
                      </div>
                      <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                         <div className={`h-full rounded-full ${isLow ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, (item.quantity / (item.name.toLowerCase().includes('ball') ? 400 : 100)) * 100)}%` }} />
                      </div>
                   </div>
                 )})}
              </div>
           </div>
        </div>
      </div>

      {/* Update Stock Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-10 relative shadow-2xl animate-in zoom-in-95 duration-300 border border-emerald-50">
            <button 
              onClick={() => setIsUpdateModalOpen(false)} 
              className="absolute top-8 right-8 p-2.5 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="mb-8">
              <div className="w-12 h-12 emerald-gradient rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg">
                <Package size={24} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Inventory Adjustment</h3>
              <p className="text-sm text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Captain / Vice Captain Portal</p>
            </div>

            <form onSubmit={handleUpdateStockSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Equipment Type</label>
                <select 
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-slate-900 font-bold focus:ring-1 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
                  value={updateFormData.itemId}
                  onChange={(e) => setUpdateFormData({...updateFormData, itemId: e.target.value})}
                >
                  <option value="">Select Equipment...</option>
                  {inventory.map(item => <option key={item.id} value={item.id}>{item.name} (Current: {item.quantity})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operation</label>
                    <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                        <button 
                            type="button"
                            onClick={() => setUpdateFormData({...updateFormData, operation: 'add'})}
                            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${updateFormData.operation === 'add' ? 'bg-white text-emerald-600 shadow-sm font-black' : 'text-slate-400 font-bold'}`}
                        >
                            <Plus size={14} /> Add
                        </button>
                        <button 
                            type="button"
                            onClick={() => setUpdateFormData({...updateFormData, operation: 'subtract'})}
                            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${updateFormData.operation === 'subtract' ? 'bg-white text-red-500 shadow-sm font-black' : 'text-slate-400 font-bold'}`}
                        >
                            <Minus size={14} /> Remove
                        </button>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity</label>
                    <input 
                        type="number"
                        min="1"
                        required
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-slate-900 font-bold focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                        value={updateFormData.quantity}
                        onChange={(e) => setUpdateFormData({...updateFormData, quantity: parseInt(e.target.value) || 1})}
                    />
                 </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason (Optional)</label>
                <input 
                  placeholder="e.g. New delivery from college / damaged during match"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-slate-900 font-bold focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                  value={updateFormData.reason}
                  onChange={(e) => setUpdateFormData({...updateFormData, reason: e.target.value})}
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-700">
                <AlertCircle size={18} className="shrink-0" />
                <p className="text-[10px] font-black uppercase leading-relaxed">
                    Adjustments will be logged in the financial audit trail.
                </p>
              </div>

              <button 
                type="submit"
                className="w-full py-5 emerald-gradient text-white rounded-[1.25rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <Save size={18} /> Apply Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
