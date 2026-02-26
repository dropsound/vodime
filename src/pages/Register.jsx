import React, { useState } from 'react';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { UserPlus, Mail, Lock, Loader2, ArrowLeft, UserCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nadimak, setNadimak] = useState(''); // Novo stanje za nadimak
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Snimamo nadimak u bazu pod tim UID-om
      await setDoc(doc(db, "korisnici", user.uid), {
        email: user.email,
        nadimak: nadimak, // Čuvamo nadimak
        uloga: 'korisnik',
        omiljeni: [],
        datumRegistracije: new Date().toISOString()
      });

      navigate('/'); 
    } catch (err) {
      console.error(err);
      setError('Greška pri registraciji. Proverite podatke.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 font-sans">
      <div className="bg-slate-800 border border-slate-700 p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full relative">
        
        <Link to="/" className="absolute top-6 left-6 text-slate-500 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>

        <div className="flex justify-center mb-6 text-purple-500 bg-purple-500/10 w-16 h-16 items-center rounded-2xl mx-auto border border-purple-500/20">
          <UserPlus size={32} />
        </div>
        
        <h2 className="text-2xl font-black mb-1 text-center tracking-tight">PRIDRUŽI SE</h2>
        <p className="text-slate-500 text-center text-[10px] mb-8 uppercase tracking-[0.2em] font-bold">Kreiraj svoj profil</p>
        
        <form onSubmit={handleRegister} className="space-y-4">
          {/* POLJE ZA NADIMAK */}
          <div className="relative">
            <UserCircle className="absolute left-3 top-3.5 text-slate-500" size={18} />
            <input 
              type="text" placeholder="Tvoj nadimak" required
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-900 border border-slate-700 focus:border-purple-500 focus:outline-none transition-all text-sm"
              onChange={(e) => setNadimak(e.target.value)}
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
            <input 
              type="email" placeholder="Email adresa" required
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-900 border border-slate-700 focus:border-purple-500 focus:outline-none transition-all text-sm"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
            <input 
              type="password" placeholder="Lozinka (min. 6 karaktera)" required
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-900 border border-slate-700 focus:border-purple-500 focus:outline-none transition-all text-sm"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-400 text-[10px] text-center font-bold uppercase tracking-wider">{error}</p>}

          <button 
            type="submit" disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 py-4 rounded-2xl font-black transition-all active:scale-95 flex justify-center items-center gap-2 shadow-lg shadow-purple-900/20 uppercase tracking-widest text-xs"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Završi registraciju"}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 text-[10px] font-bold uppercase tracking-widest">
          Imaš nalog? <Link to="/login" className="text-purple-400 hover:text-purple-300">Prijava</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;