"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, QrCode, Scan, XCircle } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import ThemeInjector from "@/components/ThemeInjector";

export default function SouvenirScanner({ params }: { params: { slug: string } }) {
  const [isLocked, setIsLocked] = useState(true);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; name?: string; pax?: number } | null>(null);
  
  // Manual Fallback List
  const [unclaimedGuests, setUnclaimedGuests] = useState<any[]>([]);

  const fetchUnclaimed = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/guestbook/${params.slug}`);
      const unclaimed = res.data.filter((g: any) => !g.souvenirClaimed);
      setUnclaimedGuests(unclaimed);
    } catch(err) {
      console.error(err);
    }
  };

  const handleManualClaim = async (id: string, name: string, pax: number) => {
    try {
      await axios.patch(`http://localhost:3001/guestbook/entry/${id}/claim`);
      setScanResult({
        success: true,
        message: "Berhasil Diklaim Manual!",
        name: name,
        pax: pax
      });
      fetchUnclaimed();
      setTimeout(() => setScanResult(null), 4000);
    } catch(err) {
      alert("Gagal klaim manual.");
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`http://localhost:3001/events/${params.slug}/verify`, {
        role: "souvenir",
        pin: pinInput
      });
      if (res.data.success) {
        setIsLocked(false);
        fetchUnclaimed();
      }
    } catch (err) {
      setPinError("PIN salah. Coba lagi.");
      setPinInput("");
    }
  };

  useEffect(() => {
    if (isLocked) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
      false
    );

    const onScanSuccess = async (decodedText: string) => {
      // Pause scanning while processing
      scanner.pause();
      
      try {
        const checkRes = await axios.get(`http://localhost:3001/guestbook/entry/${decodedText}`);
        const entry = checkRes.data;

        if (!entry) {
          setScanResult({ success: false, message: "QR Code tidak dikenal!" });
        } else if (entry.souvenirClaimed) {
          setScanResult({ 
            success: false, 
            message: `Souvenir sudah pernah diambil oleh ${entry.name} pada ${new Date(entry.createdAt).toLocaleString('id-ID')}` 
          });
          // Claim it!
          await axios.patch(`http://localhost:3001/guestbook/entry/${decodedText}/claim`);
          setScanResult({
            success: true,
            message: "Berhasil Diklaim!",
            name: entry.name,
            pax: entry.attendanceCount
          });
          fetchUnclaimed();
        }
      } catch (error) {
        console.error("Scan error", error);
        setScanResult({ success: false, message: "Gagal memverifikasi tiket." });
      }

      // Automatically clear result and resume after 4 seconds
      setTimeout(() => {
        setScanResult(null);
        scanner.resume();
      }, 4000);
    };

    scanner.render(onScanSuccess, (err) => { /* ignore */ });

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [isLocked]);

  if (isLocked) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
        <ThemeInjector slug={params.slug} />
        <div className="max-w-sm w-full bg-white rounded-3xl shadow-xl overflow-hidden p-8 border border-champagne/50">
          <div className="flex justify-center mb-4 text-rose">
            <QrCode size={48} />
          </div>
          <h1 className="font-heading text-3xl text-rose mb-2">Petugas Souvenir</h1>
          <p className="text-gray-500 mb-8 font-body">Masukkan PIN rahasia petugas.</p>
          
          <form onSubmit={handlePinSubmit} className="flex flex-col gap-4">
            <input 
              type="password" 
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="PIN / Password..."
              className="w-full text-center text-xl p-4 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-rose focus:ring-1 focus:ring-rose"
              autoFocus
            />
            {pinError && <p className="text-red-500 text-sm font-body">{pinError}</p>}
            <button 
              type="submit"
              className="w-full bg-rose text-white py-4 px-6 rounded-2xl font-medium hover:bg-opacity-90 transition shadow-md shadow-rose/20 mt-2"
            >
              Nyalakan Scanner
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-body">
      <ThemeInjector slug={params.slug} />
      <div className="max-w-md mx-auto">
        <div className="bg-gray-800 rounded-3xl p-6 shadow-2xl text-center mb-6">
          <h1 className="font-heading text-2xl text-white mb-2 flex items-center justify-center gap-2">
            <Scan className="text-rose" /> Scanner Souvenir
          </h1>
          <p className="text-gray-400 text-sm">Arahkan kamera ke QR Code tamu.</p>
        </div>

        {/* Scanner Container */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-800 relative w-full">
          {scanResult ? (
            <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300 ${scanResult.success ? 'bg-green-500' : 'bg-red-500'}`}>
              {scanResult.success ? (
                <CheckCircle className="text-white mb-4" size={64} />
              ) : (
                <XCircle className="text-white mb-4" size={64} />
              )}
              <h2 className="text-white font-heading text-3xl mb-2">{scanResult.success ? "VALID" : "DITOLAK"}</h2>
              <p className="text-white/90 font-medium mb-4">{scanResult.message}</p>
              
              {scanResult.success && scanResult.name && (
                <div className="bg-black/20 p-4 rounded-xl w-full">
                  <p className="text-white text-sm opacity-80 mb-1">Berikan Suvenir Kepada:</p>
                  <p className="text-white text-xl font-bold">{scanResult.name}</p>
                  <p className="text-white text-md mt-1 font-medium bg-black/30 inline-block px-3 py-1 rounded-full">{scanResult.pax} Orang</p>
                </div>
              )}
            </div>
          ) : (
            <>
              <style dangerouslySetInnerHTML={{__html: `
                #reader { border: none !important; width: 100%; padding: 0 !important; }
                #reader button { background-color: #f43f5e; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; margin: 10px; }
                #reader a { color: #f43f5e; text-decoration: underline; }
                #reader select { padding: 8px; border-radius: 8px; margin-bottom: 10px; }
                #reader video { transform: scaleX(-1); }
              `}} />
              <div id="reader" className="w-full bg-white text-gray-800 [&_video]:object-cover [&_video]:w-full" />
            </>
          )}
        </div>

        {/* Manual Fallback List */}
        <div className="mt-8 bg-gray-800 rounded-3xl p-6 shadow-2xl border-4 border-gray-700 w-full">
          <h2 className="text-white font-heading text-xl mb-4 flex justify-between items-center">
            Daftar Belum Klaim
            <span className="bg-rose text-white text-xs px-2 py-1 rounded-full">{unclaimedGuests.length}</span>
          </h2>
          {unclaimedGuests.length === 0 ? (
            <p className="text-gray-400 text-sm text-center">Semua tamu sudah klaim suvenir.</p>
          ) : (
            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-2">
              {unclaimedGuests.map(g => (
                <div key={g.id} className="bg-gray-700 p-3 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium text-sm">{g.name}</p>
                    <p className="text-gray-400 text-xs">{g.attendanceCount} Orang</p>
                  </div>
                  <button 
                    onClick={() => handleManualClaim(g.id, g.name, g.attendanceCount)}
                    className="bg-rose/20 text-rose hover:bg-rose/40 px-3 py-1.5 rounded-lg text-sm font-medium transition"
                  >
                    Klaim Manual
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
