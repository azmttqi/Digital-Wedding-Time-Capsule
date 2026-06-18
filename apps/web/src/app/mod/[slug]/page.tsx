"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Check, X, Clock, CheckCircle, XCircle } from "lucide-react";
import { getMissionById } from "@/lib/missions";

type Photo = {
  id: string;
  storageKey: string;
  uploaderSessionId: string;
  status: string;
  createdAt: string;
  missionId?: string;
};

export default function ModeratorDashboard({ params }: { params: { slug: string } }) {
  const [isLocked, setIsLocked] = useState(true);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const [pendingPhotos, setPendingPhotos] = useState<Photo[]>([]);
  const [approvedPhotos, setApprovedPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === "1234") { // Hardcoded for this demo, matches backend default
      setIsLocked(false);
    } else {
      setPinError("PIN salah. Coba lagi.");
      setPinInput("");
    }
  };

  const fetchPhotos = async () => {
    if (isLocked) return;
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        axios.get(`http://localhost:3001/photos/${params.slug}?status=PENDING`),
        axios.get(`http://localhost:3001/photos/${params.slug}?status=APPROVED`),
      ]);
      setPendingPhotos(pendingRes.data);
      setApprovedPhotos(approvedRes.data);
    } catch (error) {
      console.error("Gagal mengambil foto:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLocked) {
      setIsLoading(true);
      fetchPhotos();
      const interval = setInterval(fetchPhotos, 5000);
      return () => clearInterval(interval);
    }
  }, [params.slug, isLocked]);

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      if (status === 'APPROVED') {
        const photo = pendingPhotos.find(p => p.id === id);
        if (photo) {
          setPendingPhotos(prev => prev.filter(p => p.id !== id));
          setApprovedPhotos(prev => [photo, ...prev]);
        }
      } else {
        setPendingPhotos(prev => prev.filter(p => p.id !== id));
      }
      await axios.patch(`http://localhost:3001/photos/${id}/status`, { status });
    } catch (error) {
      console.error("Gagal mengupdate status:", error);
      fetchPhotos();
    }
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-sm w-full bg-white rounded-3xl shadow-xl overflow-hidden p-8 border border-champagne/50">
          <h1 className="font-heading text-3xl text-rose mb-2">Akses Moderator</h1>
          <p className="text-gray-500 mb-8 font-body">Masukkan PIN untuk mengelola foto.</p>
          
          <form onSubmit={handlePinSubmit} className="flex flex-col gap-4">
            <input 
              type="password" 
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="••••"
              className="w-full text-center text-3xl tracking-[1em] p-4 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-rose focus:ring-1 focus:ring-rose"
              autoFocus
            />
            {pinError && <p className="text-red-500 text-sm font-body">{pinError}</p>}
            <button 
              type="submit"
              className="w-full bg-rose text-white py-4 px-6 rounded-2xl font-medium hover:bg-opacity-90 transition shadow-md shadow-rose/20 mt-2"
            >
              Masuk Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="min-h-screen bg-cream flex items-center justify-center font-body">Memuat dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-cream p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-heading text-4xl text-rose mb-2">Moderator Dashboard</h1>
        <p className="text-gray-600 font-body mb-8">Acara: {params.slug}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Kolom Pending (Perlu Persetujuan) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-champagne/50">
            <h2 className="font-heading text-2xl text-gray-800 mb-6 flex items-center gap-2">
              <Clock className="text-sage" />
              Menunggu Persetujuan ({pendingPhotos.length})
            </h2>
            
            <div className="flex flex-col gap-4">
              {pendingPhotos.length === 0 ? (
                <p className="text-gray-400 text-center py-10 font-body">Belum ada foto baru.</p>
              ) : (
                pendingPhotos.map((photo) => {
                  const mission = getMissionById(photo.missionId);
                  return (
                  <div key={photo.id} className="bg-gray-50 rounded-2xl p-3 flex gap-4 items-center">
                    <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 relative">
                      <img src={photo.storageKey} alt="Upload" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                      {mission && (
                        <div className="bg-white px-2 py-1 rounded-md text-xs font-medium text-gray-700 flex items-center gap-1 w-fit border border-gray-100">
                          <span>{mission.icon}</span> {mission.text}
                        </div>
                      )}
                      <p className="text-sm text-gray-500 font-body text-xs">Pengunggah: {photo.uploaderSessionId}</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleUpdateStatus(photo.id, 'REJECTED')}
                          className="flex-1 flex justify-center items-center gap-1 bg-red-100 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition"
                        >
                          <XCircle size={16} /> Tolak
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(photo.id, 'APPROVED')}
                          className="flex-1 flex justify-center items-center gap-1 bg-sage text-white py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition"
                        >
                          <CheckCircle size={16} /> Setujui
                        </button>
                      </div>
                    </div>
                  </div>
                )})
              )}
            </div>
          </div>

          {/* Kolom Approved (Disetujui) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-champagne/50">
            <h2 className="font-heading text-2xl text-gray-800 mb-6 flex items-center gap-2">
              <Check className="text-rose" />
              Telah Disetujui ({approvedPhotos.length})
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
              {approvedPhotos.length === 0 ? (
                <p className="text-gray-400 text-center py-10 font-body col-span-2">Belum ada foto yang disetujui.</p>
              ) : (
                approvedPhotos.map((photo) => (
                  <div key={photo.id} className="aspect-square rounded-xl overflow-hidden relative group">
                    <img src={photo.storageKey} alt="Upload" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => handleUpdateStatus(photo.id, 'REJECTED')}
                        className="bg-white text-red-500 p-2 rounded-full"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
