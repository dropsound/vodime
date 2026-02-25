import React, { useState } from 'react';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { UserPlus, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Kreiramo korisnika u Authentication delu
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. POVEZIVANJE SA BAZOM: Kreiramo dokument u kolekciji "korisnici"
      // Koristimo user.uid kao ID dokumenta da bismo lakše povezali podatke
      await setDoc(doc(db, "korisnici", user.uid), {
        email: user.email,
        uloga: 'korisnik',
        omiljeni: [], // Ovde ćemo kasnije dodavati ID-eve svirki
        datumRegistracije: new Date().toISOString()
      });

      console.log("Korisnik uspešno registrovan i ubačen u bazu!");
      navigate('/'); // Vodimo ga na početnu stranicu
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Ovaj email je već u upotrebi.');
      } else {
        setError('Greška: Lozinka mora imati bar 6 karaktera.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl max-w-sm w-full relative">
        
        <Link to="/" className="absolute top-4 left-4 text-slate-500 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>

        <div className="flex justify-center mb-6 text-purple-500 bg-purple-500/10 w-16 h-16 items-center rounded-2xl mx-auto border border-purple-500/20">
          <UserPlus size={32} />
        </div>
        
        <h2 className="text-2xl font-black mb-2 text-center tracking-tight">KREIRAJ NALOG</h2>
        <p className="text-slate-400 text-center text-xs mb-8 uppercase tracking-widest">Pridruži se ekipi</p>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
            <input 
              type="email" placeholder="Email adresa" required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-purple-500 focus:outline-none transition-all text-sm"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
            <input 
              type="password" placeholder="Lozinka (min. 6 karaktera)" required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-purple-500 focus:outline-none transition-all text-sm"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-400 text-xs text-center font-bold">{error}</p>}

          <button 
            type="submit" disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 py-3 rounded-xl font-black transition-all active:scale-95 flex justify-center items-center gap-2 shadow-lg shadow-purple-900/20"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "REGISTRUJ SE"}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-500 text-xs">
          Već imaš nalog? <Link to="/login" className="text-purple-400 hover:underline">Prijavi se</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;