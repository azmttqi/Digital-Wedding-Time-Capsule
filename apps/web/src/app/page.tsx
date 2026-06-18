"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Home() {
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [capturesToday, setCapturesToday] = useState(0);
  const [capturesRange, setCapturesRange] = useState<'today' | 'all'>('today');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:3001/events");
      setEventsList(res.data);
    } catch(err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/photos/stats/count?range=${capturesRange}`);
      setCapturesToday(res.data.count);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [capturesRange]);

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNavigation = (pathPrefix: string, slug: string) => {
    router.push(`${pathPrefix}${slug}`);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide if scrolling down past 100px, show if scrolling up or at top
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowNav(false);
      } else {
        setShowNav(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);



  return (
    <div className="bg-background text-on-surface font-body-md overflow-x-hidden min-h-screen">
      {/* TopNavBar */}
      <header className={`bg-surface/70 backdrop-blur-md dark:bg-surface-container/70 border-b border-white/20 dark:border-outline-variant/20 shadow-sm transition-transform duration-300 ease-in-out fixed top-0 w-full z-50 left-0 ${showNav ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
          <div>
            <h1 className="text-headline-md font-headline-md text-on-surface tracking-tight">Digital Wedding Time Capsule</h1>
            <p className="text-[10px] text-primary uppercase tracking-widest font-bold">Organizer Dashboard</p>
          </div>
          <div className="flex items-center gap-4 flex-1 max-w-md mx-6">
            <div className="relative w-full hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline">search</span>
              </div>
              <input
                type="text"
                className="w-full bg-surface-container-high border border-outline-variant/30 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-primary text-on-surface text-body-md"
                placeholder="Search events by name or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select 
              value={capturesRange} 
              onChange={(e) => setCapturesRange(e.target.value as 'today' | 'all')}
              className="bg-surface-container-high border border-outline-variant/30 text-body-md font-body-md rounded-full px-4 py-2 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hidden md:block"
            >
              <option value="today">Today</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/register')} className="bg-primary text-on-primary px-6 py-2 rounded-full font-label-md text-label-md hover:bg-primary/90 transition-all shadow-md flex-shrink-0">Create Event</button>
          </div>
        </div>
      </header>
      


      {/* Main Content Area */}
      <main className="px-margin-mobile md:px-margin-desktop py-stack-xl max-w-container-max mx-auto pt-28">
        {/* Welcome Header */}
        <div className="mb-stack-lg animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-headline-lg font-headline-lg text-on-surface mb-2">Organizer Dashboard</h2>
            <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl">Manage your active digital wedding time capsules and access specialized portals for each event.</p>
          </div>
          <div className="text-left md:text-right glass-card p-4 rounded-2xl flex-shrink-0 min-w-[200px]">
            <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest mb-1">
              {isMounted ? currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Memuat Tanggal...'}
            </p>
            <p className="text-headline-md font-headline-md text-primary font-bold">
              {isMounted ? currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
            </p>
          </div>
        </div>

        {/* High Level Stats Bento */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-stack-xl">
          <div className="glass-card bento-hover p-8 rounded-3xl flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-container/20 rounded-full blur-2xl"></div>
            <div>
              <span className="text-label-sm font-label-sm text-primary uppercase tracking-widest mb-4 block">Active Events</span>
              <h3 className="text-display-lg font-display-lg text-primary">{eventsList.length}</h3>
            </div>
            <div className="flex items-center gap-2 mt-4 text-secondary">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span className="text-label-sm font-label-sm">Growing steadily</span>
            </div>
          </div>
          <div className="glass-card bento-hover p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary-container/20 rounded-full blur-2xl"></div>
            <div>
              <span className="text-label-sm font-label-sm text-tertiary uppercase tracking-widest mb-4 block">Captures ({capturesRange === 'today' ? 'Today' : 'All Time'})</span>
              <h3 className="text-display-lg font-display-lg text-tertiary">{capturesToday}</h3>
            </div>
            <div className="flex items-center gap-2 mt-4 text-on-surface-variant relative z-10">
              <span className="material-symbols-outlined text-sm">photo_camera</span>
              <span className="text-label-sm font-label-sm">High engagement detected</span>
            </div>
          </div>
          <div className="glass-card bento-hover p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-container/30 rounded-full blur-2xl"></div>
            <div>
              <span className="text-label-sm font-label-sm text-primary uppercase tracking-widest mb-4 block">System Status</span>
              <h3 className="text-display-lg font-display-lg text-primary">100%</h3>
            </div>
            <div className="flex items-center gap-2 mt-4 text-primary">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span className="text-label-sm font-label-sm">All services optimal</span>
            </div>
          </div>
        </section>

        {/* Active Events List */}
        <section className="mb-stack-xl">
          <div className="flex justify-between items-end mb-stack-md">
            <h3 className="text-headline-md font-headline-md text-on-surface">Active Wedding Events</h3>
            <a className="text-label-md font-label-md text-primary border-b border-primary hover:pb-1 transition-all" href="#">View Archive</a>
          </div>
          
          <div className="grid grid-cols-1 gap-gutter">
            {eventsList.filter(event => 
              event.coupleName.toLowerCase().includes(searchQuery.toLowerCase()) || 
              event.slug.toLowerCase().includes(searchQuery.toLowerCase())
            ).length === 0 && (
              <div className="text-center py-10 glass-card rounded-3xl">
                <p className="text-on-surface-variant font-body-lg">Belum ada acara atau tidak ada yang cocok dengan pencarian Anda...</p>
              </div>
            )}
            
            {eventsList.filter(event => 
              event.coupleName.toLowerCase().includes(searchQuery.toLowerCase()) || 
              event.slug.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((event, index) => (
              <div key={event.slug} className="glass-card rounded-3xl p-6 md:p-8 flex flex-col lg:flex-row gap-8 items-center group opacity-90 hover:opacity-100 transition-opacity">
                <div className="w-full lg:w-48 h-48 rounded-2xl overflow-hidden shadow-lg flex-shrink-0 bg-surface-container-high flex items-center justify-center relative">
                  {event.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={event.coverImageUrl} alt={event.coupleName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-tertiary-container/30 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                       <span className="material-symbols-outlined text-4xl text-primary/40">favorite</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-grow space-y-2 text-center lg:text-left">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 mb-2">
                    <h4 className="text-headline-md font-headline-md text-on-surface">{event.coupleName}</h4>
                    <span className={`inline-block px-3 py-1 text-label-sm font-label-sm rounded-full w-fit mx-auto lg:mx-0 ${
                      event.status === 'LIVE' ? 'bg-secondary-container text-on-secondary-container' :
                      event.status === 'ENDED' ? 'bg-surface-variant text-on-surface-variant' :
                      'bg-primary-container text-on-primary-container'
                    }`}>
                      {event.status === 'LIVE' ? 'Live Now' : event.status === 'ENDED' ? 'Ended' : 'Upcoming'}
                    </span>
                  </div>
                  
                  <p className="text-on-surface-variant font-body-md">
                    <span className="material-symbols-outlined text-base align-middle mr-1">calendar_month</span> 
                    {new Date(event.date || Date.now()).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
                  </p>
                  <p className="text-on-surface-variant font-body-md">
                    <span className="material-symbols-outlined text-base align-middle mr-1">link</span> 
                    /{event.slug}
                  </p>
                  
                  <div className="pt-4 grid grid-cols-3 sm:grid-cols-6 gap-2">
                    <button onClick={() => handleNavigation('/admin/', event.slug)} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-primary-container/20 text-on-surface-variant hover:text-primary transition-all" title="Admin">
                      <span className="material-symbols-outlined">settings</span>
                      <span className="text-[10px] font-label-sm uppercase">Admin</span>
                    </button>
                    <button onClick={() => handleNavigation('/hub/', event.slug)} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-primary-container/20 text-on-surface-variant hover:text-primary transition-all" title="B&G Hub">
                      <span className="material-symbols-outlined">favorite</span>
                      <span className="text-[10px] font-label-sm uppercase">B&G</span>
                    </button>
                    <button onClick={() => {
                        if (event.status !== 'LIVE') {
                           alert('Guest Portal is only accessible when the event is LIVE.');
                        } else {
                           handleNavigation('/', event.slug);
                        }
                      }} 
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${event.status !== 'LIVE' ? 'text-outline/50 cursor-not-allowed hover:bg-red-500/10 hover:text-red-500' : 'hover:bg-primary-container/20 text-on-surface-variant hover:text-primary'}`} 
                      title="Guest Portal">
                      <span className="material-symbols-outlined">person_pin</span>
                      <span className="text-[10px] font-label-sm uppercase">Guest</span>
                    </button>
                    <button onClick={() => handleNavigation('/mod/', event.slug)} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-primary-container/20 text-on-surface-variant hover:text-primary transition-all" title="Moderator">
                      <span className="material-symbols-outlined">verified</span>
                      <span className="text-[10px] font-label-sm uppercase">Mod</span>
                    </button>
                    <button onClick={() => handleNavigation('/wall/', event.slug)} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-primary-container/20 text-on-surface-variant hover:text-primary transition-all" title="Projector">
                      <span className="material-symbols-outlined">tv</span>
                      <span className="text-[10px] font-label-sm uppercase">Wall</span>
                    </button>
                    <button onClick={() => handleNavigation('/souvenir/', event.slug)} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-primary-container/20 text-on-surface-variant hover:text-primary transition-all" title="Souvenir">
                      <span className="material-symbols-outlined">card_giftcard</span>
                      <span className="text-[10px] font-label-sm uppercase">Gifts</span>
                    </button>
                  </div>
                </div>
                
                <div className="lg:border-l border-outline-variant/30 lg:pl-8 flex flex-col gap-4 w-full lg:w-48 text-center lg:text-left">
                  <div>
                    <p className="text-label-sm font-label-sm text-on-surface-variant uppercase">Engagement</p>
                    <p className="text-headline-md font-headline-md text-primary">High</p>
                  </div>
                  <button onClick={() => handleNavigation('/lobby/', event.slug)} className="bg-primary-container text-on-primary-container py-3 px-6 rounded-xl font-label-md text-label-md hover:bg-primary-container/80 transition-colors">Enter Lobby</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions & Tips */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          <div className="glass-card p-8 rounded-3xl">
            <h3 className="text-headline-md font-headline-md text-on-surface mb-6">Manager Quick Links</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center gap-3 p-4 rounded-2xl bg-surface-bright hover:bg-primary-container/10 border border-outline-variant/20 transition-all text-on-surface">
                <span className="material-symbols-outlined text-primary">assignment</span>
                <span className="font-label-md text-label-md">Task List</span>
              </button>
              <button className="flex items-center gap-3 p-4 rounded-2xl bg-surface-bright hover:bg-primary-container/10 border border-outline-variant/20 transition-all text-on-surface">
                <span className="material-symbols-outlined text-primary">contacts</span>
                <span className="font-label-md text-label-md">Vendor CRM</span>
              </button>
              <button className="flex items-center gap-3 p-4 rounded-2xl bg-surface-bright hover:bg-primary-container/10 border border-outline-variant/20 transition-all text-on-surface">
                <span className="material-symbols-outlined text-primary">analytics</span>
                <span className="font-label-md text-label-md">Event Analytics</span>
              </button>
              <button className="flex items-center gap-3 p-4 rounded-2xl bg-surface-bright hover:bg-primary-container/10 border border-outline-variant/20 transition-all text-on-surface">
                <span className="material-symbols-outlined text-primary">cloud_download</span>
                <span className="font-label-md text-label-md">Export All Data</span>
              </button>
            </div>
          </div>
          
          <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-headline-md font-headline-md text-primary mb-4">Organizer Insight</h3>
              <p className="text-body-lg font-body-lg text-on-primary-container mb-6 italic">
                "Guests are most active 20 minutes before the ceremony. Ensure your Moderator is live to welcome them into the digital portal."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-container flex items-center justify-center">
                   <span className="material-symbols-outlined text-primary">face_3</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-primary-container">Sarah Jenkins</p>
                  <p className="text-label-sm font-label-sm text-on-primary-container/70">Chief Design Officer</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-10">
              <span className="material-symbols-outlined text-[120px]">tips_and_updates</span>
            </div>
          </div>
        </section>
      </main>


    </div>
  );
}
