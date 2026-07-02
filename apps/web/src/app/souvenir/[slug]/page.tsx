"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Html5QrcodeScanner } from "html5-qrcode";
import ThemeInjector from "@/components/ThemeInjector";
import { useRouter } from "next/navigation";

export default function SouvenirScanner({ params }: { params: { slug: string } }) {
  const [isLocked, setIsLocked] = useState(true);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; name?: string; pax?: number } | null>(null);
  const router = useRouter();
  
  // Manual Fallback List
  const [unclaimedGuests, setUnclaimedGuests] = useState<any[]>([]);
  const [eventError, setEventError] = useState(false);

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/events/${params.slug}`)
      .catch(err => {
        if (err.response && err.response.status === 404) {
          setEventError(true);
        }
      });
  }, [params.slug]);

  const fetchUnclaimed = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/guestbook/${params.slug}`);
      const unclaimed = res.data.filter((g: any) => !g.souvenirClaimed);
      setUnclaimedGuests(unclaimed);
    } catch(err) {
      console.error(err);
    }
  };

  const handleManualClaim = async (id: string, name: string, pax: number) => {
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/guestbook/entry/${id}/claim`);
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
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/events/${params.slug}/verify`, {
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
      scanner.pause();
      
      try {
        const checkRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/guestbook/entry/${decodedText}`);
        const entry = checkRes.data;

        if (!entry) {
          setScanResult({ success: false, message: "QR Code tidak dikenal!" });
        } else if (entry.souvenirClaimed) {
          setScanResult({ 
            success: false, 
            message: `Souvenir sudah pernah diambil oleh ${entry.name} pada ${new Date(entry.createdAt).toLocaleString('id-ID')}` 
          });
        } else {
          // Claim it!
          await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/guestbook/entry/${decodedText}/claim`);
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

  if (eventError) {
    return (
      <div className="min-h-screen bg-surface-container flex flex-col items-center justify-center p-6 text-center font-body-md text-on-surface">
        <div className="w-24 h-24 bg-error-container rounded-full flex items-center justify-center mb-6 text-error">
           <span className="material-symbols-outlined text-4xl">error</span>
        </div>
        <h1 className="text-headline-lg font-headline-lg text-primary mb-4">Acara Tidak Ditemukan</h1>
        <p className="text-body-lg text-on-surface-variant max-w-md">
          Scanner Souvenir untuk acara ini tidak ditemukan. Silakan periksa kembali tautan Anda.
        </p>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="min-h-screen bg-surface-container flex flex-col items-center justify-center p-6 text-center font-body-md text-on-surface">
        <ThemeInjector slug={params.slug} />
        <div className="max-w-sm w-full bg-surface-container-lowest rounded-[24px] shadow-xl overflow-hidden p-8 border border-outline-variant/30">
          <div className="w-16 h-16 bg-primary-container text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-primary mb-2">Scanner Login</h1>
          <p className="text-on-surface-variant font-label-md mb-8">Enter the Moderator PIN.</p>
          
          <form onSubmit={handlePinSubmit} className="flex flex-col gap-4">
            <input 
              type="password" 
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Enter PIN..."
              className="w-full text-center text-xl p-4 bg-surface-container-high rounded-xl border border-outline-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-on-surface tracking-widest font-mono"
              autoFocus
            />
            {pinError && <p className="text-error text-label-sm font-label-sm">{pinError}</p>}
            <button 
              type="submit"
              className="w-full bg-primary text-on-primary py-4 px-6 rounded-2xl font-label-md hover:bg-primary/90 transition shadow-md mt-2"
            >
              Start Scanning
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen selection:bg-primary-container selection:text-on-primary-container">
      <ThemeInjector slug={params.slug} />
      


      {/* Main Content Area */}
      <main className="min-h-screen px-margin-mobile md:px-margin-desktop py-12 max-w-container-max mx-auto">
        {/* Header */}
        <header className="mb-stack-xl flex justify-between items-end">
          <div>
            <h2 className="text-headline-lg font-headline-lg text-on-surface mb-2">Souvenir Scanner</h2>
            <p className="text-body-lg text-on-surface-variant max-w-2xl">Verify guest tickets and distribute souvenirs securely.</p>
          </div>
          <button onClick={() => router.push(`/`)} className="p-3 bg-surface-container text-on-surface-variant rounded-xl hover:bg-surface-container-high transition flex items-center gap-2 font-label-md">
            <span className="material-symbols-outlined">arrow_back</span>
            Dashboard
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Scanner View */}
          <section className="lg:col-span-6 xl:col-span-5 space-y-stack-lg animate-in slide-in-from-left-8 duration-700">
            <div className="bg-surface-container-lowest rounded-[24px] p-6 shadow-sm border border-outline-variant/20 relative overflow-hidden h-[500px]">
              
              {scanResult ? (
                <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300 ${scanResult.success ? 'bg-secondary' : 'bg-error'}`}>
                  <span className="material-symbols-outlined text-white text-6xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {scanResult.success ? 'check_circle' : 'cancel'}
                  </span>
                  <h2 className="text-white font-headline-md text-3xl mb-2">{scanResult.success ? "VALID TICKET" : "INVALID / USED"}</h2>
                  <p className="text-white/90 font-body-md text-lg mb-6">{scanResult.message}</p>
                  
                  {scanResult.success && scanResult.name && (
                    <div className="bg-black/20 backdrop-blur-md p-6 rounded-2xl w-full max-w-xs mx-auto border border-white/20">
                      <p className="text-white/80 text-label-sm font-label-sm uppercase tracking-widest mb-2">Give Souvenir To:</p>
                      <p className="text-white text-2xl font-bold mb-2">{scanResult.name}</p>
                      <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mt-2">
                        <span className="material-symbols-outlined text-white text-sm">group</span>
                        <p className="text-white font-label-md font-bold">{scanResult.pax} Person{scanResult.pax! > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-primary">qr_code_scanner</span>
                    <h3 className="text-headline-md font-headline-md text-on-surface">Camera Active</h3>
                  </div>
                  
                  <div className="flex-1 rounded-2xl overflow-hidden border-4 border-surface-container-high relative group">
                    <style dangerouslySetInnerHTML={{__html: `
                      #reader { border: none !important; width: 100%; height: 100%; padding: 0 !important; }
                      #reader button { background-color: var(--tw-primary, #7b5455); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 500; cursor: pointer; margin: 10px; font-family: Inter, sans-serif; font-size: 14px; }
                      #reader a { color: var(--tw-primary, #7b5455); text-decoration: underline; display: none; }
                      #reader select { padding: 8px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #d4c2c2; font-family: Inter; }
                      #reader video { transform: scaleX(-1); object-fit: cover; width: 100%; height: 100%; }
                      #reader__scan_region { background-color: #f5eceb; }
                    `}} />
                    <div id="reader" className="w-full h-full bg-surface-container" />
                    
                    {/* Decorative Scanner Overlay */}
                    <div className="absolute inset-0 pointer-events-none border-[40px] border-black/30 mix-blend-overlay"></div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Manual Fallback List */}
          <section className="lg:col-span-6 xl:col-span-7 space-y-stack-lg animate-in slide-in-from-right-8 duration-700 delay-100">
            <div className="bg-surface-container-lowest rounded-[24px] p-8 shadow-sm border border-outline-variant/20 h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">list_alt</span>
                  <h3 className="text-headline-md font-headline-md text-on-surface">Pending Claims</h3>
                </div>
                <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-label-sm font-label-sm font-bold">
                  {unclaimedGuests.length} Guests
                </span>
              </div>
              
              {unclaimedGuests.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-on-surface-variant/50">
                  <span className="material-symbols-outlined text-6xl mb-4">check_circle</span>
                  <p className="font-label-md text-label-md">All souvenirs have been claimed.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 pb-4">
                  {unclaimedGuests.map(g => (
                    <div key={g.id} className="bg-surface-container p-4 rounded-2xl flex flex-col gap-3 border border-outline-variant/30 hover:border-primary/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-on-surface font-label-md font-bold mb-1 truncate max-w-[150px]">{g.name}</p>
                          <div className="flex items-center gap-1 text-on-surface-variant">
                            <span className="material-symbols-outlined text-[14px]">group</span>
                            <span className="text-label-sm">{g.attendanceCount} Pax</span>
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleManualClaim(g.id, g.name, g.attendanceCount)}
                        className="w-full bg-white border border-outline-variant hover:border-primary text-primary px-3 py-2 rounded-xl text-label-sm font-label-md font-semibold transition-colors flex justify-center items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                        Manual Claim
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* System Status Bar */}
        <footer className="mt-stack-xl flex flex-col md:flex-row items-center justify-between py-6 border-t border-outline-variant/20 gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-label-sm text-on-surface-variant">Scanner Active</span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-label-sm font-semibold text-primary">
            <span className="text-outline font-normal">© 2026 Digital Wedding Time Capsule Pro</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
