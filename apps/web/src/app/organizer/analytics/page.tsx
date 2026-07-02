"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function EventAnalytics() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/events`);
        setEvents(res.data);
      } catch (error) {
        console.error("Gagal memuat data event:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Aggregated Stats
  const totalEvents = events.length;
  const liveEvents = events.filter(e => e.status === 'LIVE').length;
  const totalPhotos = events.reduce((sum, e) => sum + (e.photos ? e.photos.length : 0), 0);
  // Estimate guests or use photos as proxy if guest list is not loaded here
  const avgPhotosPerEvent = totalEvents > 0 ? Math.round(totalPhotos / totalEvents) : 0;

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-headline-lg font-headline-lg text-on-surface">Event Analytics</h1>
            <p className="text-on-surface-variant">Laporan performa seluruh acara yang ditangani EO</p>
          </div>
          <button onClick={() => router.push('/')} className="px-4 py-2 bg-surface-container rounded-full text-on-surface hover:bg-surface-container-high transition flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Dashboard
          </button>
        </header>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          </div>
        ) : (
          <>
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-3xl text-primary mb-2">event_available</span>
                <p className="text-display-md font-bold text-primary">{totalEvents}</p>
                <p className="text-label-md text-on-surface-variant uppercase tracking-widest mt-1">Total Acara</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 w-full h-1 bg-secondary"></div>
                <span className="material-symbols-outlined text-3xl text-secondary mb-2">podcasts</span>
                <p className="text-display-md font-bold text-secondary">{liveEvents}</p>
                <p className="text-label-md text-on-surface-variant uppercase tracking-widest mt-1">Acara LIVE</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-3xl text-tertiary mb-2">photo_library</span>
                <p className="text-display-md font-bold text-tertiary">{totalPhotos}</p>
                <p className="text-label-md text-on-surface-variant uppercase tracking-widest mt-1">Total Foto Klien</p>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-3xl text-primary mb-2">trending_up</span>
                <p className="text-display-md font-bold text-primary">{avgPhotosPerEvent}</p>
                <p className="text-label-md text-on-surface-variant uppercase tracking-widest mt-1">Rata-rata Foto/Acara</p>
              </div>
            </div>

            {/* Event Performance Table */}
            <div className="bg-surface-container-lowest rounded-[24px] border border-outline-variant/30 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center">
                <h2 className="text-headline-md font-headline-md">Breakdown Per Acara</h2>
                <span className="text-label-sm text-on-surface-variant">Diurutkan berdasarkan foto terbanyak</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container/30 text-on-surface-variant font-label-md uppercase tracking-widest">
                    <tr>
                      <th className="p-4 pl-6">Acara</th>
                      <th className="p-4">Tanggal</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right pr-6">Engagement (Foto)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {[...events].sort((a, b) => (b.photos?.length || 0) - (a.photos?.length || 0)).map((event) => (
                      <tr key={event.slug} className="hover:bg-surface-container-low transition">
                        <td className="p-4 pl-6 font-bold text-on-surface">{event.coupleName}</td>
                        <td className="p-4 text-on-surface-variant">{new Date(event.date || Date.now()).toLocaleDateString('id-ID')}</td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest ${
                            event.status === 'LIVE' ? 'bg-secondary-container text-on-secondary-container' :
                            event.status === 'ENDED' ? 'bg-surface-variant text-on-surface-variant' :
                            'bg-primary-container text-on-primary-container'
                          }`}>
                            {event.status}
                          </span>
                        </td>
                        <td className="p-4 text-right pr-6">
                          <div className="flex items-center justify-end gap-2 text-tertiary">
                            <span className="font-bold">{event.photos ? event.photos.length : 0}</span>
                            <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {events.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-on-surface-variant">Belum ada data acara.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
