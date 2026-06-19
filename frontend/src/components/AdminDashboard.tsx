import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, Supply } from '../types.js';

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'panel' | 'pedidos' | 'insumos' | 'config'>('panel');
  const [orders, setOrders] = useState<Order[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [stats, setStats] = useState({
    monthlyRevenue: 14250.00,
    targetPercent: 85,
    monthlyGrowthPercent: 12,
    ordersCount: { urgentInProduction: 1, pendingConfirmed: 2, completed: 1 },
    lowStockCount: 3
  });

  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingSupplies, setLoadingSupplies] = useState(false);
  
  // Search and filter states
  const [orderSearchText, setOrderSearchText] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');

  // Config form states
  const [configName, setConfigName] = useState('');
  const [configEmail, setConfigEmail] = useState('');
  const [configLeadTime, setConfigLeadTime] = useState(48);
  const [configPin, setConfigPin] = useState('');
  const [configSaveSuccess, setConfigSaveSuccess] = useState(false);

  // Stock edit states
  const [editingSupplyId, setEditingSupplyId] = useState<number | null>(null);
  const [editingSupplyQuantity, setEditingSupplyQuantity] = useState<number | string>('');

  const formatCLP = (value: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);

  // Fetch initial data
  const fetchData = async () => {
    setLoadingOrders(true);
    setLoadingSupplies(true);
    try {
      // Fetch orders
      const ordersRes = await fetch('/api/orders');
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }

      // Fetch supplies
      const suppliesRes = await fetch('/api/supplies');
      if (suppliesRes.ok) {
        const suppliesData = await suppliesRes.json();
        setSupplies(suppliesData);
      }

      // Fetch stats
      const statsRes = await fetch('/api/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch config
      const configRes = await fetch('/api/config');
      if (configRes.ok) {
        const configData = await configRes.json();
        setConfig(configData);
        setConfigName(configData.kitchen_name || 'Dulce Descontrol Central');
        setConfigEmail(configData.kitchen_email || 'dulce.descontrol01@gmail.com');
        setConfigLeadTime(parseInt(configData.prep_lead_time) || 48);
        setConfigPin(configData.admin_pin || '123456');
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoadingOrders(false);
      setLoadingSupplies(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeSubTab]);

  // Handle status update
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        // Refresh local items
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        // Refresh stats
        const statsRes = await fetch('/api/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Handle editing regular stock levels
  const handleSaveSupplyStock = async (supplyId: number) => {
    if (editingSupplyQuantity === '') return;
    try {
      const res = await fetch(`/api/supplies/${supplyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: parseFloat(editingSupplyQuantity.toString()) })
      });
      if (res.ok) {
        const updated = await res.json();
        setSupplies(prev => prev.map(s => s.id === supplyId ? updated : s));
        setEditingSupplyId(null);
        setEditingSupplyQuantity('');
        
        // Refresh stats
        const statsRes = await fetch('/api/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      }
    } catch (error) {
      console.error('Error updating supply:', error);
    }
  };

  // Buy all low materials at once
  const handlePurchaseAllDeficits = async () => {
    try {
      const res = await fetch('/api/supplies/purchase-all', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.supplies) {
          setSupplies(data.supplies);
        }
      }
    } catch (error) {
      console.error('Error purchasing supplies:', error);
    }
  };

  // Check off specific low material supply
  const handleMarkSupplyChecked = async (supplyId: number, currentQty: number) => {
    // Restock with typical bulk quantity
    const db = supplies.find(s => s.id === supplyId);
    if (!db) return;
    const restockAmount = db.minThreshold * 2 + 5;
    try {
      const res = await fetch(`/api/supplies/${supplyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: currentQty + restockAmount })
      });
      if (res.ok) {
        const updated = await res.json();
        setSupplies(prev => prev.map(s => s.id === supplyId ? updated : s));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save config changes
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSaveSuccess(false);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kitchen_name: configName,
          kitchen_email: configEmail,
          prep_lead_time: configLeadTime.toString(),
          admin_pin: configPin
        })
      });
      if (res.ok) {
        setConfigSaveSuccess(true);
        setTimeout(() => setConfigSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    const textMatch = 
      order.clientName.toLowerCase().includes(orderSearchText.toLowerCase()) ||
      order.id.toLowerCase().includes(orderSearchText.toLowerCase());
    const statusMatch = orderStatusFilter === '' || order.status === orderStatusFilter;
    return textMatch && statusMatch;
  });

  return (
    <div className="flex-grow flex flex-col md:flex-row min-h-screen bg-[#fff8f6] font-sans">
      {/* SideNavBar Panel */}
      <nav className="flex flex-col w-full md:w-72 bg-[#fff1ed] shadow-lg border-r border-[#d3c3c0]/30 p-6 flex-shrink-0">
        <div className="mb-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#ffdad4] flex items-center justify-center mb-3 overflow-hidden border-4 border-white shadow-sm">
            <img 
              alt="Bakery Admin Profile" 
              className="w-full h-full object-cover" 
              src="https://thumbs.dreamstime.com/b/retrato-de-una-mujer-pastelera-con-pasteles-en-las-manos-anna-pavlova-209002285.jpg"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="font-serif text-xl font-bold text-[#271310] text-center">Dulce Descontrol</h1>
          <p className="text-xs text-[#504442] text-center mt-1">Administración de Cocina</p>
        </div>

        {/* Navigation Tabs */}
        <ul className="flex-grow flex flex-col gap-2">
          <li>
            <button 
              onClick={() => setActiveSubTab('panel')}
              className={`w-full flex items-center gap-4 p-4 rounded-xl shadow-sm transition-all duration-200 cursor-pointer font-bold ${
                activeSubTab === 'panel' ? 'bg-[#271310] text-white shadow-md' : 'text-[#504442] hover:bg-[#ffe2da]'
              }`}
            >
              <span className="material-symbols-outlined">dashboard</span>
              <span className="text-sm">Panel Estratégico</span>
            </button>
          </li>
          
          <li>
            <button 
              onClick={() => setActiveSubTab('pedidos')}
              className={`w-full flex items-center gap-4 p-4 rounded-xl shadow-sm transition-all duration-200 cursor-pointer font-bold ${
                activeSubTab === 'pedidos' ? 'bg-[#271310] text-white shadow-md' : 'text-[#504442] hover:bg-[#ffe2da]'
              }`}
            >
              <span className="material-symbols-outlined">receipt_long</span>
              <span className="text-sm">Pedidos Activos</span>
            </button>
          </li>

          <li>
            <button 
              onClick={() => setActiveSubTab('insumos')}
              className={`w-full flex items-center gap-4 p-4 rounded-xl shadow-sm transition-all duration-200 cursor-pointer font-bold ${
                activeSubTab === 'insumos' ? 'bg-[#271310] text-white shadow-md' : 'text-[#504442] hover:bg-[#ffe2da]'
              }`}
            >
              <span className="material-symbols-outlined">inventory_2</span>
              <span className="text-sm">Insumos y Compras</span>
            </button>
          </li>

          <li>
            <button 
              onClick={() => setActiveSubTab('config')}
              className={`w-full flex items-center gap-4 p-4 rounded-xl shadow-sm transition-all duration-200 cursor-pointer font-bold ${
                activeSubTab === 'config' ? 'bg-[#271310] text-white shadow-md' : 'text-[#504442] hover:bg-[#ffe2da]'
              }`}
            >
              <span className="material-symbols-outlined">settings</span>
              <span className="text-sm">Configuración</span>
            </button>
          </li>
        </ul>

        {/* Footer Sidebar buttons */}
        <div className="mt-auto pt-6 border-t border-[#d3c3c0]/40 space-y-2">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 text-[#504442] p-4 hover:bg-[#ffe2da] rounded-xl transition-all font-bold cursor-pointer"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </nav>

      {/* Main Administrative Canvas */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        
        {/* ========================================================= */}
        {/* TABS 1: PANEL ESTRATÉGICO                                 */}
        {/* ========================================================= */}
        {activeSubTab === 'panel' && (
          <div className="space-y-8 animate-fade-in">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-serif text-3xl text-primary font-bold">Centro de Mando</h2>
                <p className="text-sm text-on-surface-variant">Línea de producción y resumen del taller de hoy.</p>
              </div>
              <button 
                onClick={fetchData} 
                className="h-10 cursor-pointer bg-[#ffe2da] text-primary px-4 rounded-lg flex items-center gap-2 border border-outline-variant hover:bg-[#ffe9e3] text-xs font-bold font-sans"
              >
                <span className="material-symbols-outlined text-sm">refresh</span> Sincronizar Cocina
              </button>
            </header>

            {/* Bento strategic blocks */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left 8-cols: Production Timeline Card list */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex justify-between items-center border-b-2 border-surface-variant pb-2">
                  <h3 className="font-serif text-xl font-bold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined">schedule</span> Tareas de Producción Activas
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {orders.filter(o => o.status === 'Confirmado' || o.status === 'En producción').length === 0 ? (
                    <div className="md:col-span-2 bg-white rounded-xl p-8 text-center text-on-surface-variant text-sm border-2 border-dashed border-[#d3c3c0]">
                      No hay pedidos listos para cocinar en este momento. ¡Buen trabajo!
                    </div>
                  ) : (
                    orders
                      .filter(o => o.status === 'Confirmado' || o.status === 'En producción')
                      .map((ord) => {
                        const isPrep = ord.status === 'En producción';
                        return (
                          <article 
                            key={ord.id} 
                            className={`bg-white rounded-xl p-6 shadow-md border-l-4 relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                              isPrep ? 'border-error' : 'border-secondary'
                            }`}
                          >
                            {/* Urgent flag dynamic */}
                            <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-lg font-sans font-bold text-[10px] uppercase ${
                              isPrep ? 'bg-error-container text-on-error-container' : 'bg-primary-container/10 text-primary'
                            }`}>
                              {ord.status}
                            </div>

                            <div className="mt-2 mb-4">
                              <div className="flex justify-between items-center mb-1">
                                <h4 className="font-serif text-base font-bold text-primary truncate max-w-[70%]">{ord.clientName}</h4>
                                <span className="font-mono text-xs text-on-surface-variant font-bold">{ord.id}</span>
                              </div>
                              <p className="text-xs text-on-surface-variant flex items-center gap-1 font-bold">
                                <span className="material-symbols-outlined text-xs">alarm</span> {ord.deliveryDate} • {ord.deliveryTime}
                              </p>
                              {ord.customSpecs && (
                                <p className="text-xs text-secondary mt-1 italic font-semibold truncate">
                                  Specs: {ord.customSpecs.shape} • {ord.customSpecs.cakeBase}
                                </p>
                              )}
                            </div>

                            <div className="bg-[#fff1ed] rounded-lg p-3 text-xs mb-4 space-y-1">
                              {ord.items?.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-on-surface-variant">
                                  <span>{item.productName}</span>
                                  <span className="font-bold text-primary">x{item.quantity}</span>
                                </div>
                              ))}
                            </div>

                            {/* Transitions */}
                            {ord.status === 'Confirmado' ? (
                              <button 
                                onClick={() => handleUpdateStatus(ord.id, 'En producción')}
                                className="w-full h-11 bg-primary text-white rounded font-sans font-bold text-xs hover:bg-[#3e2723] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-sm">play_arrow</span> Iniciar Preparación
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleUpdateStatus(ord.id, 'Entregado')}
                                className="w-full h-11 bg-error text-white rounded font-sans font-bold text-xs hover:bg-[#93000a] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-sm">check_circle</span> Marcar como Entregado
                              </button>
                            )}
                          </article>
                        );
                      })
                  )}
                </div>
              </div>

              {/* Right 4-cols: Incomes & Material Shortages */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Months earnings visual block */}
                <div className="bg-primary-container text-on-primary-container rounded-2xl p-6 shadow-md relative overflow-hidden">
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/20 rounded-full blur-xl pointer-events-none"></div>
                  <h3 className="font-serif text-lg mb-1 font-bold text-white">Ingresos del Mes</h3>
                  <p className="text-[11px] text-on-primary-container/80 mb-4">Basado en pedidos confirmados y entregados</p>
                  <div className="mb-4">
                    <span className="font-serif text-3xl font-extrabold text-[#e3beb8]">{formatCLP(stats?.monthlyRevenue || 0)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-primary/30 p-2 rounded-lg border border-primary-fixed-dim/20">
                      <span className="block text-[10px] text-white/70">Ingresos Hoy</span>
                      <span className="font-bold text-tertiary-fixed-dim flex items-center gap-0.5">
                        {formatCLP(stats?.dailyRevenue || 0)}
                      </span>
                    </div>
                    <div className="bg-primary/30 p-2 rounded-lg border border-primary-fixed-dim/20">
                      <span className="block text-[10px] text-white/70">Ingresos Semana</span>
                      <span className="font-bold text-[#e3beb8] flex items-center gap-0.5">
                        {formatCLP(stats?.weeklyRevenue || 0)}
                      </span>
                    </div>
                    <div className="bg-primary/30 p-2 rounded-lg border border-primary-fixed-dim/20">
                      <span className="block text-[10px] text-white/70">vs Mes anterior</span>
                      <span className="font-bold text-tertiary-fixed-dim flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-xs">trending_up</span> +{stats?.monthlyGrowthPercent}%
                      </span>
                    </div>
                    <div className="bg-primary/30 p-2 rounded-lg border border-primary-fixed-dim/20">
                      <span className="block text-[10px] text-white/70">Meta del obrador</span>
                      <span className="font-bold text-[#e3beb8]">{stats?.targetPercent}%</span>
                    </div>
                  </div>
                </div>

                {/* Critical Shortage Inventory materials */}
                <div className="bg-white rounded-xl p-6 border border-outline-variant/30 shadow-sm">
                  <h3 className="font-serif text-base font-bold text-primary mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">warning</span> Stock Crítico de Insumos
                  </h3>
                  
                  <ul className="space-y-3">
                    {supplies.filter(s => s.status === 'Por Agotarse').length === 0 ? (
                      <li className="p-3 text-center text-xs text-on-surface-variant font-medium bg-tertiary-fixed/30 rounded-lg">
                        ¡Todo en orden! El stock de ingredientes se encuentra sobre la alerta.
                      </li>
                    ) : (
                      supplies.filter(s => s.status === 'Por Agotarse').map((sup) => (
                        <li key={sup.id} className="flex justify-between items-center p-3 rounded-lg bg-error-container/30 border border-error/20 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-error" />
                            <span className="font-bold text-on-surface">{sup.name}</span>
                          </div>
                          <span className="font-mono text-error font-bold">{sup.quantity} {sup.unit} (Mínimo: {sup.minThreshold})</span>
                        </li>
                      ))
                    )}
                  </ul>
                  
                  {supplies.filter(s => s.status === 'Por Agotarse').length > 0 && (
                    <button 
                      onClick={handlePurchaseAllDeficits}
                      className="w-full mt-4 h-10 bg-transparent text-primary hover:bg-primary/5 rounded border border-primary text-xs font-bold transition-all cursor-pointer"
                    >
                      Pedir Insumos del Obrador
                    </button>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TABS 2: PEDIDOS ACTIVOS                                   */}
        {/* ========================================================= */}
        {activeSubTab === 'pedidos' && (
          <div className="space-y-6 animate-fade-in">
            <header className="border-b border-outline-variant pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-serif text-3xl text-primary font-bold">Pedidos Activos</h2>
                <p className="text-sm text-on-surface-variant">Gestiona y consulta el ciclo completo de los pedidos en cocina.</p>
              </div>
              
              {/* Filters Search boxes */}
              <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                <div className="relative flex-grow sm:flex-grow-0">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
                  <input 
                    type="text" 
                    placeholder="Buscar cliente, número..."
                    value={orderSearchText}
                    onChange={(e) => setOrderSearchText(e.target.value)}
                    className="pl-9 pr-3 py-2 rounded-lg border border-[#d3c3c0] bg-white text-xs placeholder:text-on-surface-variant focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
                <select 
                  value={orderStatusFilter} 
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="py-1 px-2 border border-[#d3c3c0] bg-white text-xs rounded-lg text-primary outline-none"
                >
                  <option value="">Todos los Estados</option>
                  <option value="Cotizado">Cotizado</option>
                  <option value="Confirmado">Confirmado</option>
                  <option value="En producción">En Preparación</option>
                  <option value="Entregado">Entregado</option>
                </select>
              </div>
            </header>

            {/* List Canvas */}
            <div className="space-y-6 pb-20">
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center text-[#504442] border border-[#d3c3c0]/40 shadow-sm text-sm">
                  No se encontraron pedidos con los criterios buscados.
                </div>
              ) : (
                filteredOrders.map((ord) => {
                  const hasCustom = ord.type === 'custom' && ord.customSpecs;
                  return (
                    <article key={ord.id} className="bg-white rounded-xl shadow-sm border border-[#d3c3c0]/40 overflow-hidden">
                      {/* Top bar info card header */}
                      <div className="p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b border-[#d3c3c0]/30 bg-[#fff8f6]">
                        <div className="flex items-start gap-4">
                          <div className="bg-primary/10 text-primary w-12 h-12 rounded-lg flex items-center justify-center font-bold font-mono text-sm shrink-0">
                            {ord.id.replace('#DD-2026-', '#')}
                          </div>
                          <div>
                            <h3 className="font-serif text-lg font-bold text-primary">{ord.clientName}</h3>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-on-surface-variant mt-1">
                              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">phone</span> {ord.clientPhone}</span>
                              <span className="flex items-center gap-1 font-bold text-primary"><span className="material-symbols-outlined text-xs">storefront</span> {ord.deliveryDate} ({ord.deliveryTime})</span>
                              {hasCustom && <span className="bg-primary-fixed text-primary px-2 py-0.5 rounded text-[10px] font-bold">Pedido Personalizado</span>}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="font-serif text-lg font-bold text-primary">{formatCLP(ord.totalPrice || 0)}</p>
                          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block mt-1">Modo: <span className="font-bold text-primary uppercase">{ord.paymentMethod}</span></span>
                        </div>
                      </div>

                      {/* Middle description / items info body */}
                      <div className="p-5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Standard products list inside the order */}
                          <div className="space-y-2">
                            <h4 className="text-xs uppercase font-bold text-[#504442] tracking-wider">Productos de la Orden</h4>
                            <div className="space-y-1.5">
                              {ord.items?.map((it, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-[#fff1ed] rounded-lg text-xs">
                                  <span>{it.productName}</span>
                                  <span className="font-mono font-bold text-primary bg-white/50 px-2 py-0.5 rounded">x{it.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Spec box details if Custom */}
                          {hasCustom && (
                            <div className="bg-[#fff1ed] p-4 rounded-lg border border-[#d3c3c0]/40">
                              <h4 className="text-xs uppercase font-bold text-[#271310] tracking-wider mb-2">Especificaciones de Diseño</h4>
                              <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-xs text-on-surface">
                                <p><span className="font-bold text-primary">Forma:</span> {ord.customSpecs?.shape}</p>
                                <p><span className="font-bold text-primary">Bizcocho:</span> {ord.customSpecs?.cakeBase}</p>
                                <p><span className="font-bold text-primary">Relleno:</span> {ord.customSpecs?.filling}</p>
                                <p><span className="font-bold text-primary">Cobertura:</span> {ord.customSpecs?.frosting}</p>
                                <p className="col-span-2"><span className="font-bold text-primary">Detalles:</span> "{ord.customSpecs?.description || 'Sin notas adicionales.'}"</p>
                              </div>
                            </div>
                          )}

                        </div>

                        {/* Status switcher timeline (COTIZADO, CONFIRMADO, EN PRODUCCION, ENTREGADO) */}
                        <div className="pt-4 border-t border-[#d3c3c0]/20">
                          <p className="text-[10px] font-bold uppercase text-[#504442] mb-3">Ciclo completo de Producción</p>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { label: 'Cotizado', value: 'Cotizado' },
                              { label: 'Confirmado', value: 'Confirmado' },
                              { label: 'En Preparación', value: 'En producción' },
                              { label: 'Entregado', value: 'Entregado' },
                              { label: 'Cancelado', value: 'Cancelado' }
                            ].map((step) => {
                              const isActive = ord.status === step.value;
                              const isCanceled = step.value === 'Cancelado';
                              return (
                                <button 
                                  key={step.value}
                                  onClick={() => handleUpdateStatus(ord.id, step.value as OrderStatus)}
                                  className={`px-4 lg:px-5 py-3 lg:py-2 text-sm lg:text-xs min-h-[44px] lg:min-h-0 flex-1 md:flex-initial flex items-center justify-center rounded duration-250 transition-colors font-bold cursor-pointer border ${
                                    isActive 
                                      ? (isCanceled ? 'bg-error text-white shadow-md border-error' : 'bg-[#271310] text-white shadow-md border-[#271310]')
                                      : (isCanceled ? 'bg-transparent text-error hover:bg-error/10 border-error/30' : 'bg-transparent text-[#504442] hover:bg-[#ffe2da] border-[#d3c3c0]')
                                  }`}
                                >
                                  {step.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TABS 3: INSUMOS Y LISTA DE COMPRAS                        */}
        {/* ========================================================= */}
        {activeSubTab === 'insumos' && (
          <div className="space-y-8 animate-fade-in">
            <header className="bg-surface p-4 rounded-xl border border-outline-variant/30 sticky top-0 z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-serif text-3xl font-bold text-primary">Insumos y Compras</h2>
                <p className="text-sm text-on-surface-variant font-medium">Gestiona el inventario y autogenere la lista de compras del obrador.</p>
              </div>
              
              <button 
                onClick={handlePurchaseAllDeficits}
                className="bg-primary text-white cursor-pointer px-6 h-12 rounded-xl font-bold text-xs hover:bg-[#3e2723] transition-colors flex items-center gap-2 shadow-md"
              >
                <span className="material-symbols-outlined">add_shopping_cart</span> Generar Lista de Compras
              </button>
            </header>

            {/* Shopping automatization box */}
            <section className="bg-white rounded-2xl shadow-sm border border-outline-variant/50 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-[#ffe9e3]/45">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">shopping_cart_checkout</span>
                  <h3 className="font-serif text-lg font-bold text-primary">Draught: Orden automatizada</h3>
                </div>
                <span className="bg-error shadow-sm text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase animate-pulse">Previsión Crítica</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-outline-variant bg-[#fff8f6] text-on-surface-variant font-bold h-10">
                      <th className="p-4">Insumo Deficitario</th>
                      <th className="p-4">Stock Actual</th>
                      <th className="p-4 text-error">Requerido (Mínimo)</th>
                      <th className="p-4 text-center">Modo compra</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20 block-scroll">
                    {supplies.filter(s => s.status === 'Por Agotarse' || s.status === 'En Pedido').length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-on-surface-variant bg-white italic font-medium">
                          ¡No hay insumos deficitarios! Todas las materias primas están por encima del stock de seguridad.
                        </td>
                      </tr>
                    ) : (
                      supplies
                        .filter(s => s.status === 'Por Agotarse' || s.status === 'En Pedido')
                        .map((sup) => {
                          const isOrdered = sup.status === 'En Pedido';
                          return (
                            <tr key={sup.id} className="hover:bg-[#fff8f6] transition-colors leading-relaxed">
                              <td className="p-4 font-bold text-primary">
                                <div className="flex items-center gap-3">
                                  <div className="bg-[#fff1ed] text-primary rounded p-1">
                                    <span className="material-symbols-outlined text-base">bakery_dining</span>
                                  </div>
                                  <div>
                                    <p className="font-bold text-on-surface text-sm">{sup.name}</p>
                                    <p className="text-[10px] text-on-surface-variant">Proveedor: {sup.supplier}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 font-bold text-on-surface-variant text-sm">
                                {sup.quantity} {sup.unit}
                              </td>
                              <td className="p-4 font-bold text-error text-sm">
                                {sup.minThreshold * 2} {sup.unit}
                              </td>
                              <td className="p-4 text-center">
                                <button 
                                  onClick={() => handleMarkSupplyChecked(sup.id, sup.quantity)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans cursor-pointer transition-colors ${
                                    isOrdered ? 'bg-tertiary-fixed text-on-tertiary-fixed border border-transparent' : 'bg-transparent text-[#625f4d] border border-[#d3c3c0] hover:bg-[#fff1ed]'
                                  }`}
                                >
                                  {isOrdered ? '✓ Comprar Recibido' : 'Marcar Compra'}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Regular Stock Levels */}
            <section className="bg-white rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden flex flex-col flex-grow">
              <div className="p-4 border-b border-outline-variant/30 bg-[#ffe9e3]/20 flex justify-between items-center">
                <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">inventory</span> Todos los Insumos del Obrador
                </h3>
              </div>
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-outline-variant bg-[#fff8f6] text-on-surface-variant font-bold h-10">
                      <th className="p-4">Artículo</th>
                      <th className="p-4">Categoría</th>
                      <th className="p-4">Stock Actual</th>
                      <th className="p-4">Alerta de Seguridad</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20 block-scroll">
                    {supplies.map((sup) => {
                      const isEditing = editingSupplyId === sup.id;
                      const isLow = sup.status === 'Por Agotarse';
                      const isPending = sup.status === 'En Pedido';

                      return (
                        <tr key={sup.id} className="hover:bg-[#fff8f6]/50 transition-colors">
                          <td className="p-4 font-bold text-on-surface text-sm">{sup.name}</td>
                          <td className="p-4 text-on-surface-variant">{sup.category}</td>
                          
                          <td className="p-4">
                            {isEditing ? (
                              <input 
                                type="number" 
                                step="any"
                                value={editingSupplyQuantity}
                                onChange={(e) => setEditingSupplyQuantity(e.target.value)}
                                className="w-20 p-1 border border-primary rounded text-xs outline-none"
                              />
                            ) : (
                              <span className="font-bold text-sm text-primary">{sup.quantity} {sup.unit}</span>
                            )}
                          </td>
                          
                          <td className="p-4 font-bold text-on-surface-variant">{sup.minThreshold} {sup.unit}</td>
                          
                          <td className="p-4">
                            {isLow ? (
                              <span className="inline-flex items-center gap-1 bg-error-container text-on-error-container px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                <span className="material-symbols-outlined text-xs">warning</span> Por Agotarse
                              </span>
                            ) : isPending ? (
                              <span className="inline-flex items-center gap-1 bg-[#e6e0c9] text-[#676351] px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                <span className="material-symbols-outlined text-xs">local_shipping</span> En Pedido
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-tertiary-fixed text-on-tertiary-fixed px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                <span className="material-symbols-outlined text-xs">check_circle</span> Suficiente
                              </span>
                            )}
                          </td>

                          <td className="p-4 text-right">
                            {isEditing ? (
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => handleSaveSupplyStock(sup.id)}
                                  className="text-xs bg-[#271310] hover:bg-black font-semibold text-white px-2 py-1 rounded"
                                >
                                  ✓ Guardar
                                </button>
                                <button 
                                  onClick={() => setEditingSupplyId(null)}
                                  className="text-xs text-on-surface-variant hover:text-[#271310] px-1"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => {
                                  setEditingSupplyId(sup.id);
                                  setEditingSupplyQuantity(sup.quantity);
                                }}
                                className="text-primary hover:text-[#3e2723] p-1.5 rounded-full hover:bg-surface-variant transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm">edit</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* ========================================================= */}
        {/* TABS 4: CONFIGURACIÓN                                     */}
        {/* ========================================================= */}
        {activeSubTab === 'config' && (
          <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            <header className="border-b pb-4">
              <h2 className="font-serif text-3xl text-primary font-bold">Ajustes del Obrador</h2>
              <p className="text-sm text-on-surface-variant">Configuración general de Dulce Descontrol.</p>
            </header>

            <form onSubmit={handleSaveConfig} className="space-y-6">
              
              {/* Business Profile */}
              <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-outline-variant/30 space-y-4">
                <h3 className="font-serif text-lg font-bold text-primary border-b border-outline-variant/20 pb-2">Perfil de Operación</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-2">Nombre de la Sucursal</label>
                    <input 
                      type="text" 
                      value={configName} 
                      onChange={(e) => setConfigName(e.target.value)}
                      className="w-full h-11 bg-[#fff8f6] rounded border border-[#d3c3c0] focus:ring-0 focus:border-primary px-3 text-sm font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-2">Email de Operaciones</label>
                    <input 
                      type="email" 
                      value={configEmail} 
                      onChange={(e) => setConfigEmail(e.target.value)}
                      className="w-full h-11 bg-[#fff8f6] rounded border border-[#d3c3c0] focus:ring-0 focus:border-primary px-3 text-sm font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Limits */}
              <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-outline-variant/30 space-y-4">
                <h3 className="font-serif text-lg font-bold text-primary border-b border-outline-variant/20 pb-2">Tiempos de Producción</h3>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div className="max-w-md text-xs">
                    <label className="block font-bold text-on-surface mb-1 text-sm">Margen Mínimo de Pedido</label>
                    <p className="text-on-surface-variant leading-relaxed">Horas de anticipación requeridas por el sistema para habilitar la fecha de despacho en pedidos personalizados.</p>
                  </div>
                  
                  {/* Steppers adjust increment / decrement */}
                  <div className="flex items-center gap-4 bg-[#fff1ed] p-3 rounded-lg border-2 border-primary-container">
                    <button 
                      type="button" 
                      onClick={() => setConfigLeadTime(prev => Math.max(12, prev - 12))}
                      className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm border hover:bg-surface-variant/40"
                    >
                      -
                    </button>
                    <div className="text-center w-16">
                      <span className="font-sans font-bold text-lg block text-primary">{configLeadTime}</span>
                      <span className="text-[10px] text-on-surface-variant">Horas</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setConfigLeadTime(prev => Math.min(160, prev + 12))}
                      className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm border hover:bg-surface-variant/40"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Pin update */}
              <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-[#d3c3c0]/40 space-y-4">
                <h3 className="font-serif text-lg font-bold text-primary border-b border-[#d3c3c0]/20 pb-2">Seguridad del Kiosco</h3>
                <div className="max-w-sm">
                  <label className="block text-xs font-bold text-on-surface mb-2">Código de Operador (PIN de 6 dígitos)</label>
                  <input 
                    type="password" 
                    maxLength={6}
                    placeholder="******"
                    value={configPin}
                    onChange={(e) => setConfigPin(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full h-11 bg-[#fff8f6] rounded border border-[#d3c3c0] focus:ring-0 focus:border-primary px-3 text-sm font-mono tracking-widest text-[#271310]"
                  />
                  <p className="text-[10px] text-on-surface-variant mt-1.5">Permite el acceso administrativo de cocina de forma segura.</p>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="flex flex-col gap-2">
                {configSaveSuccess && (
                  <p className="text-xs text-emerald-800 font-bold bg-emerald-50 border border-emerald-100 p-3 rounded-lg text-center animate-pulse">
                    ✓ Todos los cambios fueron aplicados y resguardados en el servidor SQLite correctamente.
                  </p>
                )}
                <button 
                  type="submit" 
                  className="w-full h-12 bg-primary hover:bg-[#3e2723] text-white font-bold text-sm rounded-lg shadow-md cursor-pointer transition-colors"
                >
                  Guardar Configuración General
                </button>
              </div>

            </form>
          </div>
        )}

      </main>
    </div>
  );
}
