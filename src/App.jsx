import React from 'react';
import { MapPin, Radio } from 'lucide-react'; // Proveri da li si instalirao lucide-react
import { useLocation } from './hooks/useLocation';

function App() {
  const { location, error, askLocation } = useLocation();

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      
      {/* Logotip */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-purple-500 flex items-center gap-3 justify-center">
          <Radio size={40} /> VODI ME
        </h1>
        <p className="text-slate-400 mt-2">Gde je svirka večeras?</p>
      </div>

      {/* Kontejner za akciju */}
      <div className="w-full max-w-sm">
        {!location ? (
          <button 
            onClick={askLocation}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-2xl font-bold transition-all w-full shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <MapPin size={20} /> 
            Pronađi me trenutno
          </button>
        ) : (
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center text-green-400 font-mono">
            Lokacija očitana: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </div>
        )}

        {/* Prikaz greške ako korisnik odbije lokaciju */}
        {error && (
          <p className="mt-4 text-red-400 text-sm text-center bg-red-400/10 p-2 rounded border border-red-400/20">
            {error}
          </p>
        )}
      </div>
      
    </div>
  );
}

export default App;