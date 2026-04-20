import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogIn, Zap, ArrowRight, ShieldCheck } from "lucide-react";

const Login = () => {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/map", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-700">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[10%] left-[15%] w-[40rem] h-[40rem] bg-brand/20 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[5%] right-[10%] w-[35rem] h-[35rem] bg-indigo-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-lg z-10 animate-in fade-in zoom-in slide-in-from-bottom-8 duration-1000 ease-out">
        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] p-12 text-center relative overflow-hidden">
          {/* Inner Gloss */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/5 pointer-events-none"></div>
          
          <div className="flex justify-center mb-10">
            <div className="relative group">
              <div className="absolute inset-0 bg-brand blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative flex items-center justify-center w-24 h-24 bg-white rounded-[2rem] shadow-2xl transition-transform group-hover:scale-105 duration-500">
                <Zap className="text-brand w-12 h-12 fill-brand/10" strokeWidth={3} />
              </div>
            </div>
          </div>
          
          <h1 className="text-7xl font-black text-white mb-4 tracking-tighter leading-tight italic decoration-brand">
            Fan<span className="text-brand">Flow</span>
          </h1>
          
          <div className="flex flex-col gap-2 mb-12">
            <p className="text-2xl font-bold text-white tracking-tight">Precision Event Management</p>
            <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-xs mx-auto">Seamless entry, live metrics, and smart exits for the ultimate attendee experience.</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={signInWithGoogle}
              className="group relative w-full bg-brand text-white font-black py-6 px-10 rounded-3xl hover:bg-blue-600 transition-all duration-500 flex items-center justify-center gap-4 shadow-[0_20px_40px_-12px_rgba(29,78,216,0.5)] hover:-translate-y-1 active:scale-95 focus:outline-none focus:ring-4 focus:ring-brand/30 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              <span className="uppercase tracking-[0.25em] text-sm">Get Started</span>
              <ArrowRight size={20} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="flex items-center justify-center gap-3 py-4">
              <ShieldCheck className="text-emerald-500 w-5 h-5" />
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Secure Google Authentication</span>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/5">
            <div className="flex justify-center gap-6">
              {[
                { label: "Live", val: "Density" },
                { label: "Smart", val: "Exits" },
                { label: "Instant", val: "Orders" }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-xs font-bold text-slate-300">{stat.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-12 text-[10px] text-center text-slate-600 uppercase tracking-[0.5em] font-black opacity-50">
          Global Enterprise High Fidelity OS
        </p>
      </div>
    </div>
  );
};

export default Login;
