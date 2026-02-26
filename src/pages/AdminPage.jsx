import React, { useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  collection, doc, getDoc, deleteDoc, onSnapshot, query, orderBy, updateDoc, addDoc 
} from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, ArrowLeft, Loader2, LogOut, Trash2, 
  Edit3, Calendar, MapPin, Clock, Music, PlusCircle, Save, XCircle, Globe 
} from 'lucide-react';

// --- KOMPONENTA FORME ---
const AdminForm = ({ initialData, clearEdit }) => {
  const [formData, setFormData] = useState({
    izvodjac: '', 
    lokal: '', 
    grad: '', 
    zanr: '', 
    vreme: '', 
    datum: '', // NOVO POLJE
    lat: '', 
    lng: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        izvodjac: initialData.izvodjac || '',
        lokal: initialData.lokal || '',
        grad: initialData.grad || '',
        zanr: initialData.zanr || '',
        vreme: initialData.vreme || '',
        datum: initialData.datum || '',
        lat: initialData.lat || '',
        lng: initialData.lng || ''
      });
    } else {
      resetForm();
    }
  }, [initialData]);

  const resetForm = () => {
    setFormData({ 
        izvodjac: '', lokal: '', grad: '', zanr: '', vreme: '', datum: '', lat: '', lng: '' 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (initialData?.id) {
        await updateDoc(doc(db, "dogadjaji", initialData.id), formData);
        alert("Svirka uspešno ažurirana!");
      } else {
        await addDoc(collection(db, "dogadjaji"), formData);
        alert("Nova svirka dodata!");
      }
      resetForm();
      if (clearEdit) clearEdit();
    } catch (err) {
      alert("Greška: " + err.message);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-[2.5rem] space-y-4 shadow-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Izvođač */}
        <div className="relative">
          <Music className="absolute left-4 top-3.5 text-slate-500" size={18} />
          <input name="izvodjac" placeholder="Ime benda" value={formData.izvodjac} onChange={(e) => setFormData({...formData, izvodjac: e.target.value})} required className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 focus:border-purple-500 outline-none text-white transition-all" />
        </div>

        {/* Lokal */}
        <div className="relative">
          <MapPin className="absolute left-4 top-3.5 text-slate-500" size={18} />
          <input name="lokal" placeholder="Lokal" value={formData.lokal} onChange={(e) => setFormData({...formData, lokal: e.target.value})} required className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 focus:border-purple-500 outline-none text-white transition-all" />
        </div>

        {/* --- DATUM (NOVO POLJE) --- */}
        <div className="relative">
          <Calendar className="absolute left-4 top-3.5 text-slate-500" size={18} />
          <input 
            type="date" 
            name="datum" 
            value={formData.datum} 
            onChange={(e) => setFormData({...formData, datum: e.target.value})} 
            required 
            className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 focus:border-purple-500 outline-none text-white transition-all color-scheme-dark"
            style={{ colorScheme: 'dark' }} // Osigurava da kalendar bude taman na desktopu
          />
        </div>

        {/* Vreme/Satnica */}
        <div className="relative">
          <Clock className="absolute left-4 top-3.5 text-slate-500" size={18} />
          <input name="vreme" placeholder="Vreme (npr. 21:00h)" value={formData.vreme} onChange={(e) => setFormData({...formData, vreme: e.target.value})} required className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 focus:border-purple-500 outline-none text-white transition-all" />
        </div>

        <div className="relative">
          <Globe className="absolute left-4 top-3.5 text-slate-500" size={18} />
          <input name="grad" placeholder="Grad" value={formData.grad} onChange={(e) => setFormData({...formData, grad: e.target.value})} required className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 focus:border-purple-500 outline-none text-white transition-all" />
        </div>

        <div className="flex gap-2">
            <input name="lat" placeholder="Lat" value={formData.lat} onChange={(e) => setFormData({...formData, lat: e.target.value})} required className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-3.5 px-4 focus:border-purple-500 outline-none text-white transition-all" />
            <input name="lng" placeholder="Lng" value={formData.lng} onChange={(e) => setFormData({...formData, lng: e.target.value})} required className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-3.5 px-4 focus:border-purple-500 outline-none text-white transition-all" />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={formLoading} className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${initialData ? 'bg-amber-500 text-slate-900' : 'bg-purple-600 text-white'}`}>
          {formLoading ? <Loader2 className="animate-spin" /> : initialData ? <><Save size={20}/> Sačuvaj izmene</> : <><PlusCircle size={20}/> Dodaj svirku</>}
        </button>
        {initialData && (
          <button type="button" onClick={() => { resetForm(); clearEdit(); }} className="px-6 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl transition-all flex items-center gap-2 font-bold uppercase text-[10px]">
            <XCircle size={18} /> Odustani
          </button>
        )}
      </div>
    </form>
  );
};

// --- GLAVNA ADMIN STRANICA ---
const AdminPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [svirke, setSvirke] = useState([]);
  const [editingData, setEditingData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) { navigate('/login'); return; }
      const docSnap = await getDoc(doc(db, "korisnici", currentUser.uid));
      if (docSnap.exists() && docSnap.data().uloga === 'admin') {
        setUser(currentUser);
        setLoading(false);
      } else {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (loading) return;
    // Sortiramo po datumu, tako da admin vidi hronološki
    const q = query(collection(db, "dogadjaji"), orderBy("datum", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSvirke(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [loading]);

  const handleDelete = async (id, izvodjac) => {
    if (window.confirm(`Obriši svirku: ${izvodjac}?`)) {
      await deleteDoc(doc(db, "dogadjaji", id));
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <Loader2 className="animate-spin text-purple-500" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 pb-20 font-sans">
      <div className="max-w-2xl mx-auto">
        <header className="mb-10 pt-6 flex justify-between items-center bg-slate-800/50 p-4 rounded-[2rem] border border-slate-700/50">
          <Link to="/" className="p-3 bg-slate-900 rounded-2xl border border-slate-700 text-slate-400"><ArrowLeft size={20} /></Link>
          <div className="text-center">
            <h1 className="text-xl font-black flex items-center gap-2 uppercase italic text-white"><ShieldCheck className="text-purple-500" /> Admin</h1>
            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">{user.email}</p>
          </div>
          <button onClick={() => signOut(auth)} className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20"><LogOut size={20} /></button>
        </header>

        <main className="space-y-12">
          <section>
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="w-1.5 h-5 bg-purple-500 rounded-full"></div>
              <h2 className="font-black uppercase tracking-widest text-xs text-slate-400">{editingData ? 'Izmena svirke' : 'Nova svirka'}</h2>
            </div>
            <AdminForm initialData={editingData} clearEdit={() => setEditingData(null)} />
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between px-2 mb-4">
              <div className="flex items-center gap-2"><Calendar className="text-purple-500" size={18} /><h2 className="font-black uppercase tracking-widest text-xs text-slate-400">Upravljanje listom</h2></div>
              <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-[10px] font-black border border-slate-700">{svirke.length}</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {svirke.map((s) => (
                <div key={s.id} className="bg-slate-800/30 border border-slate-700/40 p-4 rounded-[2rem] flex items-center justify-between group hover:border-slate-600 transition-all">
                  <div className="flex items-center gap-4 min-w-0">

                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-100 truncate text-sm uppercase">{s.izvodjac}</h3>
                      
                      <div className="flex gap-2 mt-1">
                         <span className="text-[9px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-lg uppercase">{s.datum}</span>
                         <span className="text-[9px] text-purple-400 font-bold uppercase">{s.vreme}</span>
                      </div>
                    </div>
                  </div>
                  <div className='flex flex-col'>
                        <h4 className="font-bold text-slate-100 truncate text-sm">{s.lokal}</h4>
                        <h4 className="font-bold text-slate-100 truncate text-sm">{s.grad}</h4>
                      </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingData(s); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-2.5 bg-slate-800 hover:bg-amber-500/20 text-slate-500 hover:text-amber-500 rounded-xl border border-slate-700 transition-all"><Edit3 size={16} /></button>
                    <button onClick={() => handleDelete(s.id, s.izvodjac)} className="p-2.5 bg-slate-800 hover:bg-red-500/20 text-slate-500 hover:text-red-500 rounded-xl border border-slate-700 transition-all"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;