import React, { useState, useEffect } from 'react';
import { db } from './services/firebase'; 
import { collection, getDocs } from 'firebase/firestore';
import { MapPin, Radio, Music, Clock } from 'lucide-react';
import { useLocation } from './hooks/useLocation';
import { calculateDistance } from './utils/distance';
import AdminForm from './components/AdminForm';

function App() {
  const { location, error, askLocation } = useLocation();
  const [svirke, setSvirke] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Funkcija za povlačenje svirki
  const fetchSvirke = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "dogadjaji"));
      let data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // SORTIRANJE po udaljenosti (ako imamo lokaciju korisnika)
      if (location && location.lat && location.lng) {
        data = data.sort((a, b) => {
          const distA = calculateDistance(location.lat, location.lng, a.lat, a.lng);
          const distB = calculateDistance(location.lat, location.lng, b.lat, b.lng);
          return distA - distB;
        });
      }

      setSvirke(data);
    } catch (err) {
      console.error("Greška pri čitanju baze:", err);
    }
    setLoading(false);
  };

  // Povuci podatke čim dobijemo lokaciju
  useEffect(() => {
    if (location) {
      fetchSvirke();
    }
  }, [location]);

  const handleNavigation = (lat, lng) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 font-sans">
      {/* Header */}
      <div className="text-center mb-8 pt-4">
        <h1 className="text-3xl font-black text-purple-500 flex justify-center items-center gap-2 uppercase tracking-tighter">
          <Radio className="animate-pulse" /> Vodi me da slušam
        </h1>
        
        <button 
          onClick={() => setIsAdmin(!isAdmin)}
          className="text-[10px] text-slate-600 uppercase mt-4 hover:text-slate-400 transition-colors"
        >
          {isAdmin ? "Zatvori admin panel" : "Admin pristup"}
        </button>
      </div>

      {isAdmin && <AdminForm onSuccess={fetchSvirke} />}

      {!location ? (
        <div className="flex flex-col items-center justify-center mt-20">
          <button 
            onClick={askLocation} 
            className="bg-purple-600 hover:bg-purple-500 w-full max-w-xs py-4 rounded-2xl font-bold shadow-lg shadow-purple-900/40 transition-transform active:scale-95"
          >
            PRONAĐI SVIRKE U BLIZINI
          </button>
          {error && <p className="text-red-400 text-xs mt-4">{error}</p>}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Uživo večeras</h2>
          
          {loading ? (
            <p className="text-center text-slate-500 animate-pulse">Učitavam svirke...</p>
          ) : (
            svirke.map(svirka => {
              // OVDE RAČUNAMO DISTANCU ZA SVAKU KARTICU POSEBNO
              const distance = calculateDistance(
                location.lat, 
                location.lng, 
                svirka.lat, 
                svirka.lng
              );

              return (
                <div key={svirka.id} 
                  onClick={() => handleNavigation(svirka.lat, svirka.lng)} 
                  className="bg-slate-800 border border-slate-700 p-4 rounded-3xl flex gap-4 items-center shadow-md 
                            cursor-pointer transition-all duration-200 
                            hover:border-purple-500 hover:bg-slate-700
                            active:scale-95 active:bg-slate-600">
                  <div className="bg-purple-500/20 p-3 rounded-xl text-purple-400 h-fit">
                    <Music size={24} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-lg leading-none mb-1">{svirka.izvodjac}</h3>
                    <p className="text-slate-400 text-sm mb-2">{svirka.lokal} • {svirka.zanr}</p>
                    <span className="bg-slate-700/50 text-slate-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter border border-slate-600">
                            {svirka.grad || "Nepoznato"}
                        </span>
                    
                    {/* Prikaz udaljenosti */}
                    <div className="flex items-center gap-1 text-purple-400 font-bold text-xs">
                      <MapPin size={12} />
                      <span>
                        {distance < 1 
                          ? `${(distance * 1000).toFixed(0)}m` 
                          : `${distance.toFixed(1)}km`} od tebe
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-2">
                    <span className="bg-slate-700 px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 whitespace-nowrap">
                      <Clock size={12}/> {svirka.vreme}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          
          {svirke.length === 0 && !loading && (
            <div className="text-center py-10">
              <p className="text-slate-500">Nema pronađenih svirki u bazi.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;