"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VendorCRM() {
  const router = useRouter();
  const [vendors, setVendors] = useState([
    { id: 1, name: "Cahaya Photography", category: "Dokumentasi", phone: "081234567890", rating: 4.8 },
    { id: 2, name: "Lezat Catering", category: "Konsumsi", phone: "089876543210", rating: 4.5 },
    { id: 3, name: "Harmoni Music", category: "Hiburan", phone: "085678901234", rating: 4.9 },
    { id: 4, name: "Indah Decoration", category: "Dekorasi", phone: "081122334455", rating: 4.6 },
  ]);

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-headline-lg font-headline-lg text-on-surface">Vendor CRM</h1>
            <p className="text-on-surface-variant">Direktori mitra kerja & vendor</p>
          </div>
          <button onClick={() => router.push('/')} className="px-4 py-2 bg-surface-container rounded-full text-on-surface hover:bg-surface-container-high transition flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Dashboard
          </button>
        </header>

        <div className="bg-surface-container-lowest rounded-[24px] border border-outline-variant/30 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container/50 text-on-surface-variant font-label-md uppercase tracking-widest border-b border-outline-variant/30">
                <tr>
                  <th className="p-6">Nama Vendor</th>
                  <th className="p-6">Kategori</th>
                  <th className="p-6">Kontak</th>
                  <th className="p-6">Rating</th>
                  <th className="p-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-surface-container-low transition">
                    <td className="p-6 font-bold text-on-surface">{vendor.name}</td>
                    <td className="p-6">
                      <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-label-sm">
                        {vendor.category}
                      </span>
                    </td>
                    <td className="p-6 text-on-surface-variant">{vendor.phone}</td>
                    <td className="p-6">
                      <div className="flex items-center gap-1 text-tertiary">
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="font-bold">{vendor.rating}</span>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <button className="text-primary hover:bg-primary-container p-2 rounded-lg transition" title="Hubungi">
                        <span className="material-symbols-outlined">call</span>
                      </button>
                      <button className="text-secondary hover:bg-secondary-container p-2 rounded-lg transition" title="Kirim Pesan">
                        <span className="material-symbols-outlined">chat</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
