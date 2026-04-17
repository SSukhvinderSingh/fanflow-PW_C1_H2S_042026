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
        <div className="p-4 max-w-lg mx-auto pb-32">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Food & Drinks</h1>
          
          <div className="flex overflow-x-auto pb-4 mb-4 gap-2 no-scrollbar" role="tablist" aria-label="Menu Categories">
            {categories.map(cat => (
              <button
                key={cat}
                role="tab"
                aria-selected={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1 ${
                  activeCategory === cat ? "bg-brand text-white" : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {displayedItems.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg shrink-0 overflow-hidden">
                  {/* Decorative placeholder instead of real image to prevent broken links visually */}
                  <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-brand/30">
                    <Utensils size={32} aria-hidden="true" />
                  </div>
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-brand font-bold mt-1">${item.price}</p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => dispatch({ type: "ADD", item })}
                      className="bg-brand/10 text-brand p-2 rounded-full hover:bg-brand/20 transition focus:outline-none focus:ring-2 focus:ring-brand"
                      aria-label={`Add ${item.name} to cart`}
                    >
                      <Plus size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Floater for minimal view cart */}
          {cart.length > 0 && (
            <div className="fixed bottom-[80px] left-0 w-full px-4" style={{ zIndex: 40 }}>
              <button
                onClick={() => setView("checkout")}
                className="w-full max-w-lg mx-auto bg-brand text-white p-4 rounded-2xl shadow-lg flex justify-between items-center"
              >
                <div className="flex items-center gap-2 font-semibold">
                  <ShoppingCart size={20} />
                  <span>{cart.reduce((s, i) => s + i.qty, 0)} items</span>
                </div>
                <span className="font-bold">Checkout • ${cartTotal}</span>
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
        <div className="p-4 max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setView("menu")} className="text-brand text-sm font-semibold">← Back</button>
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
                    <button onClick={() => dispatch({ type: "DECREMENT", id: item.id })} className="text-gray-500 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-brand rounded" aria-label={`Remove one ${item.name}`}><Minus size={14} aria-hidden="true" /></button>
                    <span className="text-sm font-medium w-4 text-center" aria-live="polite">{item.qty}</span>
                    <button onClick={() => dispatch({ type: "ADD", item })} className="text-gray-500 hover:text-green-500 focus:outline-none focus:ring-2 focus:ring-brand rounded" aria-label={`Add one ${item.name}`}><Plus size={14} aria-hidden="true" /></button>
                  </div>
                  <span className="text-gray-800">{item.name}</span>
                </div>
                <span className="font-semibold">${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-4 mt-4 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${cartTotal}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2"><Clock size={18}/> Pickup Time</h2>
            <div className="grid grid-cols-2 gap-3">
              {pickupSlots.map(slot => (
                <button
                  key={slot}
                  onClick={() => setPickupSlot(slot)}
                  className={`p-3 rounded-lg text-sm font-semibold border transition ${
                    pickupSlot === slot ? "bg-brand text-white border-brand" : "bg-gray-50 text-gray-700 border-gray-200"
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
            className={`w-full p-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition focus:outline-none focus:ring-4 focus:ring-brand/50 ${
              pickupSlot ? "bg-brand text-white hover:bg-blue-700 shadow-md" : "bg-gray-200 text-gray-500 cursor-not-allowed"
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
      <div className="p-4 max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center" aria-live="polite">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg ${
          placedOrder?.status === 'ready' ? 'bg-green-500 text-white' : 'bg-brand text-white animate-pulse'
        }`}>
          <Utensils size={40} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {placedOrder?.status === 'ready' ? 'Order Ready!' : 'Preparing Order'}
        </h1>
        <p className="text-gray-500 mb-8 max-w-xs mx-auto">
          {placedOrder?.status === 'ready'
            ? `Your food is ready at the pickup counter.`
            : `We are preparing your order. Head to the counter at your selected pickup time.`}
        </p>

        <div className="bg-white w-full rounded-2xl shadow-sm border border-gray-100 p-6 text-left mb-6">
          <p className="text-sm border-b border-dashed pb-3 mb-3 text-gray-500 font-mono">Order ID: {placedOrder?.id}</p>
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-600">Pickup Slot</span>
            <span className="font-bold text-lg">{placedOrder?.pickupSlot}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Status</span>
            <span className="font-bold text-brand uppercase tracking-wider">{placedOrder?.status}</span>
          </div>
        </div>

        <button onClick={() => { setView("menu"); setPlacedOrder(null); setPickupSlot(""); }} className="text-brand font-semibold hover:underline">
          Start New Order
        </button>
      </div>
    </Layout>
  );
};

export default FoodOrder;
