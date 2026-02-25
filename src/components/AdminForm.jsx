import React, { useState } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';

const AdminForm = ({ onSuccess }) => { // Jedna jasna definicija
  const [formData, setFormData] = useState({
    izvodjac: '',
    lokal: '',
    grad: '',
    zanr: '',
    vreme: '',
    lat: '',
    lng: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "dogadjaji"), {
        ...formData,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng)
      });
      alert("Svirka uspešno dodata!");
      // Resetovanje forme
      setFormData({ izvodjac: '', lokal: '',grad: '', zanr: '', vreme: '', lat: '', lng: '' });
      
      // Ako smo prosledili funkciju za osvežavanje iz App.jsx, pozovi je
      if (onSuccess) onSuccess(); 
    } catch (err) {
      console.error("Greška pri unosu:", err);
      alert("Greška pri čuvanju u bazu.");
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 my-8 shadow-2xl">
      <h2 className="text-xl font-bold mb-4 text-purple-400">Dodaj novu svirku</h2>
      <form onSubmit={handleSubmit} className="space-y-4 text-white">
        <input 
          placeholder="Izvođač" 
          className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-purple-500 outline-none"
          value={formData.izvodjac}
          onChange={(e) => setFormData({...formData, izvodjac: e.target.value})}
          required
        />
        <input 
          placeholder="Lokal" 
          className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-purple-500 outline-none"
          value={formData.lokal}
          onChange={(e) => setFormData({...formData, lokal: e.target.value})}
          required
        />
        <input 
            placeholder="Grad (npr. Beograd)" 
            className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700"
            value={formData.grad}
            onChange={(e) => setFormData({...formData, grad: e.target.value})}
            required
            />
        <div className="grid grid-cols-2 gap-4">
          <input 
            placeholder="Žanr" 
            className="p-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-purple-500 outline-none"
            value={formData.zanr}
            onChange={(e) => setFormData({...formData, zanr: e.target.value})}
          />
          <input 
            placeholder="Vreme (npr. 21:00h)" 
            className="p-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-purple-500 outline-none"
            value={formData.vreme}
            onChange={(e) => setFormData({...formData, vreme: e.target.value})}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 text-slate-400 text-sm">
          <div>
            <label className="block mb-1 ml-1 text-xs uppercase font-bold">Latituda</label>
            <input 
              placeholder="44.39" 
              type="number" step="any"
              className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white"
              value={formData.lat}
              onChange={(e) => setFormData({...formData, lat: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block mb-1 ml-1 text-xs uppercase font-bold">Longituda</label>
            <input 
              placeholder="20.45" 
              type="number" step="any"
              className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white"
              value={formData.lng}
              onChange={(e) => setFormData({...formData, lng: e.target.value})}
              required
            />
          </div>
        </div>
        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl font-bold transition-all transform active:scale-95 shadow-lg shadow-green-900/20">
          OBJAVI SVIRKU
        </button>
      </form>
    </div>
  );
};

export default AdminForm;