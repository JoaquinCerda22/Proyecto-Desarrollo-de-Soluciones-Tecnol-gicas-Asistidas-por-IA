import React, { useState, useEffect } from 'react';
import { Product } from './types.js';
import Storefront from './components/Storefront.js';
import CustomOrder from './components/CustomOrder.js';
import AboutUs from './components/AboutUs.js';
import TrackOrder from './components/TrackOrder.js';
import Contact from './components/Contact.js';
import AdminLogin from './components/AdminLogin.js';
import AdminDashboard from './components/AdminDashboard.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'custom' | 'about' | 'tracking' | 'contact' | 'admin-login' | 'admin-dashboard'>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  
  // Tracking navigation helper state
  const [initialTrackingId, setInitialTrackingId] = useState('');

  // Fetch products on boot
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (err) {
        console.error('Error fetching catalog products:', err);
      }
    }
    fetchProducts();
  }, []);

  // Check storage token on boot
  useEffect(() => {
    const token = localStorage.getItem('admin_session_token');
    if (token) {
      setSessionToken(token);
      setIsAdmin(true);
    }
  }, []);

  const handleAdminLogin = (token: string) => {
    localStorage.setItem('admin_session_token', token);
    setSessionToken(token);
    setIsAdmin(true);
    setActiveTab('admin-dashboard');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('admin_session_token');
    setSessionToken(null);
    setIsAdmin(false);
    setActiveTab('home');
  };

  const handleCreateStandardOrder = async (clientData: any, items: any[]) => {
    const payload = {
      ...clientData,
      items
    };

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Error al tramitar la orden directa.');
    }
    const data = await response.json();
    return data.id;
  };

  // Helper to jump to tracking view from customized receipt
  const navigateToTrackingWithId = (orderId: string) => {
    setInitialTrackingId(orderId);
    setActiveTab('tracking');
  };

  const isInsideAdminWorkspace = isAdmin && activeTab === 'admin-dashboard';

  return (
    <div className="bg-[#fff8f6] text-[#2c160e] min-h-screen flex flex-col antialiased">
      
      {/* Top Header - Omitted ONLY if deep in AdminWorkspace where we have sidebar */}
      {!isInsideAdminWorkspace && (
        <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-[#d3c3c0]/20 backdrop-blur-md">
          <div className="flex justify-between items-center w-full px-5 md:px-10 py-4 max-w-7xl mx-auto h-[64px]">
            <button 
              onClick={() => setActiveTab('home')}
              className="font-serif text-xl md:text-2xl font-bold text-primary hover:opacity-85 transition-opacity cursor-pointer text-left"
            >
              Dulce Descontrol
            </button>
            
            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 font-sans text-xs uppercase font-bold">
              <button 
                onClick={() => setActiveTab('home')}
                className={`hover:text-primary transition-colors cursor-pointer pb-1 ${
                  activeTab === 'home' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant'
                }`}
              >
                Inicio
              </button>
              <button 
                onClick={() => setActiveTab('custom')}
                className={`hover:text-primary transition-colors cursor-pointer pb-1 ${
                  activeTab === 'custom' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant'
                }`}
              >
                Pedido Personalizado
              </button>
              <button 
                onClick={() => setActiveTab('about')}
                className={`hover:text-primary transition-colors cursor-pointer pb-1 ${
                  activeTab === 'about' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant'
                }`}
              >
                Sobre Nosotros
              </button>
              <button 
                onClick={() => {
                  setInitialTrackingId('');
                  setActiveTab('tracking');
                }}
                className={`hover:text-primary transition-colors cursor-pointer pb-1 ${
                  activeTab === 'tracking' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant'
                }`}
              >
                Seguimiento
              </button>
              <button 
                onClick={() => setActiveTab('contact')}
                className={`hover:text-primary transition-colors cursor-pointer pb-1 ${
                  activeTab === 'contact' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant'
                }`}
              >
                Contacto
              </button>
            </nav>

            {/* Profile Administrative Button */}
            <div className="flex items-center gap-4 text-primary">
              <button 
                onClick={() => setActiveTab(isAdmin ? 'admin-dashboard' : 'admin-login')}
                title="Acceso Administrativo"
                className="hover:text-primary flex items-center justify-center p-2 rounded-full transition-all hover:bg-[#ffeaf0] cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Single Page routed view wrappers */}
      <main className="flex-grow flex flex-col">
        {activeTab === 'home' && (
          <Storefront 
            products={products}
            onNavigateToCustomSpecs={() => setActiveTab('custom')}
            onNavigateToTracking={() => setActiveTab('tracking')}
            onCreateStandardOrder={handleCreateStandardOrder}
          />
        )}
        
        {activeTab === 'custom' && (
          <CustomOrder 
            onNavigateToTracking={navigateToTrackingWithId}
            onNavigateHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'about' && (
          <AboutUs />
        )}

        {activeTab === 'tracking' && (
          <TrackOrder />
        )}

        {activeTab === 'contact' && (
          <Contact />
        )}

        {activeTab === 'admin-login' && (
          <AdminLogin onLoginSuccess={handleAdminLogin} />
        )}

        {isInsideAdminWorkspace && (
          <AdminDashboard onLogout={handleAdminLogout} />
        )}
      </main>

      {/* Footer - Omitted ONLY if in Admin workspace */}
      {!isInsideAdminWorkspace && (
        <footer className="bg-primary text-white w-full border-t border-outline-variant/35 mt-12 py-10 px-5 md:px-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="font-serif text-2xl font-bold text-left italic">
              Dulce Descontrol
            </div>
            
            <nav className="flex flex-wrap justify-center items-center gap-6 text-xs text-on-primary-container">
              <button onClick={() => setActiveTab('about')} className="hover:text-white transition-colors cursor-pointer">Nuestra Historia</button>
              <button onClick={() => setActiveTab('contact')} className="hover:text-white transition-colors cursor-pointer">Contacto</button>
              <button onClick={() => setActiveTab('custom')} className="hover:text-white transition-colors cursor-pointer">Solicitudes Especiales</button>
              <button onClick={() => setActiveTab(isAdmin ? 'admin-dashboard' : 'admin-login')} className="hover:text-white transition-colors cursor-pointer font-bold">Kiosco de Cocina</button>
              <a href="https://www.instagram.com/dulce.descontrol01/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-bold">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153 1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
                Instagram
              </a>
            </nav>

            <p className="text-xs text-on-primary-container text-center md:text-right mt-2 md:mt-0 font-medium">
              © 2026 Dulce Descontrol. Hecho con amor artesanal en obrador.
            </p>
          </div>
        </footer>
      )}

    </div>
  );
}
