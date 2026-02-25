import React, { useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Loader2, LogOut } from 'lucide-react';
import AdminForm from '../components/AdminForm';

const AdminPage = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        // AKO SE ODJAVI: Šaljemo ga na Home ili Login, a ne renderujemo formu ovde
        navigate('/login', { replace: true });
        return;
      }

      try {
        const docRef = doc(db, "korisnici", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().uloga === 'admin') {
          setUser(currentUser);
          setUserRole('admin');
          setLoading(false);
        } else {
          // ULOGOVAN JE, ALI NIJE ADMIN: Šalji ga na Home
          navigate('/', { replace: true });
        }
      } catch (err) {
        console.error("Greška pri autorizaciji:", err);
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    // Navigacija će se odraditi automatski unutar onAuthStateChanged
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-purple-500" size={40} />
        <p className="text-slate-500 uppercase text-[10px] tracking-[0.3em] font-black">Provera pristupa...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 pb-20 font-sans">
      <div className="max-w-2xl mx-auto">
        
        {/* ADMIN HEADER */}
        <header className="mb-10 pt-6">
          <div className="flex justify-between items-start mb-8">
            <Link 
              to="/" 
              className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700 transition-all text-slate-400 hover:text-white"
            >
              <ArrowLeft size={20} />
            </Link>

            <div className="text-center">
              <h1 className="text-2xl font-black text-white flex justify-center items-center gap-2 uppercase tracking-tighter italic">
                <ShieldCheck className="text-purple-500" /> Admin Panel
              </h1>
              <p className="text-[9px] text-slate-500 uppercase tracking-[0.3em] mt-1 font-bold">Upravljanje događajima</p>
            </div>

            <button 
              onClick={handleLogout}
              className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-2xl border border-red-500/20 transition-all text-red-500"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* GLAVNI SADRŽAJ (AdminForma + Lista za brisanje) */}
        <main className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <AdminForm />
          
          {/* Ovde ćemo dodati listu za brisanje svirki u sledećem koraku */}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;