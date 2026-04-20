import React, { useState, useReducer, useEffect } from "react";
import { collection, addDoc, onSnapshot, query, where, serverTimestamp } from "firebase/firestore";
import { firestore } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { menuItems as mockMenu } from "../data/mockData";
import { ShoppingCart, Plus, Minus, CreditCard, Clock, Utensils } from "lucide-react";
import Layout from "../components/layout/Layout";

// Cart Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD":
      const existing = state.find(i => i.id === action.item.id);
      if (existing) return state.map(i => i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...state, { ...action.item, qty: 1 }];
    case "REMOVE":
      return state.filter(i => i.id !== action.id);
    case "DECREMENT":
      const decItem = state.find(i => i.id === action.id);
      if (decItem.qty > 1) {
        return state.map(i => i.id === action.id ? { ...i, qty: i.qty - 1 } : i);
      }
      return state.filter(i => i.id !== action.id);
    case "CLEAR":
      return [];
    default:
      return state;
  }
};

const FoodOrder = () => {
  const { user } = useAuth();
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [activeCategory, setActiveCategory] = useState("Snacks");
  const [view, setView] = useState("menu"); // menu, checkout, status
  const [pickupSlot, setPickupSlot] = useState("");
  const [placedOrder, setPlacedOrder] = useState(null);

  // Generate 15-minute pickup slots ahead of current time
  const generateSlots = () => {
    const slots = [];
    const now = new Date();
    // Start options at least 15 min from now
    now.setMinutes(now.getMinutes() + 15);
    // Round up to nearest 15
    const remainder = now.getMinutes() % 15;
    now.setMinutes(now.getMinutes() + (15 - remainder));

    for (let i = 0; i < 4; i++) {
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      slots.push(timeStr);
      now.setMinutes(now.getMinutes() + 15);
    }
    return slots;
  };

  const pickupSlots = generateSlots();
  const categories = ["Snacks", "Drinks", "Mains", "Desserts"];

  // Filter menu items by active category
  const displayedItems = mockMenu.filter(item => item.category === activeCategory);

  const cartTotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.qty), 0).toFixed(2);

  // Submit Order logic
  const handleCheckout = async () => {
    if (!pickupSlot) {
      alert("Please select a pickup time.");
      return;
    }
    
    try {
      const orderData = {
        userId: user ? user.uid : "anonymous",
        items: cart,
        total: cartTotal,
        pickupSlot,
        status: "pending",
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(firestore, "orders"), orderData);
      setPlacedOrder({ id: docRef.id, ...orderData, status: "pending" });
      dispatch({ type: "CLEAR" });
      setView("status");
    } catch (err) {
      console.error("Order failed:", err);
      alert("Failed to place order.");
    }
  };

  // Listen to Active Order via Firestore Realtime listener
  useEffect(() => {
    if (view === "status" && placedOrder?.id) {
      const unsub = onSnapshot(collection(firestore, "orders"), (snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.id === placedOrder.id) {
            setPlacedOrder({ id: doc.id, ...doc.data() });
          }
        });
      });
      return () => unsub();
    }
  }, [view, placedOrder?.id]);


  // Menu View UI
  if (view === "menu") {
    return (
      <Layout>
        <div className="p-5 max-w-lg mx-auto pb-40 transition-colors duration-300">
          <header className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight italic">Crave & Conquer</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Pre-order for skip-the-line pickup</p>
          </header>
          
          <div className="flex overflow-x-auto pb-4 mb-6 gap-3 no-scrollbar" role="tablist" aria-label="Menu Categories">
            {categories.map(cat => (
              <button
                key={cat}
                role="tab"
                aria-selected={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-2xl whitespace-nowrap text-sm font-bold transition-all duration-300 shadow-sm ${
                  activeCategory === cat 
                    ? "bg-brand text-white shadow-brand/20 scale-105" 
                    : "bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-white/10 hover:border-brand/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid gap-5">
            {displayedItems.map(item => (
              <div key={item.id} className="group bg-white dark:bg-slate-900 p-4 rounded-[2rem] shadow-sm border border-gray-50 dark:border-white/5 flex gap-5 hover:shadow-xl dark:hover:shadow-black/20 hover:-translate-y-1 transition-all duration-300">
                <div className="w-24 h-24 bg-gray-50 dark:bg-white/10 rounded-[1.5rem] shrink-0 overflow-hidden relative group-hover:scale-105 transition-transform">
                  <div className="w-full h-full bg-indigo-50 dark:bg-white/5 flex items-center justify-center text-brand/30 dark:text-brand/50">
                    <Utensils size={32} strokeWidth={1.5} aria-hidden="true" />
                  </div>
                  <div className="absolute top-2 right-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-black text-brand shadow-sm">
                    ${item.price}
                  </div>
                </div>
                
                <div className="flex-grow flex flex-col justify-between py-1">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight tracking-tight">{item.name}</h3>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-1">Chef Selection</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 underline decoration-brand/30">Available Now</span>
                    <button
                      onClick={() => dispatch({ type: "ADD", item })}
                      className="bg-brand text-white p-2.5 rounded-2xl hover:bg-blue-700 shadow-lg shadow-brand/20 transition-all active:scale-90"
                      aria-label={`Add ${item.name} to cart`}
                    >
                      <Plus size={18} strokeWidth={3} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Floater for minimal view cart */}
          {cart.length > 0 && (
            <div className="fixed bottom-[100px] left-0 w-full px-6 animate-in slide-in-from-bottom duration-500" style={{ zIndex: 40 }}>
              <button
                onClick={() => setView("checkout")}
                className="w-full max-w-lg mx-auto bg-gray-900/90 backdrop-blur-xl text-white py-5 px-8 rounded-[2.5rem] shadow-2xl flex justify-between items-center border border-white/10 group active:scale-95 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
                    <span className="absolute -top-2 -right-2 bg-brand text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-gray-900">
                      {cart.reduce((s, i) => s + i.qty, 0)}
                    </span>
                  </div>
                  <span className="font-bold text-sm uppercase tracking-widest">Review Cart</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-1 h-1 bg-white/30 rounded-full"></span>
                  <span className="font-black text-lg italic">${cartTotal}</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </Layout>
    );
  }


  if (view === "checkout") {
    return (
      <Layout>
        <div className="p-4 max-w-lg mx-auto transition-colors duration-300">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setView("menu")} className="text-brand text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
              <span>←</span> <span>Back</span>
            </button>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight italic">Checkout</h1>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 p-6 mb-6">
            <h2 className="font-black text-lg mb-4 text-gray-900 dark:text-white italic uppercase tracking-tight">Order Summary</h2>
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/10 rounded-xl px-2 py-1">
                    <button onClick={() => dispatch({ type: "DECREMENT", id: item.id })} className="text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-brand rounded" aria-label={`Remove one ${item.name}`}><Minus size={14} aria-hidden="true" /></button>
                    <span className="text-sm font-bold w-4 text-center dark:text-white" aria-live="polite">{item.qty}</span>
                    <button onClick={() => dispatch({ type: "ADD", item })} className="text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors focus:outline-none focus:ring-2 focus:ring-brand rounded" aria-label={`Add one ${item.name}`}><Plus size={14} aria-hidden="true" /></button>
                  </div>
                  <span className="text-gray-800 dark:text-gray-200 font-medium">{item.name}</span>
                </div>
                <span className="font-black dark:text-white">${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-dashed border-gray-100 dark:border-white/10 pt-4 mt-4 flex justify-between font-black text-xl italic text-gray-900 dark:text-white">
              <span>Total</span>
              <span className="text-brand">${cartTotal}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 p-6 mb-6">
            <h2 className="font-black text-lg mb-4 flex items-center gap-2 text-gray-900 dark:text-white italic uppercase tracking-tight">
              <Clock size={18} className="text-brand" /> Pickup Time
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {pickupSlots.map(slot => (
                <button
                  key={slot}
                  onClick={() => setPickupSlot(slot)}
                  className={`p-4 rounded-2xl text-sm font-black transition-all duration-300 border ${
                    pickupSlot === slot 
                      ? "bg-brand text-white border-brand shadow-lg shadow-brand/20 scale-[1.02]" 
                      : "bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-brand/30"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={!pickupSlot}
            className={`w-full p-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-2 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-brand/50 ${
              pickupSlot 
                ? "bg-brand text-white hover:bg-blue-700 shadow-xl shadow-brand/25 scale-100 active:scale-95" 
                : "bg-gray-200 dark:bg-white/5 text-gray-500 dark:text-gray-600 cursor-not-allowed"
            }`}
          >
            <CreditCard size={20} aria-hidden="true" /> Place Order • ${cartTotal}
          </button>
        </div>
      </Layout>
    );
  }

  // Status View
  return (
    <Layout>
      <div className="p-4 max-w-lg mx-auto flex flex-col items-center justify-center min-h-[75vh] text-center" aria-live="polite">
        <div className={`w-32 h-32 rounded-[3rem] flex items-center justify-center mb-8 shadow-2xl relative transition-all duration-700 ${
          placedOrder?.status === 'ready' 
            ? 'bg-emerald-500 text-white rotate-12 scale-110 shadow-emerald-500/30' 
            : 'bg-brand text-white animate-pulse shadow-brand/30'
        }`}>
          <Utensils size={48} strokeWidth={2.5} />
          {placedOrder?.status !== 'ready' && (
             <div className="absolute inset-0 rounded-[3rem] border-4 border-white/20 animate-ping"></div>
          )}
        </div>
        
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 italic tracking-tight">
          {placedOrder?.status === 'ready' ? 'Ready to Eat!' : 'Fire in the Kitchen'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10 max-w-[280px] mx-auto font-medium">
          {placedOrder?.status === 'ready'
            ? `Your feast is waiting at the pickup counter. Don't let it get cold!`
            : `We are hand-crafting your selection. Head to the counter at ${placedOrder?.pickupSlot}.`}
        </p>

        <div className="bg-white dark:bg-slate-900 w-full rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-white/5 p-8 text-left mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 dark:bg-brand/10 rounded-bl-[4rem]"></div>
          <p className="text-[10px] border-b border-dashed border-gray-200 dark:border-white/10 pb-4 mb-4 text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest">
            Identity — #{placedOrder?.id?.slice(-8).toUpperCase()}
          </p>
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-widest">Pickup Window</span>
            <span className="font-black text-2xl italic text-gray-900 dark:text-white tracking-widest">{placedOrder?.pickupSlot}</span>
          </div>
          <div className="flex justify-between items-center">
             <span className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-widest">Live Status</span>
             <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${placedOrder?.status === 'ready' ? 'bg-emerald-500' : 'bg-brand animate-pulse'}`}></span>
                <span className="font-black text-brand uppercase tracking-[0.2em] italic">{placedOrder?.status}</span>
             </div>
          </div>
        </div>

        <button 
          onClick={() => { setView("menu"); setPlacedOrder(null); setPickupSlot(""); }} 
          className="bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white px-8 py-4 rounded-2xl font-black italic uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-95"
        >
          New Order
        </button>
      </div>
    </Layout>
  );
};

export default FoodOrder;
