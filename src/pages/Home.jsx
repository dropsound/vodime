import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { db, auth } from '../services/firebase';
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Music, MapPin, Clock, Radio, Heart, ShieldCheck, Search, X, Loader2 } from 'lucide-react';
import { useLocation } from '../hooks/useLocation';
import { calculateDistance } from '../utils/distance';
import { Link } from 'react-router-dom';

const Home = () => {
  const { location, error, askLocation } = useLocation();
  const [svirke, setSvirke] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('korisnik');
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // 1. "KOČNICA" ZA FIREBASE - Ref ne izaziva re-render i čuva stanje
  const isFetched = useRef(false);

  // 2. AUTOMATSKO POKRETANJE LOKACIJE (Samo jednom pri mount-u)
  useEffect(() => {
    askLocation();
  }, [askLocation]);

  // 3. FETCH PODATAKA (Poziva se samo jednom bez obzira na promenu lokacije)
  const fetchSvirke = useCallback(async () => {
    if (isFetched.current) return; // Ako smo već jednom povukli podatke, izađi
    
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "dogadjaji"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSvirke(data);
      isFetched.current = true; // Markiraj da je gotovo
    } catch (err) {
      console.error("Firebase error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchSvirke(); 
  }, [fetchSvirke]);

  // 4. SORTIRANJE I FILTRIRANJE (Sve se dešava u memoriji, bez poziva bazi)
  const processedSvirke = useMemo(() => {
    let result = [...svirke];

    // Prvo filtriranje
    result = result.filter(svirka => {
      const matchesSearch = 
        svirka.izvodjac.toLowerCase().includes(searchTerm.toLowerCase()) ||
        svirka.zanr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        svirka.lokal.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFav = showFavoritesOnly ? favorites.includes(svirka.id) : true;
      return matchesSearch && matchesFav;
    });

    // Zatim sortiranje po lokaciji (ako je dostupna)
    if (location) {
      result.sort((a, b) => {
        const distA = calculateDistance(location.lat, location.lng, a.lat, a.lng);
        const distB = calculateDistance(location.lat, location.lng, b.lat, b.lng);
        return distA - distB;
      });
    }

    return result;
  }, [svirke, searchTerm, showFavoritesOnly, favorites, location]);

  // 5. AUTH I FAVORITI
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "korisnici", currentUser.uid));
          if (userDoc.exists()) {
            setFavorites(userDoc.data().omiljeni || []);
            setUserRole(userDoc.data().uloga || 'korisnik');
          }
        } catch (err) { console.error(err); }
      } else {
        setFavorites([]);
        setUserRole('korisnik');
      }
    });
    return () => unsubscribe();
  }, []);

  const toggleFavorite = async (e, svirkaId) => {
    e.stopPropagation();
    if (!user) return alert("Uloguj se za favorite!");
    const userRef = doc(db, "korisnici", user.uid);
    try {
      if (favorites.includes(svirkaId)) {
        await updateDoc(userRef, { omiljeni: arrayRemove(svirkaId) });
        setFavorites(prev => prev.filter(id => id !== svirkaId));
      } else {
        await updateDoc(userRef, { omiljeni: arrayUnion(svirkaId) });
        setFavorites(prev => [...prev, svirkaId]);
      }
    } catch (err) { console.error(err); }
  };

  const handleNavigation = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20 font-sans min-h-screen bg-slate-900 text-slate-100">
      {/* HEADER */}
      <header className="mb-6 pt-6">
        <div className="flex justify-between items-center mb-6">
          <div className="w-10"></div>
          <h1 className="text-3xl font-black text-purple-500 flex items-center gap-2 uppercase tracking-tighter italic">
            <Radio className="animate-pulse" /> Vodi me da slušam
          </h1>
          <div className="flex items-center gap-2">
            {userRole === 'admin' && (
              <Link to="/admin" className="p-2.5 bg-purple-600/20 text-purple-400 rounded-2xl border border-purple-500/30 hover:bg-purple-600/30 transition-all">
                <ShieldCheck size={20} />
              </Link>
            )}
            {user ? (
              <button onClick={() => auth.signOut()} className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center font-bold text-xs border border-slate-700 text-slate-400 hover:border-red-500/50 transition-all">
                {user.email[0].toUpperCase()}
              </button>
            ) : (
              <Link to="/login" className="text-[10px] bg-slate-800 px-4 py-2.5 rounded-2xl uppercase font-black border border-slate-700 tracking-widest text-slate-300">Login</Link>
            )}
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Traži bend, lokal ili žanr..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-purple-500 focus:bg-slate-800/80 transition-all text-white"
            />
            {searchTerm && <X onClick={() => setSearchTerm('')} className="absolute right-4 top-3.5 text-slate-500 cursor-pointer" size={18} />}
          </div>
          
          {user && (
            <button 
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border ${
                showFavoritesOnly 
                ? 'bg-red-500/20 border-red-500/50 text-red-400' 
                : 'bg-slate-800/20 border-slate-700/50 text-slate-500 hover:border-slate-600'
              }`}
            >
              <Heart size={14} className={showFavoritesOnly ? 'fill-red-500' : ''} />
              {showFavoritesOnly ? 'Prikazujem favorite' : 'Prikaži samo moje svirke'}
            </button>
          )}
        </div>
      </header>

      {/* LISTA SADRŽAJA */}
      <main className="space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-purple-500" size={32} />
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">Skeniram bazu...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-end px-2 mb-2">
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                {showFavoritesOnly ? 'Sačuvano' : 'Svirke u blizini'}
              </h2>
              <span className="text-[9px] text-slate-600 font-bold bg-slate-800/30 px-2 py-0.5 rounded-lg border border-slate-700/30">
                {processedSvirke.length} REZULTATA
              </span>
            </div>

            {processedSvirke.length > 0 ? (
              processedSvirke.map(svirka => {
                const distance = location ? calculateDistance(location.lat, location.lng, svirka.lat, svirka.lng) : null;
                const isFav = favorites.includes(svirka.id);
                return (
                  <div 
                    key={svirka.id} 
                    onClick={() => handleNavigation(svirka.lat, svirka.lng)}
                    className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-4 rounded-[2rem] flex gap-4 items-center hover:border-purple-500/40 transition-all active:scale-[0.98] group cursor-pointer"
                  >
                    <div className="bg-gradient-to-br from-purple-600/20 to-slate-800 p-4 rounded-2xl text-purple-400 group-hover:scale-110 transition-transform">
                      <Music size={24} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <h3 className="font-bold text-lg truncate text-slate-100 group-hover:text-purple-400 transition-colors">{svirka.izvodjac} • {svirka.zanr}</h3>
                      <p className="text-slate-400 text-xs truncate mb-2">{svirka.lokal}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] bg-slate-900/50 text-slate-500 px-2 py-0.5 rounded-md font-bold uppercase border border-slate-700/30">{svirka.grad}</span>
                        {distance !== null && (
                          <div className="flex items-center gap-1 text-purple-400 font-black text-[10px]">
                            <MapPin size={10} /> {distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-700 text-[10px] font-black text-slate-200">
                        <Clock size={12} className="text-purple-500" /> {svirka.vreme}
                      </div>
                      <button 
                        onClick={(e) => toggleFavorite(e, svirka.id)} 
                        className={`p-2.5 rounded-full transition-all ${isFav ? 'bg-red-500/10' : 'bg-slate-900/50 hover:bg-red-500/10'}`}
                      >
                        <Heart size={18} className={isFav ? 'fill-red-500 text-red-500' : 'text-slate-700'} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-slate-800/50 rounded-[2.5rem]">
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Nema rezultata</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Home;