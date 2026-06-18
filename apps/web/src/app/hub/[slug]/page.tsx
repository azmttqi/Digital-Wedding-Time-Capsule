"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Download, Archive, CheckCircle2 } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import ThemeInjector from "@/components/ThemeInjector";

type Photo = {
  id: string;
  storageKey: string;
};

type GuestbookEntry = {
  id: string;
  name: string;
  message: string | null;
  attendanceCount: number;
  createdAt: string;
};

export default function BrideGroomHub({ params }: { params: { slug: string } }) {
  const [isLocked, setIsLocked] = useState(true);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`http://localhost:3001/events/${params.slug}/verify`, {
        role: "hub",
        pin: pinInput
      });
      if (res.data.success) {
        setIsLocked(false);
      }
    } catch (err) {
      setPinError("PIN salah. Coba lagi.");
      setPinInput("");
    }
  };

  useEffect(() => {
    if (!isLocked) {
      axios.get(`http://localhost:3001/photos/${params.slug}?status=APPROVED`)
        .then(res => setPhotos(res.data))
        .catch(err => console.error("Gagal memuat foto:", err));
        
      axios.get(`http://localhost:3001/guestbook/${params.slug}`)
        .then(res => setGuestbookEntries(res.data))
        .catch(err => console.error("Gagal memuat buku tamu:", err));
    }
  }, [isLocked, params.slug]);

  const totalGuests = guestbookEntries.reduce((sum, entry) => sum + entry.attendanceCount, 0);

  const handleDownloadCSV = () => {
    if (guestbookEntries.length === 0) return;
    
    // Create CSV Header
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Waktu,Nama Tamu,Jumlah Hadir,Pesan/Doa\n";
    
    // Add Rows
    guestbookEntries.forEach(entry => {
      const date = new Date(entry.createdAt).toLocaleString('id-ID');
      const name = `"${entry.name.replace(/"/g, '""')}"`;
      const message = `"${(entry.message || '').replace(/"/g, '""')}"`;
      csvContent += `${date},${name},${entry.attendanceCount},${message}\n`;
    });
    
    // Download
    const encodedUri = encodeURI(csvContent);
    saveAs(encodedUri, `buku_tamu_${params.slug}.csv`);
  };

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
        <ThemeInjector slug={params.slug} />
        <div className="max-w-sm w-full bg-white rounded-3xl shadow-xl overflow-hidden p-8 border border-champagne/50">
          <h1 className="font-heading text-3xl text-rose mb-2">Akses Pengantin</h1>
          <p className="text-gray-500 mb-8 font-body">Masukkan PIN rahasia Anda.</p>
          
          <form onSubmit={handlePinSubmit} className="flex flex-col gap-4">
            <input 
              type="password" 
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Password..."
              className="w-full text-center text-xl p-4 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-rose focus:ring-1 focus:ring-rose"
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
      <ThemeInjector slug={params.slug} />
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-champagne/50 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-rose/10 rounded-full flex items-center justify-center mb-6">
            <Archive className="text-rose" size={40} />
          </div>
          <h1 className="font-heading text-4xl text-gray-800 mb-4">Bride & Groom Hub</h1>
          <p className="text-gray-600 mb-8 max-w-lg">
            Selamat! Acara Anda berjalan lancar. Di sini Anda dapat mengunduh seluruh memori dan daftar kehadiran tamu.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl mb-8">
            <div className="bg-gray-50 flex-1 p-6 rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
              <h2 className="text-3xl font-heading text-gray-800 mb-1">{photos.length}</h2>
              <p className="text-gray-500 text-sm">Foto Terkumpul</p>
            </div>
            <div className="bg-rose/5 flex-1 p-6 rounded-2xl border border-rose/10 flex flex-col items-center justify-center">
              <h2 className="text-3xl font-heading text-rose mb-1">{totalGuests}</h2>
              <p className="text-rose/70 text-sm font-medium">Total Tamu Hadir</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <button 
              onClick={handleDownloadZip}
              disabled={isDownloading || photos.length === 0}
              className="flex-1 flex items-center justify-center gap-3 bg-gray-800 text-white py-4 px-6 rounded-xl font-medium hover:bg-gray-900 transition shadow-md disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <span className="animate-spin border-2 border-white/20 border-t-white rounded-full w-5 h-5"></span>
                  Memproses ZIP ({downloadProgress}%)
                </>
              ) : (
                <>
                  <Archive size={20} />
                  Unduh Semua Foto (.ZIP)
                </>
              )}
            </button>
            <button 
              onClick={handleDownloadCSV}
              disabled={guestbookEntries.length === 0}
              className="flex-1 flex items-center justify-center gap-3 bg-rose text-white py-4 px-6 rounded-xl font-medium hover:bg-rose/90 transition shadow-md shadow-rose/20 disabled:opacity-50"
            >
              <Download size={20} />
              Unduh Buku Tamu (.CSV)
            </button>
          </div>
          
          {guestbookEntries.length > 0 && (
            <div className="w-full max-w-4xl text-left bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <h3 className="font-heading text-xl text-gray-800">Daftar Kehadiran</h3>
              </div>
              <div className="max-h-96 overflow-y-auto p-0 m-0">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3">Nama Tamu</th>
                      <th className="px-6 py-3 text-center">Hadir</th>
                      <th className="px-6 py-3">Pesan / Doa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guestbookEntries.map(entry => (
                      <tr key={entry.id} className="bg-white border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{entry.name}</td>
                        <td className="px-6 py-4 text-center">{entry.attendanceCount}</td>
                        <td className="px-6 py-4 italic text-gray-600">"{entry.message}"</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
