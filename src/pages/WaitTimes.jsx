import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";
import { concessions as mockConcessions, restrooms as mockRestrooms, gates as mockGates } from "../data/mockData";
import { RefreshCcw, Coffee, Droplets, DoorOpen } from "lucide-react";
import Layout from "../components/layout/Layout";

const WaitCard = ({ name, metricValue, metricType, lastUpdated, icon: Icon }) => {
  let colorClass = "from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200/50";
  let iconBg = "bg-emerald-500";
  let displayMetric = metricValue;

  if (metricType === "minutes") {
    displayMetric = `${metricValue}m`;
    if (metricValue >= 5 && metricValue < 15) {
      colorClass = "from-amber-50 to-amber-100 dark:from-amber-900/10 dark:to-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30";
      iconBg = "bg-amber-500";
    }
    if (metricValue >= 15) {
      colorClass = "from-red-50 to-red-100 dark:from-red-900/10 dark:to-red-900/20 text-red-700 dark:text-red-400 border-red-200/50 dark:border-red-900/30";
      iconBg = "bg-red-500";
    }
  } else if (metricType === "queue") {
    displayMetric = `${metricValue}`;
    if (metricValue >= 10 && metricValue < 25) {
      colorClass = "from-amber-50 to-amber-100 dark:from-amber-900/10 dark:to-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30";
      iconBg = "bg-amber-500";
    }
    if (metricValue >= 25) {
      colorClass = "from-red-50 to-red-100 dark:from-red-900/10 dark:to-red-900/20 text-red-700 dark:text-red-400 border-red-200/50 dark:border-red-900/30";
      iconBg = "bg-red-500";
    }
  } else {
    displayMetric = `${metricValue}%`;
    if (metricValue >= 50 && metricValue < 80) {
      colorClass = "from-amber-50 to-amber-100 dark:from-amber-900/10 dark:to-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30";
      iconBg = "bg-amber-500";
    }
    if (metricValue >= 80) {
      colorClass = "from-red-50 to-red-100 dark:from-red-900/10 dark:to-red-900/20 text-red-700 dark:text-red-400 border-red-200/50 dark:border-red-900/30";
      iconBg = "bg-red-500";
    }
  }

  return (
    <div
      className="group bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-white/5 mb-4 hover:shadow-xl dark:hover:shadow-black/20 hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
      role="article"
      aria-live="polite"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`p-3 rounded-2xl ${iconBg} bg-opacity-10 dark:bg-opacity-20 text-current`}>
              <Icon size={24} className="opacity-80 dark:opacity-100" aria-hidden="true" />
            </div>
            {/* Pulsing indicator for active logic */}
            <span className={`absolute -top-1 -right-1 flex h-3 w-3`}>
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${iconBg} opacity-40`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${iconBg}`}></span>
            </span>
          </div>
          <div>
            <span className="block font-black text-gray-900 dark:text-white text-lg leading-tight tracking-tight italic uppercase">{name}</span>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">Updated {lastUpdated}</p>
          </div>
        </div>
        
        <div className={`flex flex-col items-end justify-center min-w-[70px] py-1 px-4 rounded-2xl border bg-gradient-to-br ${colorClass}`}>
          <span className="text-xl font-black italic tracking-tighter">{displayMetric}</span>
          <span className="text-[8px] font-black uppercase opacity-60 -mt-1">
            {metricType === 'minutes' ? 'Wait' : metricType === 'queue' ? 'Queue' : 'Load'}
          </span>
        </div>
      </div>
    </div>
  );
};


const WaitTimes = () => {
  const [concessions, setConcessions] = useState([]);
  const [restrooms, setRestrooms] = useState([]);
  const [gates, setGates] = useState([]);
  const [lastRefresh, setLastRefresh] = useState(new Date().toLocaleTimeString());

  const fetchData = () => {
    // We are simulating fetching all via generic DB hooks, with fallback
    setLastRefresh(new Date().toLocaleTimeString());
    
    const fetchPath = (path, mock, setter) => {
      onValue(ref(db, path), (snapshot) => {
        const data = snapshot.val();
        setter(data ? Object.values(data) : mock);
      }, { onlyOnce: true });
    };

    fetchPath("/concessions", mockConcessions, setConcessions);
    fetchPath("/restrooms", mockRestrooms, setRestrooms);
    fetchPath("/gates", mockGates, setGates);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Layout>
      <div className="p-4 max-w-lg mx-auto transition-colors duration-300">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight italic">Live Beat</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-[0.2rem] mt-1">Real-time venue pulse</p>
          </div>
          <button
            onClick={fetchData}
            aria-label="Refresh wait times"
            className="flex items-center justify-center w-12 h-12 bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-2xl shadow-xl hover:shadow-brand/10 text-gray-700 dark:text-gray-300 transition-all duration-300 active:scale-90"
          >
            <RefreshCcw size={20} strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>

        <section className="mb-8" aria-label="Concessions">
          <div className="flex items-center gap-3 mb-4">
             <div className="bg-brand/10 p-2 rounded-xl text-brand">
                <Coffee size={18} strokeWidth={3} />
             </div>
             <h2 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Concessions</h2>
          </div>
          {concessions.slice(0, 5).map((c) => (
            <WaitCard key={c.id} name={c.name} metricValue={c.waitMinutes} metricType="minutes" lastUpdated={c.lastUpdated} icon={Coffee} />
          ))}
        </section>

        <section className="mb-8" aria-label="Restrooms">
          <div className="flex items-center gap-3 mb-4">
             <div className="bg-teal-500/10 p-2 rounded-xl text-teal-500">
                <Droplets size={18} strokeWidth={3} />
             </div>
             <h2 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Restrooms</h2>
          </div>
          {restrooms.slice(0, 5).map((r) => (
            <WaitCard key={r.id} name={r.name} metricValue={r.queueLength} metricType="queue" lastUpdated={r.lastUpdated} icon={Droplets} />
          ))}
        </section>

        <section className="mb-4" aria-label="Entry Gates">
          <div className="flex items-center gap-3 mb-4">
             <div className="bg-indigo-500/10 p-2 rounded-xl text-indigo-500">
                <DoorOpen size={18} strokeWidth={3} />
             </div>
             <h2 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Entry Gates</h2>
          </div>
          {gates.slice(0, 5).map((g) => (
            <WaitCard key={g.id} name={g.name} metricValue={g.crowdDensity} metricType="density" lastUpdated={g.lastUpdated} icon={DoorOpen} />
          ))}
        </section>
      </div>
    </Layout>
  );
};

export default WaitTimes;
