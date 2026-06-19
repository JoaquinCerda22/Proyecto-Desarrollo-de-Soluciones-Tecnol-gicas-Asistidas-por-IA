import React, { useState } from 'react';
import { Product } from '../types.js';

interface StorefrontProps {
  products: Product[];
  onNavigateToCustomSpecs: () => void;
  onNavigateToTracking: () => void;
  onCreateStandardOrder: (clientData: any, items: any[]) => Promise<string>;
}

export default function Storefront({ products, onNavigateToCustomSpecs, onNavigateToTracking, onCreateStandardOrder }: StorefrontProps) {
  const [cart, setCart] = useState<Array<{ product: Product; quantity: number }>>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia'>('transferencia');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ id: string } | null>(null);

  // Cart total sum
  const cartTotal = cart.reduce((acc, current) => acc + current.product.price * current.quantity, 0);

  const formatCLP = (value: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const match = prev.find(item => item.product.id === product.id);
      if (match) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !clientName || !clientPhone || !deliveryDate) return;

    setSubmittingOrder(true);
    const orderItemsPayload = cart.map(item => ({
      productName: item.product.name,
      quantity: item.quantity,
      price: item.product.price
    }));

    const clientData = {
      clientName,
      clientPhone,
      clientEmail,
      deliveryDate,
      deliveryTime: '12:00',
      paymentMethod,
      type: 'standard',
      totalPrice: cartTotal,
      notes: 'Pedido regular directo de catálogo de la tienda.'
    };

    try {
      // Let parent handle fetch logic
      const orderId = await onCreateStandardOrder(clientData, orderItemsPayload);
      
      // Let's create a visual success confirmation block after checkout
      setSuccessInfo({ id: orderId });
      setCart([]);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingOrder(false);
    }
  };

  const minDate = new Date(new Date().getTime() + 48 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <div className="flex-grow flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full py-20 px-4 bg-[#fff1ed] flex flex-col items-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#ffdad4] to-transparent pointer-events-none"></div>
        <h1 className="font-serif text-5xl md:text-6xl text-primary mb-6 z-10 max-w-4xl leading-tight font-bold">Artesanía Pura,<br />Sabor Inolvidable</h1>
        <p className="font-sans text-base md:text-lg text-on-surface-variant max-w-2xl mb-10 z-10 leading-relaxed">
          Explora nuestro catálogo de repostería de autor y asegura tu pedido para esa ocasión especial. Cada detalle, pensado para deleitar tu paladar.
        </p>
        <button 
          onClick={onNavigateToCustomSpecs}
          className="z-10 bg-primary text-white cursor-pointer px-8 py-4 rounded-full font-bold text-sm shadow-lg hover:bg-primary-container transition-transform active:scale-95 duration-200 flex items-center gap-2"
        >
          Hacer un Pedido Personalizado
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </section>

      {/* Main content grid: Catalog & Order Form side-by-side */}
      <div className="max-w-7xl mx-auto w-full px-4 py-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Catalog Section (7 columns on large screens) */}
        <section className="lg:col-span-7 flex flex-col gap-8">
          <div className="flex items-center justify-between border-b border-[#d3c3c0]/50 pb-4">
            <h2 className="font-serif text-2xl md:text-3xl text-primary font-bold">Nuestra Selección</h2>
          </div>

          {/* Bento grid products */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((product) => {
              const isBestSeller = product.id === 'torta-frutos';
              return (
                <div 
                  key={product.id} 
                  className={`group relative overflow-hidden rounded-xl bg-white shadow-sm border border-[#d3c3c0]/30 flex flex-col hover:shadow-md transition-shadow duration-300 ${
                    isBestSeller ? 'md:col-span-2 md:flex-row' : ''
                  }`}
                >
                  {/* Photo area */}
                  <div className={`${isBestSeller ? 'md:w-1/2 h-64 md:h-auto' : 'h-48'} overflow-hidden`}>
                    <img 
                      alt={product.name} 
                      src={product.imageUrl} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  {/* Content details */}
                  <div className={`p-6 flex flex-col flex-grow justify-between ${isBestSeller ? 'md:w-1/2' : ''}`}>
                    <div>
                      {isBestSeller && (
                        <div className="bg-[#ffe2da] text-primary inline-flex items-center px-3 py-1 rounded-full w-fit mb-4 text-xs font-bold font-sans">
                          Más Vendido
                        </div>
                      )}
                      <h3 className="font-serif text-lg font-bold text-primary mb-2">{product.name}</h3>
                      <p className="font-sans text-xs text-on-surface-variant mb-4 leading-relaxed line-clamp-3">
                        {product.description}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-dotted">
                      <span className="font-serif text-lg font-bold text-primary">{formatCLP(product.price)}</span>
                      <button 
                        onClick={() => addToCart(product)} 
                        className="bg-primary text-white cursor-pointer px-4 py-2 text-xs font-bold rounded-lg hover:bg-black transition-colors"
                      >
                        Añadir al carro
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Home Form: Standard direct checkout (5 columns on large screens) */}
        <section className="lg:col-span-5 relative mt-8 lg:mt-0">
          <div className="sticky top-[100px] bg-white rounded-2xl shadow-xl border border-outline-variant/30 p-6 md:p-8 flex flex-col gap-6">
            <div className="text-center mb-2">
              <h2 className="font-serif text-xl font-bold text-primary">Detalle de Solicitud Directa</h2>
              <p className="font-sans text-xs text-on-surface-variant mt-1">Completa los datos para agendar tu entrega.</p>
            </div>

            {successInfo ? (
              <div className="p-6 bg-tertiary-fixed text-on-tertiary-fixed rounded-xl text-center space-y-4">
                <span className="material-symbols-outlined text-4xl block">check_circle</span>
                <h3 className="font-serif text-lg font-bold">¡Compra Registrada!</h3>
                <p className="text-xs text-on-surface-variant font-medium">Hemos ingresado tu pedido directo en nuestro obrador.</p>
                <div className="bg-white p-3 rounded-lg border border-outline-variant/30 mt-2 mb-2">
                  <p className="text-xs text-on-surface-variant mb-1">Tu código de confirmación y seguimiento es:</p>
                  <p className="font-mono text-lg font-bold text-primary">{successInfo.id}</p>
                </div>
                <p className="text-xs font-semibold text-primary italic">Por favor, guarda este código para consultar el estado de tu pedido en la sección de seguimiento.</p>
                <div className="flex flex-col gap-2 pt-2">
                  <button 
                    onClick={() => {
                      setSuccessInfo(null);
                      onNavigateToTracking();
                    }} 
                    className="w-full py-3 bg-primary text-white rounded-lg text-xs font-bold"
                  >
                    Hacer Seguimiento
                  </button>
                  <button 
                    onClick={() => setSuccessInfo(null)} 
                    className="w-full py-2 bg-transparent text-primary hover:text-black text-xs underline"
                  >
                    Volver a comprar
                  </button>
                </div>
              </div>
            ) : cart.length === 0 ? (
              <div className="py-12 text-center text-on-surface-variant bg-[#fff1ed]/40 rounded-xl border-2 border-dashed border-[#d3c3c0] space-y-3">
                <span className="material-symbols-outlined text-3xl text-outline">shopping_basket</span>
                <p className="text-xs font-medium">El carro de compras está vacío.</p>
                <p className="text-[10px] px-6">Selecciona delicias del catálogo para iniciar tu orden instantánea.</p>
              </div>
            ) : (
              <form onSubmit={handleCheckout} className="flex flex-col gap-5">
                
                {/* Cart mini listing review */}
                <div className="bg-[#fff1ed] p-4 rounded-xl border border-outline-variant/20 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Mi Carro</h3>
                  <div className="divide-y divide-outline-variant/25">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex justify-between items-center py-2 text-xs">
                        <div>
                          <span className="font-bold text-primary">{item.product.name}</span>
                          <span className="text-on-surface-variant font-mono ml-2">x{item.quantity}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary">{formatCLP(item.product.price * item.quantity)}</span>
                          <button 
                            type="button" 
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-error font-bold ml-1 hover:text-black"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t flex justify-between font-bold text-sm text-primary">
                    <span>Total del Carro</span>
                    <span>{formatCLP(cartTotal)}</span>
                  </div>
                </div>

                <div className="bg-[#fff1ed] p-3 rounded-lg border border-primary/20 text-center flex items-center gap-2 justify-center text-primary text-xs font-bold font-mono shadow-sm">
                  <span className="material-symbols-outlined text-base">storefront</span>
                  Atención: Todos los pedidos son solo para retiro en tienda.
                </div>

                {/* Contact form inputs */}
                <div className="bg-[#fff8f6] p-4 rounded-xl border border-outline-variant/30 flex flex-col gap-4">
                  <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">Datos de Contacto</h3>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-on-surface-variant" htmlFor="name">Nombre Completo</label>
                    <input 
                      className="w-full h-11 bg-white border border-[#d3c3c0] rounded-lg px-3 text-xs font-sans text-on-surface outline-none" 
                      id="name" 
                      type="text" 
                      required
                      placeholder="Ej. Ana García"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-on-surface-variant" htmlFor="phone">Teléfono / WhatsApp</label>
                    <input 
                      className="w-full h-11 bg-white border border-[#d3c3c0] rounded-lg px-3 text-xs font-sans text-on-surface outline-none" 
                      id="phone" 
                      type="tel" 
                      required
                      placeholder="+56 9 1234 5678"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-on-surface-variant" htmlFor="date">Fecha de Entrega</label>
                    <input 
                      className="w-full h-11 bg-white border border-[#d3c3c0] rounded-lg px-3 text-xs font-sans text-on-surface outline-none" 
                      id="date" 
                      type="date" 
                      min={minDate}
                      required
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                    />
                    <p className="text-[9px] text-on-surface-variant italic">Lead: requerimos 48h de preparación anticipada.</p>
                  </div>

                  <div className="flex flex-col gap-1.5 mt-1 border-t pt-3">
                    <label className="text-xs font-semibold text-on-surface-variant">Método de Pago</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Efectivo', value: 'efectivo' },
                        { label: 'Transfer.', value: 'transferencia' }
                      ].map(payment => (
                        <button 
                          key={payment.value}
                          type="button"
                          onClick={() => setPaymentMethod(payment.value as any)}
                          className={`py-2 text-[10px] font-bold rounded border cursor-pointer text-center select-none uppercase ${
                            paymentMethod === payment.value ? 
                            'bg-primary text-white border-primary shadow-sm' : 
                            'bg-white text-on-surface border-outline-variant hover:bg-[#fff1ed]'
                          }`}
                        >
                          {payment.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={submittingOrder}
                  className="w-full h-12 bg-primary hover:bg-[#3e2723] text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">shopping_basket</span>
                  {submittingOrder ? 'Tramitando...' : 'Confirmar Pedido'}
                </button>

              </form>
            )}

          </div>
        </section>

      </div>
    </div>
  );
}
