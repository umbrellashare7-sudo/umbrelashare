import React, { useEffect, useState } from 'react';
import { CloudRain, Sun, Umbrella, ShieldCheck, MapPin } from 'lucide-react';
import { getWeather } from "../services/weather.service";

import { WeatherData } from '../types';

interface HomeProps {
  onNavigate: (page: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      // Simulate checking location
      const data = await getWeather("Central Campus");


      setWeather(data);
      setLoading(false);
    };

    fetchWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16 px-6 rounded-b-[3rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
            <Umbrella size={300} />
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Don't get caught <br /> in the rain.
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-lg">
            UmbrellaShare is the campus-wide smart rental system. Borrow an umbrella at the library, return it at the gate. Simple.
          </p>
          <button 
            onClick={() => onNavigate('dashboard')}
            className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            Find an Umbrella
          </button>
        </div>
      </section>

      {/* Weather Widget */}
      <div className="max-w-4xl mx-auto px-6 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-center justify-between border border-slate-100">
          {loading ? (
             <div className="flex items-center space-x-4 animate-pulse w-full">
                <div className="h-12 w-12 bg-slate-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                </div>
             </div>
          ) : weather ? (
            <>
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <div className={`p-4 rounded-full ${weather.isRainy ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'}`}>
                        {weather.isRainy ? <CloudRain size={32} /> : <Sun size={32} />}
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800">{weather.temperature}°C</h3>
                        <p className="text-slate-500 font-medium">{weather.summary}</p>
                    </div>
                </div>
                
                <div className="flex-1 md:pl-8 md:border-l md:border-slate-100">
                     <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-500 font-medium">Rain Probability</span>
                        <span className="text-sm font-bold text-blue-600">{weather.rainChance}%</span>
                     </div>
                     <div className="w-full bg-slate-100 rounded-full h-2.5 mb-3">
                        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${weather.rainChance}%` }}></div>
                     </div>
                     <p className="text-sm text-slate-600 italic">
                        <span className="font-bold text-indigo-600">AI Tip: </span> {weather.advice}
                     </p>
                </div>
            </>
          ) : (
            <div className="text-red-500">Failed to load weather.</div>
          )}
        </div>
      </div>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-12">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                    <MapPin size={28} />
                </div>
                <h3 className="font-semibold text-lg mb-2">1. Locate</h3>
                <p className="text-slate-500 text-sm">Find an available umbrella station near you using the dashboard.</p>
            </div>
            <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                    <ShieldCheck size={28} />
                </div>
                <h3 className="font-semibold text-lg mb-2">2. Unlock</h3>
                <p className="text-slate-500 text-sm">Use your student ID to rent an umbrella. Small deposit required.</p>
            </div>
            <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                    <CloudRain size={28} />
                </div>
                <h3 className="font-semibold text-lg mb-2">3. Return</h3>
                <p className="text-slate-500 text-sm">Stay dry! Return the umbrella to any station within 24 hours.</p>
            </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
