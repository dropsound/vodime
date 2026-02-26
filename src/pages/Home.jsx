import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { db, auth } from '../services/firebase';
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Music, MapPin, Clock, Radio, Star, ShieldCheck, Search, X, Loader2 } from 'lucide-react';
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

  const isFetched = useRef(false);

  useEffect(() => {
    askLocation();
  }, [askLocation]);

  const fetchSvirke = useCallback(async () => {
    if (isFetched.current) return;
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "dogadjaji"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSvirke(data);
      isFetched.current = true;
    } catch (err) {
      console.error("Firebase error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchSvirke(); 
  }, [fetchSvirke]);

  const processedSvirke = useMemo(() => {
    let result = [...svirke];
    result = result.filter(svirka => {
      const matchesSearch = 
        svirka.izvodjac.toLowerCase().includes(searchTerm.toLowerCase()) ||
        svirka.zanr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        svirka.lokal.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFav = showFavoritesOnly ? favorites.includes(svirka.id) : true;
      return matchesSearch && matchesFav;
    });

    if (location) {
      result.sort((a, b) => {
        const distA = calculateDistance(location.lat, location.lng, a.lat, a.lng);
        const distB = calculateDistance(location.lat, location.lng, b.lat, b.lng);
        return distA - distB;
      });
    }
    return result;
  }, [svirke, searchTerm, showFavoritesOnly, favorites, location]);

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
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  return (

    <div className='w-full bg-zink-300 dark:bg-zink-900'>
    
    <div className="max-w-6xl mx-auto p-4 pb-20 font-sans min-h-screen bg-zink-300 text-taupe-100 transition-all">
      
      {/* HEADER: max-w-2xl ga drži centriranim i ne preširokim za search */}
      <header className="mb-10 pt-6 max-w-2xl mx-auto">
        <div className="flex justify-between mb-6">
            <div className='header-logo flex flex-col'>
                <h1 className="text-3xl font-black text-taupe-50 flex items-center gap-2 uppercase tracking-tighter text-left">
                    <Radio className="animate-pulse" /> Vodi me...
                </h1>
                <h1 className="text-3xl font-black text-taupe-50 flex items-center gap-2 uppercase tracking-tighter text-right">
                    ...na svirke
                </h1>

            </div>
          <div className="flex items-center gap-3">
            {/* 1. ADMIN IKONICA (Prikazuje se samo adminu) */}
            {userRole === 'admin' && (
                <Link 
                to="/admin" 
                className="p-2.5 bg-taupe-600/20 text-taupe-400 rounded-2xl border border-taupe-500/30 hover:bg-taupe-600/30 transition-all"
                >
                <ShieldCheck size={20} />
                </Link>
            )}

            {/* 2. KORISNIČKI STATUS */}
            {user ? (
                /* Ako je korisnik ulogovan: Prikazujemo email i Logout opciju */
                <div className="flex items-center gap-3">
                <span className="text-[10px] text-taupe-500 font-bold uppercase tracking-tighter hidden sm:block">
                    Ulogovan kao: {user.email}
                </span>
                <button 
                    onClick={() => auth.signOut()} 
                    className="text-[10px] bg-red-500/10 hover:bg-red-500/20 px-4 py-2.5 rounded-2xl uppercase font-black border border-red-500/20 tracking-widest text-red-400 transition-all"
                >
                    Odjava
                </button>
                </div>
            ) : (
                /* Ako korisnik NIJE ulogovan: Prikazujemo Prijava i Registracija */
                <div className="flex items-center gap-2">
                <Link 
                    to="/login" 
                    className="text-[10px] text-taupe-400 hover:text-white px-3 py-2.5 uppercase font-black tracking-widest transition-all"
                >
                    Prijava
                </Link>
                
                <Link 
                    to="/registracija" 
                    className="text-[10px] bg-taupe-800 hover:bg-taupe-700 px-4 py-2.5 rounded-2xl uppercase font-black border border-taupe-700 tracking-widest text-taupe-300 transition-all shadow-lg"
                >
                    Registracija
                </Link>
                </div>
            )}
            </div>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-taupe-500" size={18} />
            <input 
              type="text"
              placeholder="Traži bend, lokal ili žanr..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-taupe-800/40 border border-taupe-700/50 
              rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none 
              focus:border-taupe-500 focus:bg-taupe-800/80 transition-all text-white"
            />
            {searchTerm && <X onClick={() => setSearchTerm('')} 
            className="absolute right-4 top-3.5 text-taupe-500 cursor-pointer" size={18} />}
          </div>
          
          {user && (
            <button 
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`w-full py-3 rounded-2xl text-[10px] font-black 
                uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border ${
                showFavoritesOnly 
                ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' 
                : 'bg-taupe-800/20 border-taupe-700/50 text-taupe-500 hover:border-taupe-600'
              }`}
            >
              
              {showFavoritesOnly ? 'Prikazujem favorite' : 'Prikaži favorite'}
            </button>
          )}
        </div>
      </header>

      {/* LISTA SADRŽAJA */}
      <main>
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-taupe-500" size={32} />
            <p className="text-taupe-600 text-[10px] font-black uppercase tracking-[0.3em]">Skeniram bazu...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-end px-4 mb-6">
              <h2 className="text-[10px] font-black text-taupe-500 uppercase tracking-[0.1em]">
                {showFavoritesOnly ? 'Sačuvano' : 'Svirke u blizini'}
              </h2>
              <span className="text-[9px] text-taupe-600 font-bold bg-taupe-800/30 px-2 py-0.5 rounded-lg border border-taupe-700/30">
                {processedSvirke.length} REZULTATA
              </span>
            </div>

            {processedSvirke.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {processedSvirke.map(svirka => {
                  const distance = location ? calculateDistance(location.lat, location.lng, svirka.lat, svirka.lng) : null;
                  const isFav = favorites.includes(svirka.id);
                  return (

                    /*CARD==========================*/
                    <div 
                      key={svirka.id} 
                      onClick={() => handleNavigation(svirka.lat, svirka.lng)}
                      className="bg-taupe-800/40 backdrop-blur-md border 
                      border-taupe-700/50 p-5 
                      flex flex-col justify-between gap-4 hover:border-taupe-200/40 
                      transition-all active:scale-[0.98] group cursor-pointer shadow-lg shadow-black/20"
                    >
                      <div className="flex gap-4 items-start">
                        <div className="bg-gradient-to-br from-taupe-600/20 to-taupe-800 p-4 
                        rounded-2xl text-taupe-400 group-hover:scale-110 transition-transform shrink-0">
                          <Music size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg leading-tight text-taupe-100 
                          group-hover:text-taupe-400 transition-colors line-clamp-2">
                            {svirka.izvodjac}
                          </h3>
                          <p className="text-taupe-400 text-m mt-1 font-medium">{svirka.lokal}</p>
                          
                        </div>
                        <div>
                            <p className="text-taupe-400 text-xs mt-1 font-medium">{svirka.zanr}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-4 border-t border-taupe-700/30">
                        <div className="space-y-1">
                           <div className="flex items-center gap-2">
                              <span className="text-[9px] bg-taupe-900/50 text-taupe-500 px-2 py-0.5 
                              rounded-md font-bold uppercase border border-taupe-700/30">{svirka.grad}</span>
                              {distance !== null && (
                                <div className="flex items-center gap-1 text-taupe-400 font-black text-[10px]">
                                  <MapPin size={10} /> {distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`}
                                </div>
                              )}
                           </div>
                           <div className="flex items-center gap-1.5 text-[10px] font-black text-taupe-300">
                              <Clock size={12} className="text-taupe-500" /> {svirka.vreme}
                           </div>
                        </div>

                        <button 
                          onClick={(e) => toggleFavorite(e, svirka.id)} 
                          className={`p-3 rounded-2xl transition-all ${isFav ? 'bg-orange-400/10' : 'bg-taupe-900/50 hover:bg-orange-400/10'}`}
                        >
                          <Star size={20} className={isFav ? 'fill-orange-300 text-orange-300' : 'text-taupe-400'} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-taupe-800/50 rounded-[2.5rem]">
                <p className="text-taupe-600 text-[10px] font-black uppercase tracking-widest">Nema rezultata</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
    </div>
  );
};

export default Home;