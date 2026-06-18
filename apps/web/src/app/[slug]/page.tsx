"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, Image as ImageIcon, UploadCloud, X, Download, ImageIcon as GalleryIcon, Aperture } from "lucide-react";
import axios from "axios";
import { supabase } from "@/lib/supabase";
import Webcam from "react-webcam";
import { predefinedMissions, getMissionById } from "@/lib/missions";

type Photo = {
  id: string;
  storageKey: string;
  uploaderSessionId: string;
  missionId?: string;
};

export default function GuestView({ params }: { params: { slug: string } }) {
  const [activeTab, setActiveTab] = useState<'UPLOAD' | 'GALLERY'>('UPLOAD');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeMission, setActiveMission] = useState<string | null>(null);
  const [approvedPhotos, setApprovedPhotos] = useState<Photo[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const webcamRef = useRef<Webcam>(null);

  const handleCaptureClick = () => {
    setIsCameraOpen(true);
  };

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      // Convert base64 to file
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });
          setPhoto(file);
          setPreview(imageSrc);
          setIsCameraOpen(false);
        });
    }
  }, [webcamRef]);

  const handleGalleryClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute("capture");
      fileInputRef.current.click();
    }
  };

  useEffect(() => {
    if (activeTab === 'GALLERY') {
      axios.get(`http://localhost:3001/photos/${params.slug}?status=APPROVED`)
        .then(res => setApprovedPhotos(res.data))
        .catch(err => console.error("Gagal memuat galeri:", err));
    }
  }, [activeTab, params.slug]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setPhoto(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!photo) return;
    setIsUploading(true);

    try {
      // 1. Upload to Supabase Storage
      const fileExt = photo.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `uploads/${params.slug}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('photos')
        .upload(filePath, photo);

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      // 2. Save metadata to NestJS backend
      await axios.post('http://localhost:3001/photos', {
        eventSlug: params.slug,
        url: publicUrlData.publicUrl,
        uploaderName: 'Guest', 
        missionId: activeMission,
      });

      alert("Foto berhasil diunggah! Menunggu persetujuan moderator.");
      
      setPhoto(null);
      setPreview(null);
      setActiveMission(null);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Gagal mengunggah foto. Silakan coba lagi.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream font-body flex justify-center">
      <div className="w-full max-w-md bg-cream min-h-screen shadow-2xl relative pb-20">
        <div className="bg-white px-6 pt-10 pb-6 rounded-b-3xl shadow-sm border-b border-champagne/50">
          <h1 className="font-heading text-3xl text-rose mb-1 text-center">
            Pernikahan {params.slug.replace(/-/g, ' ')}
          </h1>
          <p className="text-gray-500 text-sm text-center mb-6">Bagikan momen terbaik Anda!</p>

          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('UPLOAD')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'UPLOAD' ? 'bg-white shadow text-rose' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Unggah Foto
            </button>
            <button 
              onClick={() => setActiveTab('GALLERY')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'GALLERY' ? 'bg-white shadow text-rose' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Galeri Momen
            </button>
          </div>
        </div>

        <div className="p-6">
        {activeTab === 'GALLERY' ? (
          <div className="flex flex-col gap-6">
            {approvedPhotos.length === 0 ? (
              <p className="text-center text-gray-500 py-10">Belum ada foto di galeri.</p>
            ) : (
              approvedPhotos.map(photo => {
                const mission = getMissionById(photo.missionId);
                return (
                <div key={photo.id} className="bg-white p-3 rounded-2xl shadow-sm border border-champagne/30">
                  <div className="relative">
                    <img src={photo.storageKey} className="w-full aspect-square object-cover rounded-xl mb-3" alt="Momen" />
                    {mission && (
                      <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-gray-100 flex items-center gap-2">
                        <span className="text-xl">{mission.icon}</span>
                        <span className="text-xs font-medium text-gray-700 line-clamp-1">{mission.text}</span>
                      </div>
                    )}
                  </div>
                  <a 
                    href={photo.storageKey}
                    download
                    target="_blank"
                    className="w-full flex items-center justify-center gap-2 bg-sage/10 text-sage py-3 rounded-xl font-medium hover:bg-sage/20 transition"
                  >
                    <Download size={18} />
                    Unduh Foto
                  </a>
                </div>
              )})
            )}
          </div>
        ) : isCameraOpen ? (
          <div className="flex flex-col gap-4 animate-in fade-in zoom-in duration-300">
            <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white relative aspect-[3/4] bg-black">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: facingMode }}
                mirrored={facingMode === "user"}
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => setFacingMode(prev => prev === "user" ? "environment" : "user")}
                className="absolute top-4 right-4 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 backdrop-blur-sm transition"
                title="Putar Kamera"
              >
                <Aperture size={20} />
              </button>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsCameraOpen(false)}
                className="flex-1 bg-white text-gray-700 py-3 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button 
                onClick={capturePhoto}
                className="flex-[2] flex items-center justify-center gap-2 bg-rose text-white py-3 px-4 rounded-xl font-medium hover:bg-opacity-90 transition shadow-md"
              >
                <Camera size={20} />
                Jepret!
              </button>
            </div>
          </div>
        ) : preview ? (
          <div className="flex flex-col gap-4 animate-in fade-in zoom-in duration-300">
            <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white relative aspect-[3/4]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => { setPhoto(null); setPreview(null); }}
                className="flex-1 bg-white text-gray-700 py-3 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition"
                disabled={isUploading}
              >
                Batal
              </button>
              <button 
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-[2] flex items-center justify-center gap-2 bg-rose text-white py-3 px-4 rounded-xl font-medium hover:bg-opacity-90 transition shadow-md disabled:opacity-50"
              >
                <UploadCloud size={20} />
                {isUploading ? "Mengunggah..." : "Unggah ke Layar"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {activeMission && (
              <div className="bg-sage/10 border border-sage/30 text-sage p-3 rounded-xl flex items-center justify-between">
                <span className="font-medium text-sm">
                  🎯 Misi Aktif: {predefinedMissions.find(m => m.id === activeMission)?.text}
                </span>
                <button onClick={() => setActiveMission(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>
            )}
            
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            <button 
              onClick={handleCaptureClick}
              className="w-full flex items-center justify-center gap-3 bg-rose text-white py-4 px-6 rounded-2xl font-medium hover:bg-opacity-90 transition shadow-md shadow-rose/20 group"
            >
              <Camera size={24} className="group-hover:scale-110 transition-transform" />
              Ambil Foto dari Kamera
            </button>
            
            <button 
              onClick={handleGalleryClick}
              className="w-full flex items-center justify-center gap-3 bg-champagne text-gray-800 py-4 px-6 rounded-2xl font-medium hover:bg-opacity-80 transition shadow-sm group"
            >
              <ImageIcon size={24} className="text-gray-600 group-hover:scale-110 transition-transform" />
              Pilih dari Galeri
            </button>

            {!activeMission && (
              <div className="mt-6 border-t border-gray-100 pt-6">
                <h3 className="font-heading text-lg text-gray-800 mb-3 text-left">📸 Tantangan Seru (Opsional)</h3>
                <div className="flex flex-col gap-2">
                  {predefinedMissions.map(mission => (
                    <button
                      key={mission.id}
                      onClick={() => setActiveMission(mission.id)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-sage hover:bg-sage/5 transition text-left"
                    >
                      <span className="text-2xl">{mission.icon}</span>
                      <span className="font-body text-sm text-gray-700 font-medium">{mission.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <p className="absolute bottom-6 left-0 right-0 text-center text-sm text-gray-400 font-body">
        Powered by Digital Wedding Time Capsule
      </p>
      </div>
    </div>
  );
}
