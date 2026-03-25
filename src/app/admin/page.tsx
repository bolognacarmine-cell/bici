'use client'

import { useState } from 'react';
import { updateData } from './actions';
import dataInitial from '@/data.json';
import Link from 'next/link';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';

export default function AdminPage() {
  const [data, setData] = useState(dataInitial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateData(data);
      setMessage('Modifiche salvate con successo!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Errore durante il salvataggio.');
    } finally {
      setSaving(false);
    }
  };

  const addPromotion = () => {
    const newPromotions = [...(data.promotions || []), { title: '', description: '', image: '/bici1.jpg' }];
    setData({ ...data, promotions: newPromotions });
  };

  const removePromotion = (index: number) => {
    const newPromotions = data.promotions.filter((_, i) => i !== index);
    setData({ ...data, promotions: newPromotions });
  };

  const updatePromotion = (index: number, field: string, value: string) => {
    const newPromotions = [...data.promotions];
    newPromotions[index] = { ...newPromotions[index], [field]: value };
    setData({ ...data, promotions: newPromotions });
  };

  const addProduct = () => {
    const newProducts = [...(data.products || []), { name: '', price: '', description: '', image: '/bici1.jpg' }];
    setData({ ...data, products: newProducts });
  };

  const removeProduct = (index: number) => {
    const newProducts = data.products.filter((_, i) => i !== index);
    setData({ ...data, products: newProducts });
  };

  const updateProduct = (index: number, field: string, value: string) => {
    const newProducts = [...data.products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setData({ ...data, products: newProducts });
  };

  return (
    <div className="min-h-screen bg-zinc-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-800">Pannello Admin</h1>
            <p className="text-zinc-500">Gestione Promozioni e Prodotti</p>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="px-4 py-2 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors">
              Torna al sito
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-[#e67e22] text-white font-bold rounded-lg hover:bg-[#d35400] disabled:opacity-50 transition-all shadow-md"
            >
              {saving ? 'Salvataggio...' : 'Salva Modifiche'}
            </button>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg text-center font-medium ${message.includes('Errore') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        <div className="space-y-12 pb-20">
          {/* Promozioni Section */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-xl font-bold text-zinc-800">Promozioni in corso</h2>
              <button
                onClick={addPromotion}
                className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-bold"
              >
                <Plus size={16} /> Aggiungi Promozione
              </button>
            </div>
            
            <div className="space-y-6">
              {data.promotions?.map((promo, idx) => (
                <div key={idx} className="p-6 border border-zinc-100 rounded-xl bg-zinc-50 relative group">
                  <button
                    onClick={() => removePromotion(idx)}
                    className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                      <div className="aspect-video bg-zinc-200 rounded-lg overflow-hidden flex items-center justify-center relative">
                        <img src={promo.image} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                           <ImageIcon className="text-white" />
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="URL Immagine"
                        value={promo.image}
                        onChange={(e) => updatePromotion(idx, 'image', e.target.value)}
                        className="mt-2 w-full px-3 py-1 text-xs border border-zinc-200 rounded outline-none"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Titolo Promo</label>
                        <input
                          type="text"
                          value={promo.title}
                          onChange={(e) => updatePromotion(idx, 'title', e.target.value)}
                          className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-[#e67e22] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Descrizione</label>
                        <textarea
                          value={promo.description}
                          onChange={(e) => updatePromotion(idx, 'description', e.target.value)}
                          className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-[#e67e22] outline-none h-20"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {(!data.promotions || data.promotions.length === 0) && (
                <p className="text-center text-zinc-400 py-8 italic">Nessuna promozione attiva</p>
              )}
            </div>
          </section>

          {/* Prodotti Section */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-xl font-bold text-zinc-800">Catalogo Prodotti</h2>
              <button
                onClick={addProduct}
                className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-bold"
              >
                <Plus size={16} /> Aggiungi Prodotto
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.products?.map((product, idx) => (
                <div key={idx} className="p-6 border border-zinc-100 rounded-xl bg-zinc-50 relative group">
                  <button
                    onClick={() => removeProduct(idx)}
                    className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="space-y-4">
                    <div className="aspect-square bg-zinc-200 rounded-lg overflow-hidden flex items-center justify-center relative">
                      <img src={product.image} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                         <ImageIcon className="text-white" />
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="URL Immagine"
                      value={product.image}
                      onChange={(e) => updateProduct(idx, 'image', e.target.value)}
                      className="w-full px-3 py-1 text-xs border border-zinc-200 rounded outline-none"
                    />
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Nome Prodotto</label>
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => updateProduct(idx, 'name', e.target.value)}
                        className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-[#e67e22] outline-none font-bold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Prezzo</label>
                        <input
                          type="text"
                          value={product.price}
                          onChange={(e) => updateProduct(idx, 'price', e.target.value)}
                          className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-[#e67e22] outline-none text-[#e67e22] font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Descrizione Breve</label>
                        <input
                          type="text"
                          value={product.description}
                          onChange={(e) => updateProduct(idx, 'description', e.target.value)}
                          className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-[#e67e22] outline-none text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {(!data.products || data.products.length === 0) && (
              <p className="text-center text-zinc-400 py-8 italic">Nessun prodotto in catalogo</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
