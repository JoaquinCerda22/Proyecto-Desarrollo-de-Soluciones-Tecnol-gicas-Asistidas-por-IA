import React, { useState } from 'react';
import { Order } from '../types.js';

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(orderId.trim())}`);
      if (!response.ok) {
        throw new Error('No se encontró ningún pedido con ese identificador. Verifica el código e intenta nuevamente.');
      }
      const data = await response.json();
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Error al recuperar la información.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine status step indexes
  const getStepIndex = (status: string) => {
    switch (status) {
      case 'Cotizado': return 1;
      case 'Confirmado': return 2;
      case 'En producción': return 3;
      case 'Entregado': return 5;
      default: return 1;
    }
  };

  const statusIndex = order ? getStepIndex(order.status) : 0;

  const formatCLP = (value: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);

  return (
    <div className="flex-grow max-w-4xl mx-auto w-full px-4 py-8 md:py-16">
      {/* Header */}
      <header className="mb-10 text-center md:text-left">
        <h1 className="font-serif text-4xl text-primary font-bold mb-2">Seguimiento de Pedido</h1>
        <p className="font-sans text-base text-on-surface-variant">Sigue en tiempo real el proceso artesanal de tu dulce encargo.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & Stepper */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Action Input Search */}
          <article className="bg-white border border-outline-variant/30 rounded-lg p-6 md:p-8 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-primary mb-4">Introduce tu Código de Pedido</h2>
            <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-4">
              <input 
                type="text" 
                placeholder="Ej: #089, #092 o #095" 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="flex-grow p-4 rounded-lg border border-outline-variant/50 bg-[#fff8f6] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-sans"
              />
              <button 
                type="submit" 
                disabled={loading}
                className="bg-primary hover:bg-[#3e2723] text-white font-bold px-6 py-4 rounded-lg transition-colors shadow-md disabled:opacity-50"
              >
                {loading ? 'Consultando...' : 'Consultar Estado'}
              </button>
            </form>
            {error && <p className="text-error text-sm mt-3">{error}</p>}
          </article>

          {/* Stepper Timeline - Rendered if active order */}
          {order && (
            <div className="bg-white rounded-xl p-6 md:p-8 border border-outline-variant/40 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-primary mb-8 border-b border-outline-variant/30 pb-4">Secuencia de Elaboración</h3>
              <div className="relative pl-4 border-l-2 border-outline-variant ml-4 space-y-8">
                
                {/* Step 1: Received */}
                <div className="relative">
                  <div className={`absolute -left-[25px] top-1 rounded-full w-6 h-6 flex items-center justify-center border-4 border-white ${
                    statusIndex >= 1 ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-outline-variant'
                  }`}>
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </div>
                  <div className="pl-4">
                    <h4 className={`font-sans text-sm font-bold ${statusIndex > 1 ? 'line-through opacity-60' : 'text-on-surface'}`}>
                      Solicitud Recibida
                    </h4>
                    <p className="font-sans text-xs text-on-surface-variant mt-1">Tu pedido ha sido registrado en el sistema.</p>
                  </div>
                </div>

                {/* Step 2: Technical Review */}
                <div className="relative">
                  <div className={`absolute -left-[25px] top-1 rounded-full w-6 h-6 flex items-center justify-center border-4 border-white ${
                    statusIndex >= 2 ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-outline-variant'
                  }`}>
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </div>
                  <div className="pl-4">
                    <h4 className={`font-sans text-sm font-bold ${statusIndex > 2 ? 'line-through opacity-60' : 'text-on-surface'}`}>
                      Revisión Técnica y Confirmado
                    </h4>
                    <p className="font-sans text-xs text-on-surface-variant mt-1">Los expertos pasteleros validaron los detalles e ingredientes.</p>
                  </div>
                </div>

                {/* Step 3: Baking */}
                <div className="relative">
                  <div className={`absolute -left-[28px] top-0 rounded-full w-8 h-8 flex items-center justify-center border-4 border-white ${
                    statusIndex === 3 ? 'bg-primary-container text-on-primary-container ring-4 ring-primary/20' : 
                    statusIndex > 3 ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-outline-variant'
                  }`}>
                    <span className="material-symbols-outlined text-[16px]">skillet</span>
                  </div>
                  <div className="pl-6">
                    <h4 className={`font-sans text-sm font-bold ${statusIndex > 3 ? 'line-through opacity-60' : 'text-primary'}`}>
                      En Preparación
                    </h4>
                    <p className="font-sans text-xs text-on-surface-variant mt-1">Estamos horneando masas, batiendo cremas y texturizando coberturas artesanales.</p>
                  </div>
                </div>

                {/* Step 4: Finished Delivery / Handover */}
                <div className="relative">
                  <div className={`absolute -left-[25px] top-1 rounded-full w-6 h-6 flex items-center justify-center border-4 border-white ${
                    statusIndex === 5 ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-outline-variant'
                  }`}>
                    <span className="material-symbols-outlined text-[14px]">storefront</span>
                  </div>
                  <div className="pl-4">
                    <h4 className="font-sans text-sm font-bold text-on-surface">Listo para Retiro en Tienda</h4>
                    <p className="font-sans text-xs text-on-surface-variant mt-1">Tu pedido está en perfectas condiciones y listo para que lo retires en nuestro taller.</p>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Details & Help */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Order Details box */}
          {order ? (
            <div className="bg-white rounded-xl p-6 border border-outline-variant/40 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-primary mb-4 border-b pb-2">Resumen del Pedido</h3>
              <p className="text-xs text-on-surface-variant mb-4">Código único: <span className="font-bold text-primary">{order.id}</span></p>
              
              <div className="space-y-3">
                <div className="bg-[#fff1ed] p-3 rounded-lg text-xs space-y-1">
                  <p className="font-bold text-on-surface">Cliente</p>
                  <p className="text-on-surface-variant">{order.clientName}</p>
                  <p className="text-on-surface-variant">{order.clientPhone}</p>
                </div>

                <div className="bg-[#fff1ed] p-3 rounded-lg text-xs space-y-1">
                  <p className="font-bold text-on-surface">Modo de Pago</p>
                  <p className="text-on-surface-variant capitalize">{order.paymentMethod}</p>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="bg-[#fff1ed] p-3 rounded-lg text-xs space-y-2">
                    <p className="font-bold text-on-surface">Productos</p>
                    <ul className="space-y-1 text-on-surface-variant">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>{item.productName} (x{item.quantity})</span>
                          <span className="font-bold">{formatCLP(item.price * item.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {order.customSpecs && (
                  <div className="bg-[#fff1ed] p-3 rounded-lg text-xs space-y-2">
                    <p className="font-bold text-on-surface hover:text-primary">Especificaciones Personalizadas</p>
                    <ul className="space-y-1 text-on-surface-variant">
                      <li><strong className="text-on-surface">Forma:</strong> {order.customSpecs.shape || 'Pendiente'}</li>
                      <li><strong className="text-on-surface">Bizcocho:</strong> {order.customSpecs.cakeBase || 'Pendiente'}</li>
                      <li><strong className="text-on-surface">Relleno:</strong> {order.customSpecs.filling || 'Pendiente'}</li>
                      <li><strong className="text-on-surface">Cobertura:</strong> {order.customSpecs.frosting || 'Pendiente'}</li>
                      <li><strong className="text-on-surface">Invitados:</strong> {order.customSpecs.portions || '10'} pax</li>
                      <li><strong className="text-on-surface">Indicaciones:</strong> {order.customSpecs.description || 'Sin notas adicionales'}</li>
                    </ul>
                  </div>
                )}

                <div className="pt-2 flex justify-between items-center text-sm font-bold border-t">
                  <span>Total</span>
                  <span className="text-primary text-base">{formatCLP(order.totalPrice || 0)}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Ambient Image */
            <div className="rounded-xl overflow-hidden h-48 md:h-64 shadow-sm border border-outline-variant/20 relative">
              <div 
                className="bg-cover bg-center w-full h-full" 
                style={{ backgroundImage: `url('https://media.elgourmet.com/recetas/cover_2olanrw9ec_frutosrojos.jpg')` }} 
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent"></div>
            </div>
          )}

          {/* Help Action */}
          <article className="bg-primary text-on-primary rounded-lg p-6 shadow-sm flex flex-col items-center text-center gap-4">
            <span className="material-symbols-outlined text-3xl">support_agent</span>
            <div>
              <h4 className="font-sans text-lg font-bold mb-1">¿Necesitas ayuda?</h4>
              <p className="font-sans text-xs text-on-primary/80 leading-relaxed">Contáctanos directamente al taller para cualquier consulta urgente sobre tu pedido.</p>
            </div>
            <a 
              href="https://wa.me/56947452159" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-[#25D366] text-white font-bold px-6 py-3 rounded-full flex items-center gap-2 hover:bg-[#20b858] transition-colors shadow-md w-full justify-center min-h-[52px]"
            >
              <span className="material-symbols-outlined">forum</span>
              WhatsApp Urgente
            </a>
          </article>
        </div>
      </div>
    </div>
  );
}
