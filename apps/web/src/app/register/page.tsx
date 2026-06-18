"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function RegisterEvent() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    coupleName: "",
    date: "",
    venue: "",
    expectedPax: "",
    slug: "",
    theme: "rose",
    couplePassword: "",
    moderatorPin: ""
  });

  const [errorMsg, setErrorMsg] = useState("");

  const handleSlugChange = (val: string) => {
    // auto format slug: lowercase, replace spaces with hyphen, remove non-alphanumeric
    const formatted = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    setFormData({ ...formData, slug: formatted });
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.coupleName || !formData.date) {
        setErrorMsg("Harap isi Nama Pasangan dan Tanggal Acara.");
        return;
      }
      if (!formData.slug) {
         // Auto-generate slug if empty
         handleSlugChange(formData.coupleName);
      }
    } else if (step === 2) {
      if (!formData.slug) {
        setErrorMsg("Tautan (Slug) tidak boleh kosong.");
        return;
      }
    }
    setErrorMsg("");
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setErrorMsg("");
    setStep(s => s - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.couplePassword || !formData.moderatorPin) {
      setErrorMsg("Kata Sandi dan PIN wajib diisi untuk keamanan.");
      return;
    }
    if (formData.moderatorPin.length < 4) {
      setErrorMsg("PIN Moderator minimal 4 karakter.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    
    try {
      // Check if event already exists
      try {
        await axios.get(`http://localhost:3001/events/${formData.slug}`);
        setErrorMsg("Tautan (Slug) ini sudah dipakai. Silakan gunakan nama lain.");
        setIsLoading(false);
        setStep(2); // Go back to slug step
        return;
      } catch (checkErr: any) {
        if (checkErr.response?.status !== 404) {
          throw checkErr; // Other error
        }
      }

      // Create new event
      await axios.post(`http://localhost:3001/events`, formData);
      
      // Success! Go to lobby
      router.push(`/lobby/${formData.slug}`);
    } catch (err) {
      console.error(err);
      setErrorMsg("Terjadi kesalahan saat mendaftarkan acara. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md selection:bg-primary-container selection:text-on-primary-container flex flex-col md:flex-row">
      
      {/* Left Panel: Branding / Visual (Hidden on mobile) */}
      <div className="hidden md:flex w-1/3 bg-surface-container-low border-r border-outline-variant/30 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-tertiary/10 z-0 pointer-events-none"></div>
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-tertiary/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md uppercase tracking-widest mb-16 w-max">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Dashboard
          </button>
          
          <h1 className="text-display-md font-display-md text-primary tracking-tight mb-6">Start Your<br/>Digital Wedding Time Capsule.</h1>
          <p className="text-body-lg text-on-surface-variant max-w-sm">
            Create a timeless, interactive digital experience for your special day. Setup takes less than 2 minutes.
          </p>
        </div>

        <div className="relative z-10">
          <div className="glass-card p-6 rounded-2xl border border-white/20 backdrop-blur-md bg-white/30">
            <div className="flex items-center gap-4 mb-4">
               <span className="material-symbols-outlined text-primary text-3xl">workspace_premium</span>
               <div>
                 <p className="font-label-md text-on-surface font-bold">Premium Features Included</p>
                 <p className="text-label-sm text-on-surface-variant">Live Wall, Guest Portal, B&G Hub</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative">
        {/* Mobile Header */}
        <div className="md:hidden w-full max-w-md mb-8 flex items-center justify-between">
          <h1 className="text-headline-md font-headline-md text-primary">New Event</h1>
          <button onClick={() => router.push('/')} className="text-on-surface-variant p-2 bg-surface-container rounded-full">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="w-full max-w-md bg-surface-container-lowest rounded-[32px] shadow-sm border border-outline-variant/20 p-8 sm:p-10 relative z-10">
          
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-label-md font-bold transition-colors ${
                  step === i ? 'bg-primary text-on-primary shadow-md shadow-primary/20 scale-110' : 
                  step > i ? 'bg-primary-container text-primary' : 'bg-surface-container text-on-surface-variant'
                }`}>
                  {step > i ? <span className="material-symbols-outlined text-sm">check</span> : i}
                </div>
                {i < 3 && (
                  <div className={`w-12 sm:w-16 h-1 mx-2 rounded-full transition-colors ${step > i ? 'bg-primary' : 'bg-surface-container'}`}></div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
            
            {/* STEP 1: Couple Details */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-headline-sm font-headline-sm text-on-surface mb-2">Basic Details</h2>
                <p className="text-label-sm text-on-surface-variant mb-8">Let's start with the couple's name and the big day.</p>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-label-sm font-label-sm uppercase text-outline block mb-2">Couple Name</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Budi & Ani"
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary text-on-surface transition-all"
                      value={formData.coupleName}
                      onChange={e => setFormData({...formData, coupleName: e.target.value})}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-label-sm font-label-sm uppercase text-outline block mb-2">Event Date</label>
                    <input 
                      type="date"
                      required
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary text-on-surface transition-all font-sans"
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-label-sm font-label-sm uppercase text-outline block mb-2">Venue / Location</label>
                      <input 
                        type="text"
                        placeholder="e.g. Grand Ballroom"
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary text-on-surface transition-all"
                        value={formData.venue}
                        onChange={e => setFormData({...formData, venue: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-label-sm font-label-sm uppercase text-outline block mb-2">Expected Pax</label>
                      <input 
                        type="number"
                        placeholder="e.g. 500"
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary text-on-surface transition-all"
                        value={formData.expectedPax}
                        onChange={e => setFormData({...formData, expectedPax: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: System Setup */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-headline-sm font-headline-sm text-on-surface mb-2">System Setup</h2>
                <p className="text-label-sm text-on-surface-variant mb-8">Configure your custom link and initial theme.</p>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-label-sm font-label-sm uppercase text-outline block mb-2">Custom Link (Slug)</label>
                    <div className="flex items-center bg-surface-container-low border border-outline-variant/30 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
                      <span className="bg-surface-container px-3 py-3 text-on-surface-variant font-label-sm border-r border-outline-variant/30">
                        digitalheirloom.com/
                      </span>
                      <input 
                        type="text"
                        required
                        placeholder="budi-ani"
                        className="w-full bg-transparent border-none px-4 py-3 text-on-surface focus:outline-none"
                        value={formData.slug}
                        onChange={e => handleSlugChange(e.target.value)}
                      />
                    </div>
                    <p className="text-[10px] text-on-surface-variant mt-2 italic">This is the link guests will scan/visit.</p>
                  </div>
                  
                  <div>
                    <label className="text-label-sm font-label-sm uppercase text-outline block mb-3">Initial Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button type="button" onClick={() => setFormData({...formData, theme: 'rose'})} className={`p-3 rounded-xl border-2 transition-all ${formData.theme === 'rose' ? 'border-primary bg-primary/5' : 'border-outline-variant/30 hover:border-primary/50'}`}>
                        <div className="w-full h-8 rounded-md bg-[#7b5455] mb-2"></div>
                        <span className="text-[10px] font-bold text-on-surface uppercase tracking-widest">Rose</span>
                      </button>
                      <button type="button" onClick={() => setFormData({...formData, theme: 'sage'})} className={`p-3 rounded-xl border-2 transition-all ${formData.theme === 'sage' ? 'border-[#51634e] bg-[#51634e]/5' : 'border-outline-variant/30 hover:border-[#51634e]/50'}`}>
                        <div className="w-full h-8 rounded-md bg-[#51634e] mb-2"></div>
                        <span className="text-[10px] font-bold text-on-surface uppercase tracking-widest">Sage</span>
                      </button>
                      <button type="button" onClick={() => setFormData({...formData, theme: 'ocean'})} className={`p-3 rounded-xl border-2 transition-all ${formData.theme === 'ocean' ? 'border-[#466276] bg-[#466276]/5' : 'border-outline-variant/30 hover:border-[#466276]/50'}`}>
                        <div className="w-full h-8 rounded-md bg-[#466276] mb-2"></div>
                        <span className="text-[10px] font-bold text-on-surface uppercase tracking-widest">Ocean</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Security */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-headline-sm font-headline-sm text-on-surface mb-2">Security</h2>
                <p className="text-label-sm text-on-surface-variant mb-8">Secure the private portals from uninvited guests.</p>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-label-sm font-label-sm uppercase text-outline block mb-2">Couple Password</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. BudiAni2026"
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary text-on-surface transition-all"
                      value={formData.couplePassword}
                      onChange={e => setFormData({...formData, couplePassword: e.target.value})}
                    />
                    <p className="text-[10px] text-on-surface-variant mt-2">Required to access Admin Settings & B&G Hub.</p>
                  </div>
                  <div>
                    <label className="text-label-sm font-label-sm uppercase text-outline block mb-2">Moderator PIN</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. 1234"
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary text-on-surface transition-all font-mono tracking-widest"
                      value={formData.moderatorPin}
                      onChange={e => setFormData({...formData, moderatorPin: e.target.value})}
                    />
                    <p className="text-[10px] text-on-surface-variant mt-2">Required for staff to access the Scanner & Moderator panel.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="mt-6 p-3 bg-error-container text-on-error-container rounded-xl text-label-sm font-label-md flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                <span className="material-symbols-outlined text-sm">warning</span>
                {errorMsg}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-10 flex items-center justify-between gap-4 pt-6 border-t border-outline-variant/20">
              {step > 1 ? (
                <button 
                  type="button" 
                  onClick={handleBack}
                  className="px-6 py-3 rounded-xl font-label-md text-primary hover:bg-primary-container/50 transition-colors"
                >
                  Back
                </button>
              ) : (
                <div className="px-6 py-3"></div> /* Placeholder to keep Next button on the right */
              )}
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="px-8 py-3 rounded-xl bg-primary text-on-primary font-label-md shadow-md shadow-primary/20 hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    Processing...
                  </>
                ) : (
                  <>
                    {step === 3 ? "Create Event" : "Continue"}
                    {step < 3 && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
                  </>
                )}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}
