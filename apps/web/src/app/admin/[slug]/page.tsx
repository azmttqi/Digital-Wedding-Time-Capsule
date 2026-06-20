"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import ThemeInjector from "@/components/ThemeInjector";
import { useRouter } from "next/navigation";

export default function AdminDashboard({ params }: { params: { slug: string } }) {
  const [isLocked, setIsLocked] = useState(true);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    theme: "rose",
    moderatorPin: "1234",
    couplePassword: "password",
    clientNotes: "",
    coverImageUrl: "",
    status: "UPCOMING"
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`http://localhost:3001/events/${params.slug}/verify`, {
        role: "admin",
        pin: pinInput
      });
      if (res.data.success) {
        setIsLocked(false);
        fetchSettings();
      }
    } catch (err) {
      setPinError("Password salah!");
      setPinInput("");
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/events/${params.slug}`);
      setFormData(prev => ({ 
        ...prev, 
        theme: res.data.theme || "rose", 
        clientNotes: res.data.clientNotes || "",
        coverImageUrl: res.data.coverImageUrl || "",
        status: res.data.status || "UPCOMING"
      }));
    } catch(err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.patch(`http://localhost:3001/events/${params.slug}/settings`, formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch(err) {
      alert("Gagal menyimpan pengaturan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    setIsUploading(true);
    try {
      const res = await axios.post('http://localhost:3001/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({...prev, coverImageUrl: res.data.url}));
    } catch (err) {
      console.error(err);
      alert('Gagal mengunggah foto.');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-surface-container flex flex-col items-center justify-center p-6 text-center font-body-md text-on-surface">
        <ThemeInjector slug={params.slug} />
        <div className="max-w-sm w-full bg-surface-container-lowest rounded-[24px] shadow-xl overflow-hidden p-8 border border-outline-variant/30">
          <div className="w-16 h-16 bg-primary-container text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl">dashboard</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-primary mb-2">Admin Setup</h1>
          <p className="text-on-surface-variant font-label-md mb-8">Enter your Couple Password.</p>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="password" 
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Enter Password..."
              className="w-full text-center text-xl p-4 bg-surface-container-high rounded-xl border border-outline-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-on-surface"
              autoFocus
            />
            {pinError && <p className="text-error text-label-sm font-label-sm">{pinError}</p>}
            <button 
              type="submit"
              className="w-full bg-primary text-on-primary py-4 px-6 rounded-2xl font-label-md hover:bg-primary/90 transition shadow-md mt-2"
            >
              Access Control Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen selection:bg-primary-container selection:text-on-primary-container">
      <ThemeInjector slug={params.slug} themeOverride={formData.theme} />
      


      {/* Main Content Area */}
      <main className="min-h-screen px-margin-mobile md:px-margin-desktop py-12 max-w-container-max mx-auto">
        {/* Header */}
        <header className="mb-stack-xl flex flex-col md:flex-row md:justify-between md:items-end gap-6">
          <div>
            <h2 className="text-headline-lg font-headline-lg text-on-surface mb-2">Event Settings</h2>
            <p className="text-body-lg text-on-surface-variant max-w-2xl">Manage your agency's security protocols, visual identity, and global configuration assets for the Digital Wedding Time Capsule ecosystem.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-surface-container rounded-xl p-2 flex items-center gap-3">
              <span className="text-label-sm font-label-sm uppercase text-outline pl-2 hidden sm:block">Status</span>
              <select 
                value={formData.status}
                onChange={async (e) => {
                  const newStatus = e.target.value;
                  setFormData(prev => ({...prev, status: newStatus}));
                  try {
                    await axios.patch(`http://localhost:3001/events/${params.slug}/status`, { status: newStatus });
                  } catch (err) {
                    alert("Gagal mengubah status");
                  }
                }}
                className={`text-label-md font-label-md rounded-lg pl-4 pr-10 py-2 border-none outline-none cursor-pointer ${
                  formData.status === 'LIVE' ? 'bg-secondary-container text-on-secondary-container' : 
                  formData.status === 'ENDED' ? 'bg-surface-variant text-on-surface-variant' : 
                  'bg-primary-container text-on-primary-container'
                }`}
              >
                <option value="UPCOMING">Upcoming</option>
                <option value="LIVE">Live Now</option>
                <option value="ENDED">Ended</option>
              </select>
            </div>
            <button onClick={() => router.push(`/lobby/${params.slug}`)} className="px-4 bg-surface-container text-on-surface-variant rounded-xl hover:bg-surface-container-high transition flex items-center gap-2 font-label-md h-[44px]">
              <span className="material-symbols-outlined">arrow_back</span>
              Lobby
            </button>
          </div>
        </header>

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            {/* Settings Section: Security */}
            <section className="lg:col-span-7 space-y-stack-lg animate-in slide-in-from-bottom-8 duration-700">
              <div className="bg-surface-container-lowest rounded-[24px] p-8 shadow-sm border border-outline-variant/20">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-primary">security</span>
                  <h3 className="text-headline-md font-headline-md">Security &amp; Access</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between py-4 border-b border-outline-variant/10">
                    <div>
                      <p className="font-semibold text-on-surface">Couple Password</p>
                      <p className="text-label-sm text-on-surface-variant">Master password for Admin & Hub</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-label-sm font-label-sm uppercase text-outline block mb-2">Current Password</label>
                      <input 
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-primary/20 text-on-surface" 
                        type="password" 
                        value="********" 
                        readOnly 
                      />
                    </div>
                    <div>
                      <label className="text-label-sm font-label-sm uppercase text-outline block mb-2">New Password</label>
                      <input 
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface" 
                        placeholder="Enter password" 
                        type="text"
                        value={formData.couplePassword}
                        onChange={e => setFormData({...formData, couplePassword: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b border-outline-variant/10">
                    <div>
                      <p className="font-semibold text-on-surface">Moderator PIN Code</p>
                      <p className="text-label-sm text-on-surface-variant">Require a PIN for restricted moderator/scanner sections</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-label-sm font-label-sm uppercase text-outline block mb-2">Moderator PIN</label>
                      <input 
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-center tracking-widest font-mono text-on-surface" 
                        placeholder="Enter digits" 
                        type="text"
                        value={formData.moderatorPin}
                        onChange={e => setFormData({...formData, moderatorPin: e.target.value})}
                      />
                    </div>
                  </div>
                  
                </div>
              </div>

              {/* Branding Assets */}
              <div className="bg-surface-container-lowest rounded-[24px] p-8 shadow-sm border border-outline-variant/20">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-primary">auto_awesome</span>
                  <h3 className="text-headline-md font-headline-md">Branding Assets</h3>
                </div>
                <div className="space-y-4">
                  <p className="text-label-sm text-on-surface-variant">
                    Upload an image or provide a direct image URL (e.g. from Unsplash or Imgur) to be used as the Event Cover Photo on the Organizer Dashboard.
                  </p>
                  <div>
                    <label className="text-label-sm font-label-sm uppercase text-outline block mb-2">Upload Photo</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:ring-1 focus:ring-primary focus:border-primary transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-container file:text-primary hover:file:bg-primary-container/80"
                    />
                    {isUploading && <p className="text-primary text-sm mt-2 animate-pulse">Uploading...</p>}
                  </div>
                  <div>
                    <label className="text-label-sm font-label-sm uppercase text-outline block mb-2">Cover Image URL</label>
                    <input 
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:ring-1 focus:ring-primary focus:border-primary transition-all" 
                      placeholder="https://example.com/photo.jpg" 
                      type="url"
                      value={formData.coverImageUrl}
                      onChange={e => setFormData({...formData, coverImageUrl: e.target.value})}
                    />
                  </div>
                  {formData.coverImageUrl && (
                    <div className="mt-4 rounded-xl overflow-hidden h-32 w-full bg-surface-container-high border border-outline-variant/30 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={formData.coverImageUrl} alt="Cover Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>
                  )}
                </div>
              </div>

              {/* EO Client Notes */}
              <div className="bg-surface-container-lowest rounded-[24px] p-8 shadow-sm border border-outline-variant/20 mt-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-primary">assignment</span>
                  <h3 className="text-headline-md font-headline-md">Client Brief &amp; Notes</h3>
                </div>
                <div className="space-y-4">
                  <p className="text-label-sm text-on-surface-variant">
                    Private notes for EO staff (budget allocation, vendor status, VVIP guests, etc.). 
                    This information is not visible to the couple or guests.
                  </p>
                  <textarea 
                    className="w-full h-40 bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 focus:ring-1 focus:ring-primary focus:border-primary text-on-surface resize-none transition-all"
                    placeholder="Write your consultation notes here..."
                    value={formData.clientNotes}
                    onChange={e => setFormData({...formData, clientNotes: e.target.value})}
                  ></textarea>
                </div>
              </div>
            </section>

            {/* Theme Customization Section */}
            <section className="lg:col-span-5 space-y-stack-lg animate-in slide-in-from-right-8 duration-700 delay-100">
              <div className="bg-surface-container-lowest rounded-[24px] p-8 shadow-sm border border-outline-variant/20 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-primary">palette</span>
                  <h3 className="text-headline-md font-headline-md">Theme Engine</h3>
                </div>
                
                <div className="space-y-8 flex-1">
                  <div>
                    <label className="text-label-sm font-label-sm uppercase text-outline block mb-4">Color Preset</label>
                    <div className="grid grid-cols-3 gap-3">
                      {/* Rose Theme */}
                      <button 
                         type="button"
                         onClick={() => setFormData({...formData, theme: "rose"})}
                         className={`group relative aspect-square rounded-2xl border-2 overflow-hidden transition-all hover:scale-[1.02] ${formData.theme === 'rose' ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'}`}
                      >
                        <div className="absolute inset-0 bg-[#7b5455]"></div>
                        <div className="absolute bottom-0 w-full h-1/3 bg-[#f4c2c2]/80 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-label-sm text-[#7b5455] font-bold">Rose</span>
                        </div>
                        {formData.theme === 'rose' && (
                          <div className="absolute top-2 right-2 bg-primary text-on-primary rounded-full p-0.5">
                            <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                          </div>
                        )}
                      </button>
                      {/* Sage Theme */}
                      <button 
                         type="button"
                         onClick={() => setFormData({...formData, theme: "sage"})}
                         className={`group relative aspect-square rounded-2xl border-2 overflow-hidden transition-all hover:scale-[1.02] ${formData.theme === 'sage' ? 'border-[#51634e]' : 'border-transparent opacity-70 hover:opacity-100'}`}
                      >
                        <div className="absolute inset-0 bg-[#51634e]"></div>
                        <div className="absolute bottom-0 w-full h-1/3 bg-[#d1e6cb]/80 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-label-sm text-[#51634e] font-bold">Sage</span>
                        </div>
                        {formData.theme === 'sage' && (
                          <div className="absolute top-2 right-2 bg-[#51634e] text-white rounded-full p-0.5">
                            <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                          </div>
                        )}
                      </button>
                      {/* Ocean Theme */}
                      <button 
                         type="button"
                         onClick={() => setFormData({...formData, theme: "ocean"})}
                         className={`group relative aspect-square rounded-2xl border-2 overflow-hidden transition-all hover:scale-[1.02] ${formData.theme === 'ocean' ? 'border-[#466276]' : 'border-transparent opacity-70 hover:opacity-100'}`}
                      >
                        <div className="absolute inset-0 bg-[#466276]"></div>
                        <div className="absolute bottom-0 w-full h-1/3 bg-[#b5d2ea]/80 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-label-sm text-[#466276] font-bold">Ocean</span>
                        </div>
                        {formData.theme === 'ocean' && (
                          <div className="absolute top-2 right-2 bg-[#466276] text-white rounded-full p-0.5">
                            <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Live Preview Card */}
                  <div className="space-y-4">
                    <label className="text-label-sm font-label-sm uppercase text-outline block">UI Component Preview</label>
                    <div className="theme-preview-card p-6 bg-surface-container rounded-2xl border border-outline-variant/30 space-y-4 transition-all duration-500">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${formData.theme === 'sage' ? 'bg-[#51634e]' : formData.theme === 'ocean' ? 'bg-[#466276]' : 'bg-[#7b5455]'}`}>
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                        </div>
                        <div>
                          <div className="h-3 w-24 bg-on-surface/10 rounded-full mb-1"></div>
                          <div className="h-2 w-16 bg-on-surface/5 rounded-full"></div>
                        </div>
                      </div>
                      <div className="h-20 w-full bg-surface-container-lowest rounded-xl shadow-sm p-3 flex flex-col justify-end">
                        <div className={`h-2 w-1/2 rounded-full mb-2 ${formData.theme === 'sage' ? 'bg-[#51634e]/20' : formData.theme === 'ocean' ? 'bg-[#466276]/20' : 'bg-[#7b5455]/20'}`}></div>
                        <div className={`text-white px-4 py-2 rounded-lg text-[10px] w-max font-bold ${formData.theme === 'sage' ? 'bg-[#51634e]' : formData.theme === 'ocean' ? 'bg-[#466276]' : 'bg-[#7b5455]'}`}>Primary Action</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 mt-auto">
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold hover:brightness-110 transition-all shadow-md shadow-primary/20 flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                       <span className="material-symbols-outlined animate-spin" style={{ fontVariationSettings: "'FILL' 1" }}>progress_activity</span>
                    ) : (
                       <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>save</span>
                    )}
                    {isLoading ? "Saving..." : "Apply Global Changes"}
                  </button>
                  <p className="text-[10px] text-center text-on-surface-variant mt-4 italic">Changes will reflect across all client portals instantly.</p>
                </div>
              </div>
            </section>
          </div>
        </form>

        {/* System Status Bar */}
        <footer className="mt-stack-xl flex flex-col md:flex-row items-center justify-between py-6 border-t border-outline-variant/20 gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-label-sm text-on-surface-variant">System Online</span>
            </div>
            <div className="text-label-sm text-outline">v4.8.2-stable</div>
          </div>
          <div className="flex items-center gap-6 text-label-sm font-semibold text-primary">
            <a className="hover:underline" href="#">Terms of Service</a>
            <a className="hover:underline" href="#">Privacy Policy</a>
            <span className="text-outline font-normal">© 2026 Digital Wedding Time Capsule Pro</span>
          </div>
        </footer>
      </main>

      {/* Success Toast */}
      <div className={`fixed bottom-8 right-8 bg-inverse-surface text-inverse-on-surface px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 transition-all duration-300 z-[100] ${saveSuccess ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}>
        <span className="material-symbols-outlined text-emerald-400" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        <span className="font-medium">Theme updated successfully</span>
      </div>
    </div>
  );
}
