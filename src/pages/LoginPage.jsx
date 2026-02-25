import React, { useState } from 'react';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Loader2, ArrowLeft, Radio } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Prijava na Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Provera uloge u Firestore bazi
      const userDoc = await getDoc(doc(db, "korisnici", user.uid));
      
      if (userDoc.exists() && userDoc.data().uloga === 'admin') {
        navigate('/admin'); // Ako je admin, šalji ga u kontrolni panel
      } else {
        navigate('/'); // Ako je običan korisnik, šalji ga na početnu
      }
    } catch (err) {
      console.error(err);
      setError("Pogrešan email ili lozinka. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center p-6 font-sans">
      <div className="max-w-sm mx-auto w-full">
        
        {/* Logo / Povratak */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-purple-400 transition-colors mb-6 text-xs font-bold uppercase tracking-widest">
            <ArrowLeft size={16} /> Nazad na svirke
          </Link>
          <div className="flex justify-center mb-4">
             <div className="p-4 bg-purple-500/10 rounded-3xl border border-purple-500/20 text-purple-500">
                <Radio size={40} className="animate-pulse" />
             </div>
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Prijava</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">Pristupite svom nalogu</p>
        </div>

        {/* Forma */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-slate-500" size={20} />
            <input 
              type="email"
              placeholder="Email adresa"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500 transition-all shadow-inner"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-500" size={20} />
            <input 
              type="password"
              placeholder="Lozinka"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500 transition-all shadow-inner"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold p-4 rounded-2xl text-center">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-purple-900/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Prijavi se"}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-600 text-[10px] uppercase font-bold tracking-[0.2em]">
          Vodi me • Sigurna prijava
        </p>
      </div>
    </div>
  );
};

export default LoginPage;