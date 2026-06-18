"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Download, Archive, CheckCircle2 } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

type Photo = {
  id: string;
  storageKey: string;
};

export default function BrideGroomHub({ params }: { params: { slug: string } }) {
  const [isLocked, setIsLocked] = useState(true);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === "1234") {
      setIsLocked(false);
    } else {
      setPinError("PIN salah. Coba lagi.");
      setPinInput("");
    }
  };

  useEffect(() => {
    if (!isLocked) {
      axios.get(`http://localhost:3001/photos/${params.slug}?status=APPROVED`)
        .then(res => setPhotos(res.data))
        .catch(err => console.error("Gagal memuat foto:", err));
    }
  }, [isLocked, params.slug]);

  const handleDownloadZip = async () => {
    if (photos.length === 0) return;
    
    setIsDownloading(true);
    setDownloadProgress(0);
    
    try {
      const zip = new JSZip();
      
      let count = 0;
      for (const photo of photos) {
        // Fetch the image as a blob
        const response = await fetch(photo.storageKey);
        const blob = await response.blob();
        
        // Extract filename from URL or generate one
        const fileExt = photo.storageKey.split('.').pop() || 'jpg';
        const fileName = `photo_${count + 1}.${fileExt}`;
        
        zip.file(fileName, blob);
        
        count++;
        setDownloadProgress(Math.round((count / photos.length) * 100));
      }
      
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `wedding_photos_${params.slug}.zip`);
      
    } catch (error) {
      console.error("Gagal membuat ZIP:", error);
      alert("Terjadi kesalahan saat mengunduh foto.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-sm w-full bg-white rounded-3xl shadow-xl overflow-hidden p-8 border border-champagne/50">
          <h1 className="font-heading text-3xl text-rose mb-2">Akses Pengantin</h1>
          <p className="text-gray-500 mb-8 font-body">Masukkan PIN rahasia Anda.</p>
          
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

  return (
    <div className="min-h-screen bg-cream p-6 md:p-10 font-body">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-champagne/50 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-rose/10 rounded-full flex items-center justify-center mb-6">
            <Archive className="text-rose" size={40} />
          </div>
          <h1 className="font-heading text-4xl text-gray-800 mb-4">Bride & Groom Hub</h1>
          <p className="text-gray-600 mb-8 max-w-lg">
            Selamat! Acara Anda berjalan lancar. Di sini Anda dapat mengunduh seluruh foto yang telah dibagikan oleh para tamu undangan.
          </p>

          <div className="bg-gray-50 w-full max-w-sm p-6 rounded-2xl border border-gray-100 mb-8">
            <h2 className="text-2xl font-heading text-gray-800 mb-1">{photos.length}</h2>
            <p className="text-gray-500 text-sm">Total Foto Terkumpul</p>
          </div>

          <button 
            onClick={handleDownloadZip}
            disabled={isDownloading || photos.length === 0}
            className="flex items-center justify-center gap-3 bg-rose text-white py-4 px-8 rounded-full font-medium hover:bg-opacity-90 transition shadow-lg shadow-rose/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <span className="animate-spin border-2 border-white/20 border-t-white rounded-full w-5 h-5"></span>
                Memproses ZIP ({downloadProgress}%)
              </>
            ) : (
              <>
                <Download size={20} />
                Unduh Semua Foto (.ZIP)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
