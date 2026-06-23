"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function EventLobby({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [eventData, setEventData] = useState<any>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState("");

  const [stats, setStats] = useState({
    totalGuests: 0,
    totalPax: 0,
    souvenirsClaimed: 0,
    totalPhotos: 0,
    pendingPhotos: 0
  });
  
  useEffect(() => {
    // Fetch Event Data
    axios.get(`http://localhost:3001/events/${params.slug}`)
      .then(res => setEventData(res.data))
      .catch(err => {
        console.error("Error fetching event", err);
        if (err.response && err.response.status === 404) {
          setErrorStatus(404);
        }
      });

    // Fetch Guestbook Stats
    axios.get(`http://localhost:3001/guestbook/${params.slug}`)
      .then(res => {
        const guests = res.data;
        const totalGuests = guests.length;
        const totalPax = guests.reduce((sum: number, g: any) => sum + g.attendanceCount, 0);
        const souvenirsClaimed = guests.filter((g: any) => g.souvenirClaimed).length;
        setStats(prev => ({ ...prev, totalGuests, totalPax, souvenirsClaimed }));
      })
      .catch(err => console.error(err));

    // Fetch Photos Stats
    axios.get(`http://localhost:3001/photos/${params.slug}`)
      .then(res => {
        const photos = res.data;
        const totalPhotos = photos.length;
        const pendingPhotos = photos.filter((p: any) => p.status === 'PENDING').length;
        setStats(prev => ({ ...prev, totalPhotos, pendingPhotos }));
      })
      .catch(err => console.error(err));
  }, [params.slug]);

  if (errorStatus === 404) {
    return (
      <div className="min-h-screen bg-surface-container flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-error-container rounded-full flex items-center justify-center mb-6 text-error">
           <span className="material-symbols-outlined text-4xl">error</span>
        </div>
        <h1 className="text-headline-lg font-headline-lg text-primary mb-4">Lobby Tidak Ditemukan</h1>
        <p className="text-body-lg text-on-surface-variant max-w-md">
          Lobby untuk acara ini tidak ditemukan. Silakan periksa kembali tautan Anda.
        </p>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-screen bg-surface-container flex items-center justify-center">
        <div className="animate-spin text-primary">
          <span className="material-symbols-outlined text-4xl">progress_activity</span>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    try {
      const res = await axios.post(`http://localhost:3001/events/${params.slug}/verify`, { 
        role: "admin",
        pin: passwordInput 
      });
      if (res.data.success) {
        setIsLocked(false);
        fetchTasks();
      } else {
        setPasswordError("Kata sandi salah");
      }
    } catch (err) {
      setPasswordError("Terjadi kesalahan. Coba lagi.");
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/tasks/event/${params.slug}`);
      setTasks(res.data);
    } catch(err) {
      console.error(err);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      await axios.post(`http://localhost:3001/tasks/event/${params.slug}`, { text: newTask });
      setNewTask("");
      fetchTasks();
    } catch(err) { console.error(err); }
  };
  
  const handleToggleTask = async (task: any) => {
    try {
      await axios.patch(`http://localhost:3001/tasks/${task.id}`, { completed: !task.completed });
      fetchTasks();
    } catch(err) { console.error(err); }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3001/tasks/${id}`);
      fetchTasks();
    } catch(err) { console.error(err); }
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-surface-container flex flex-col items-center justify-center p-6 text-center font-body-md text-on-surface">
        <div className="w-24 h-24 bg-primary-container rounded-[2rem] flex items-center justify-center mb-8 text-primary shadow-sm">
           <span className="material-symbols-outlined text-5xl">lock</span>
        </div>
        <h1 className="text-headline-lg font-headline-lg text-primary mb-2">Lobby Terkunci</h1>
        <p className="text-body-lg text-on-surface-variant max-w-md mb-8">
          Masukkan *Couple Password* untuk mengakses halaman kontrol Lobby.
        </p>

        <form onSubmit={handleLogin} className="w-full max-w-xs flex flex-col gap-4">
          <input
            type="password"
            placeholder="Couple Password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-full py-4 text-center text-headline-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-primary text-on-surface"
          />
          {passwordError && <p className="text-error text-label-md animate-in slide-in-from-top-1">{passwordError}</p>}
          <button type="submit" className="w-full bg-primary text-on-primary py-4 rounded-full font-label-lg tracking-widest hover:bg-primary/90 transition-colors shadow-md">
            BUKA LOBBY
          </button>
        </form>
      </div>
    );
  }

  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/${params.slug}` : `/${params.slug}`;

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md selection:bg-primary-container selection:text-on-primary-container pb-24">
      {/* Top Navigation */}
      <nav className="bg-surface/70 backdrop-blur-md border-b border-outline-variant/20 shadow-sm sticky top-0 z-40">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/')}
              className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-headline-md font-headline-md text-primary tracking-tight">Event Command Center</h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-label-sm font-label-sm px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            System Active
          </div>
        </div>
      </nav>

      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-xl">
        
        {/* Header Section */}
        <section className="mb-stack-xl flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in slide-in-from-bottom-8 duration-700">
          <div>
            <h2 className="text-display-lg font-display-lg text-primary mb-2 capitalize">{eventData.coupleName || params.slug.replace(/-/g, ' ')}</h2>
            <div className="flex items-center gap-4 text-on-surface-variant">
              <p className="flex items-center gap-1 font-label-md text-label-md">
                <span className="material-symbols-outlined text-sm">calendar_month</span>
                {new Date(eventData.date || Date.now()).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
              </p>
              <p className="flex items-center gap-1 font-label-md text-label-md">
                <span className="material-symbols-outlined text-sm">palette</span>
                Theme: <span className="capitalize text-primary font-bold">{eventData.theme || 'Rose'}</span>
              </p>
              {eventData.venue && (
                <p className="flex items-center gap-1 font-label-md text-label-md">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  <span className="capitalize">{eventData.venue}</span>
                </p>
              )}
            </div>
          </div>
          
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-sm flex items-center gap-4 min-w-[300px]">
            <div className="p-3 bg-primary-container text-primary rounded-xl">
              <span className="material-symbols-outlined">link</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-label-sm font-label-sm uppercase text-outline mb-1">Public URL</p>
              <p className="text-body-md font-body-md text-on-surface truncate">{publicUrl}</p>
            </div>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(publicUrl);
                alert("URL disalin!");
              }}
              className="text-primary hover:bg-primary-container p-2 rounded-lg transition-colors"
              title="Copy URL"
            >
              <span className="material-symbols-outlined">content_copy</span>
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          
          {/* Main Content: Stats & Portals */}
          <div className="lg:col-span-8 space-y-stack-xl">
            {/* Real-time Stats Bento */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-gutter animate-in slide-in-from-bottom-8 duration-700 delay-100">
              <div className="bg-surface-container-lowest p-6 rounded-[24px] border border-outline-variant/20 shadow-sm flex flex-col justify-between group hover:border-primary/50 transition-colors">
                <div className="w-10 h-10 bg-primary-container text-primary rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                </div>
                <p className="text-display-lg font-display-lg text-primary">{stats.totalPax}</p>
                <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest mt-2">Total Pax Arrived</p>
              </div>
              
              <div className="bg-surface-container-lowest p-6 rounded-[24px] border border-outline-variant/20 shadow-sm flex flex-col justify-between group hover:border-primary/50 transition-colors">
                <div className="w-10 h-10 bg-tertiary-container text-tertiary rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>photo_library</span>
                </div>
                <p className="text-display-lg font-display-lg text-tertiary">{stats.totalPhotos}</p>
                <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest mt-2">Photos Captured</p>
              </div>

              <div className="bg-surface-container-lowest p-6 rounded-[24px] border border-outline-variant/20 shadow-sm flex flex-col justify-between group hover:border-primary/50 transition-colors">
                <div className="w-10 h-10 bg-secondary-container text-secondary rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>redeem</span>
                </div>
                <div>
                  <p className="text-display-lg font-display-lg text-secondary inline-block">{stats.souvenirsClaimed}</p>
                  <span className="text-label-md font-label-md text-outline ml-2">/ {eventData.expectedPax || 0}</span>
                </div>
                <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest mt-2">Souvenirs Claimed</p>
              </div>

              <div className="bg-surface-container-lowest p-6 rounded-[24px] border border-outline-variant/20 shadow-sm flex flex-col justify-between group hover:border-error/50 transition-colors">
                <div className="w-10 h-10 bg-error-container text-error rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
                </div>
                <p className="text-display-lg font-display-lg text-error">{stats.pendingPhotos}</p>
                <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest mt-2">Needs Approval</p>
              </div>
            </section>

            {/* Portal Navigation Cards */}
            <section className="animate-in slide-in-from-bottom-8 duration-700 delay-200">
              <h3 className="text-headline-md font-headline-md text-on-surface mb-6">Event Portals</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter">
                
                {/* Guest Portal */}
                <button 
                  onClick={() => router.push(`/${params.slug}`)}
                  className="bg-surface-container-lowest border border-outline-variant/30 rounded-[24px] p-6 text-left flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all group"
                >
                  <div className="w-12 h-12 bg-surface-container text-on-surface-variant rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined">person_pin</span>
                  </div>
                  <h4 className="text-headline-md font-headline-md text-on-surface mb-2">Guest Portal</h4>
                  <p className="text-body-md font-body-md text-on-surface-variant mb-4 flex-1">
                    The main digital wedding time capsule interface for guests.
                  </p>
                  <span className="text-primary font-label-sm uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                    Enter Portal <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                </button>

                {/* B&G Hub */}
                <button 
                  onClick={() => router.push(`/hub/${params.slug}`)}
                  className="bg-surface-container-lowest border border-outline-variant/30 rounded-[24px] p-6 text-left flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all group"
                >
                  <div className="w-12 h-12 bg-surface-container text-on-surface-variant rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined">favorite</span>
                  </div>
                  <h4 className="text-headline-md font-headline-md text-on-surface mb-2">B&amp;G Hub</h4>
                  <p className="text-body-md font-body-md text-on-surface-variant mb-4 flex-1">
                    Private dashboard for the couple to view memories.
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                     <span className="material-symbols-outlined text-outline text-sm">lock</span>
                     <span className="text-label-sm text-outline">Needs Password</span>
                  </div>
                  <span className="text-primary font-label-sm uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                    Enter Portal <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                </button>

                {/* Admin Panel */}
                <button 
                  onClick={() => router.push(`/admin/${params.slug}`)}
                  className="bg-surface-container-lowest border border-outline-variant/30 rounded-[24px] p-6 text-left flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all group"
                >
                  <div className="w-12 h-12 bg-surface-container text-on-surface-variant rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined">settings</span>
                  </div>
                  <h4 className="text-headline-md font-headline-md text-on-surface mb-2">Admin Settings</h4>
                  <p className="text-body-md font-body-md text-on-surface-variant mb-4 flex-1">
                    Configure event theme, passwords, and settings.
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                     <span className="material-symbols-outlined text-outline text-sm">lock</span>
                     <span className="text-label-sm text-outline">Needs Password</span>
                  </div>
                  <span className="text-primary font-label-sm uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                    Enter Portal <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                </button>

                {/* Moderator */}
                <button 
                  onClick={() => router.push(`/mod/${params.slug}`)}
                  className="bg-surface-container-lowest border border-outline-variant/30 rounded-[24px] p-6 text-left flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all group"
                >
                  <div className="w-12 h-12 bg-surface-container text-on-surface-variant rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined">verified</span>
                  </div>
                  <h4 className="text-headline-md font-headline-md text-on-surface mb-2">Moderator</h4>
                  <p className="text-body-md font-body-md text-on-surface-variant mb-4 flex-1">
                    Review and approve or reject uploaded photos.
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                     <span className="material-symbols-outlined text-outline text-sm">lock</span>
                     <span className="text-label-sm text-outline">Needs PIN</span>
                  </div>
                  <span className="text-primary font-label-sm uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                    Enter Portal <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                </button>

                {/* Live Wall */}
                <button 
                  onClick={() => router.push(`/wall/${params.slug}`)}
                  className="bg-surface-container-lowest border border-outline-variant/30 rounded-[24px] p-6 text-left flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all group"
                >
                  <div className="w-12 h-12 bg-surface-container text-on-surface-variant rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined">tv</span>
                  </div>
                  <h4 className="text-headline-md font-headline-md text-on-surface mb-2">Live Wall</h4>
                  <p className="text-body-md font-body-md text-on-surface-variant mb-4 flex-1">
                    Fullscreen projector view displaying approved memories.
                  </p>
                  <span className="text-primary font-label-sm uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                    Enter Portal <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                </button>

                {/* Scanner */}
                <button 
                  onClick={() => router.push(`/souvenir/${params.slug}`)}
                  className="bg-surface-container-lowest border border-outline-variant/30 rounded-[24px] p-6 text-left flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all group"
                >
                  <div className="w-12 h-12 bg-surface-container text-on-surface-variant rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined">qr_code_scanner</span>
                  </div>
                  <h4 className="text-headline-md font-headline-md text-on-surface mb-2">Scanner</h4>
                  <p className="text-body-md font-body-md text-on-surface-variant mb-4 flex-1">
                    Scan guest QR codes to distribute souvenirs.
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                     <span className="material-symbols-outlined text-outline text-sm">lock</span>
                     <span className="text-label-sm text-outline">Needs PIN</span>
                  </div>
                  <span className="text-primary font-label-sm uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                    Enter Portal <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                </button>

              </div>
            </section>
          </div>

          {/* Sidebar: Task List Widget */}
          <div className="lg:col-span-4 sticky top-24 z-10">
            <section className="animate-in slide-in-from-right-8 duration-700 delay-300">
              <div className="bg-surface-container-lowest border border-outline-variant/30 shadow-sm rounded-[24px] p-6 md:p-8 transition-transform duration-300 relative">
                
                <h3 className="text-headline-md font-headline-md text-on-surface mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">checklist</span>
                  Event Task List
                </h3>
                
                <form onSubmit={handleAddTask} className="mb-6 flex gap-2">
                  <input 
                    type="text" 
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Tambah tugas..." 
                    className="flex-1 bg-surface-container-high border-b-2 border-outline-variant/30 px-4 py-3 focus:outline-none focus:border-primary text-on-surface rounded-t-xl"
                  />
                  <button type="submit" className="bg-primary text-on-primary px-4 py-3 rounded-xl font-bold hover:brightness-110 transition flex-shrink-0 shadow-sm">
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </form>

                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                  {tasks.length === 0 && (
                    <p className="text-center text-on-surface-variant italic py-6">Belum ada tugas.</p>
                  )}
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between bg-surface-container-low p-3 rounded-xl border border-outline-variant/20 hover:border-primary/30 transition group">
                      <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => handleToggleTask(task)}>
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${task.completed ? 'bg-primary border-primary text-on-primary' : 'border-outline-variant text-transparent'}`}>
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        </div>
                        <p className={`text-body-md font-medium transition-colors ${task.completed ? 'line-through text-on-surface-variant opacity-70' : 'text-on-surface'}`}>
                          {task.text}
                        </p>
                      </div>
                      <button onClick={() => handleDeleteTask(task.id)} className="text-error/70 hover:text-error hover:bg-error-container p-2 rounded-lg transition ml-2 opacity-0 group-hover:opacity-100">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
}
