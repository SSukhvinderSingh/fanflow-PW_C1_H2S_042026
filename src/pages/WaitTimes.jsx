import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";
import { concessions as mockConcessions, restrooms as mockRestrooms, gates as mockGates } from "../data/mockData";
import { RefreshCcw, Coffee, Droplets, DoorOpen } from "lucide-react";
import Layout from "../components/layout/Layout";

const WaitCard = ({ name, metricValue, metricType, lastUpdated, icon: Icon }) => {
  let color = "bg-green-100 text-green-800";
  let displayMetric = metricValue;

  if (metricType === "minutes") {
    displayMetric = `${metricValue} min`;
    if (metricValue >= 5 && metricValue < 15) color = "bg-amber-100 text-amber-800";
    if (metricValue >= 15) color = "bg-red-100 text-red-800";
  } else if (metricType === "queue") {
    displayMetric = `${metricValue} in line`;
    if (metricValue >= 10 && metricValue < 25) color = "bg-amber-100 text-amber-800";
    if (metricValue >= 25) color = "bg-red-100 text-red-800";
  } else {
    // density or other string
    displayMetric = `${metricValue}% dense`;
    if (metricValue >= 50 && metricValue < 80) color = "bg-amber-100 text-amber-800";
    if (metricValue >= 80) color = "bg-red-100 text-red-800";
  }

  return (
    <div
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3"
      role="article"
      aria-live="polite"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color.replace("text", "bg").replace("100", "50")}`}>
            <Icon size={18} className={color.split(" ")[1]} aria-hidden="true" />
          </div>
          <span className="font-semibold text-gray-900 text-base">{name}</span>
        </div>
        <span className={`text-sm font-medium px-3 py-1 rounded-full ${color}`}>
          {displayMetric}
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-right">Updated {lastUpdated}</p>
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
      <div className="p-4 max-w-lg mx-auto">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Wait Times</h1>
            <p className="text-sm text-gray-500">Live venue conditions</p>
          </div>
          <button
            onClick={fetchData}
            aria-label="Refresh wait times"
            className="flex items-center gap-1 text-sm bg-white border border-gray-200 px-3 py-2 rounded-lg shadow-sm hover:bg-gray-50 text-gray-700 transition focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <RefreshCcw size={16} aria-hidden="true" />
          </button>
        </div>

        <section className="mb-8" aria-label="Concessions">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Coffee size={20} className="text-brand" /> Concessions
          </h2>
          {concessions.slice(0, 5).map((c) => (
            <WaitCard key={c.id} name={c.name} metricValue={c.waitMinutes} metricType="minutes" lastUpdated={c.lastUpdated} icon={Coffee} />
          ))}
        </section>

        <section className="mb-8" aria-label="Restrooms">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Droplets size={20} className="text-teal-500" /> Restrooms
          </h2>
          {restrooms.slice(0, 5).map((r) => (
            <WaitCard key={r.id} name={r.name} metricValue={r.queueLength} metricType="queue" lastUpdated={r.lastUpdated} icon={Droplets} />
          ))}
        </section>

        <section className="mb-4" aria-label="Entry Gates">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <DoorOpen size={20} className="text-indigo-500" /> Entry Gates
          </h2>
          {gates.slice(0, 5).map((g) => (
            <WaitCard key={g.id} name={g.name} metricValue={g.crowdDensity} metricType="density" lastUpdated={g.lastUpdated} icon={DoorOpen} />
          ))}
        </section>
      </div>
    </Layout>
  );
};

export default WaitTimes;
