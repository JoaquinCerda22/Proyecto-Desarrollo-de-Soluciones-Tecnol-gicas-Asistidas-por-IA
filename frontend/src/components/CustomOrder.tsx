import React, { useState, useEffect } from 'react';
import { CustomSpecification, Order } from '../types.js';

interface CustomOrderProps {
  onNavigateToTracking: (orderId: string) => void;
  onNavigateHome: () => void;
}

export default function CustomOrder({ onNavigateToTracking, onNavigateHome }: CustomOrderProps) {
  // Configurator fields
  const [shape, setShape] = useState('');
  const [cakeBase, setCakeBase] = useState('');
  const [filling, setFilling] = useState('');
  const [frosting, setFrosting] = useState('');
  const [description, setDescription] = useState('');
  
  // Fulfillment/Contact fields
  const [portions, setPortions] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [eventType, setEventType] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  const [minDateStr, setMinDateStr] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Restrict lead time to min 48h (today + 2 days)
  useEffect(() => {
    const today = new Date();
    today.setDate(today.getDate() + 2);
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setMinDateStr(`${yyyy}-${mm}-${dd}`);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shape || !cakeBase || !filling || !frosting || !clientName || !clientPhone || !deliveryDate) {
      setErrorMessage('Por favor, selecciona las opciones base (Forma, Bizcocho, Relleno, Cobertura) y completa tus datos de contacto.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const targetPrice = 25000 + (parseInt(portions) || 10) * 1500; // Calculated approximation for quotation

    const payload = {
      clientName,
      clientPhone,
      clientEmail,
      clientAddress: 'Retiro en Taller',
      deliveryDate,
      deliveryTime: '12:00',
      paymentMethod: 'transferencia',
      type: 'custom',
      notes: `Fecha Evento: ${deliveryDate}. Evento: ${eventType || 'Otro'}.`,
      totalPrice: targetPrice,
      items: [
        {
          productName: `Torta Personalizada [${shape}] (${portions || '10'} pax)`,
          quantity: 1,
          price: targetPrice
        }
      ],
      customSpecs: {
        shape,
        cakeBase,
        filling,
        frosting,
        portions: parseInt(portions) || 10,
        eventType: eventType || 'Otro',
        description
      }
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Error al registrar la solicitud de pedido.');
      }

      const orderData = await response.json();
      setCreatedOrder(orderData);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  // Render receipt screen on success
  if (createdOrder) {
    return (
      <div className="flex-grow pt-8 pb-16 px-4 flex items-center justify-center">
        <div className="max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-xl p-8 shadow-lg border border-outline-variant/30 animate-fade-in">
          {/* Left Column: Success Message */}
          <div className="flex flex-col justify-center gap-4 text-center md:text-left pr-0 md:pr-8 border-b md:border-b-0 md:border-r border-outline-variant/30 pb-6 md:pb-0">
            <div className="w-16 h-16 mx-auto md:mx-0 bg-tertiary-fixed text-on-tertiary-fixed rounded-full flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[32px] filled">check_circle</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-primary font-bold">¡Hemos recibido tu solicitud!</h1>
            <p className="font-sans text-base text-on-surface-variant">
              Gracias por confiar en Dulce Descontrol para tu creación. Nuestros maestros pasteleros están revisando los detalles para asegurar que tu idea se transforme en una obra maestra.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <button 
                onClick={onNavigateHome} 
                className="h-[52px] cursor-pointer px-6 bg-primary text-white rounded font-bold text-sm hover:bg-primary/95 transition-colors shadow-sm"
              >
                Volver al Inicio
              </button>
              <button 
                onClick={() => onNavigateToTracking(createdOrder.id)} 
                className="h-[52px] cursor-pointer px-6 border-2 border-primary text-primary rounded font-bold text-sm hover:bg-surface-container-low transition-colors"
              >
                Ver seguimiento
              </button>
            </div>
          </div>

          {/* Right Column: Summary & Next Steps */}
          <div className="flex flex-col gap-6">
            {/* Order Summary Card */}
            <div className="bg-[#fff1ed] p-6 rounded-lg border border-outline-variant/50">
              <div className="flex justify-between items-center mb-2 border-b border-outline-variant/30 pb-2">
                <span className="font-sans text-xs text-on-surface-variant uppercase tracking-wider font-bold">ID de Solicitud</span>
                <span className="font-sans text-sm font-bold text-primary">{createdOrder.id}</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-primary mb-3">Resumen de Diseño</h3>
              <ul className="space-y-2 text-sm text-on-surface">
                <li className="flex justify-between">
                  <span className="text-on-surface-variant">Base / Forma:</span>
                  <span className="font-medium">{createdOrder.customSpecs?.shape}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-on-surface-variant">Bizcocho:</span>
                  <span className="font-medium">{createdOrder.customSpecs?.cakeBase}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-on-surface-variant">Relleno principal:</span>
                  <span className="font-medium">{createdOrder.customSpecs?.filling}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-on-surface-variant">Cobertura exterior:</span>
                  <span className="font-medium">{createdOrder.customSpecs?.frosting}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-on-surface-variant">Porciones estimadas:</span>
                  <span className="font-medium">{createdOrder.customSpecs?.portions} pax</span>
                </li>
              </ul>
            </div>

            {/* Next Steps Bento Item */}
            <div className="bg-[#e6e0c9]/40 p-6 rounded-lg">
              <h3 className="text-[#625f4d] font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">pending_actions</span>
                Próximos Pasos
              </h3>
              <ol className="space-y-4 relative before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-outline-variant/50">
                <li className="relative pl-8">
                  <span className="absolute left-0 top-1 w-6 h-6 bg-white border-2 border-primary rounded-full flex items-center justify-center text-[10px] text-primary font-bold">1</span>
                  <strong className="block text-xs text-primary font-bold">Revisión técnica</strong>
                  <p className="text-xs text-on-surface-variant">Evaluamos la complejidad y los insumos requeridos.</p>
                </li>
                <li className="relative pl-8">
                  <span className="absolute left-0 top-1 w-6 h-6 bg-white border-2 border-outline rounded-full flex items-center justify-center text-[10px] text-outline font-bold">2</span>
                  <strong className="block text-xs text-on-surface font-bold">Contacto directo</strong>
                  <p className="text-xs text-on-surface-variant">Te escribiremos por WhatsApp o correo en un plazo de 48 horas hábiles para coordinar el valor final.</p>
                </li>
                <li className="relative pl-8">
                  <span className="absolute left-0 top-1 w-6 h-6 bg-white border-2 border-outline rounded-full flex items-center justify-center text-[10px] text-outline font-bold">3</span>
                  <strong className="block text-xs text-on-surface font-bold">Presupuesto final</strong>
                  <p className="text-xs text-on-surface-variant">Una vez acordados los detalles, recibirás el presupuesto oficial para agendar el abono.</p>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-4 py-12 flex flex-col gap-8 relative">
      <div className="mb-4 text-left">
        <h1 className="font-serif text-4xl md:text-5xl text-primary mb-4 font-bold">Tu Creación, Nuestro Arte</h1>
        <p className="font-sans text-base md:text-lg text-on-surface-variant max-w-3xl leading-relaxed">
          Cada evento merece una obra de arte única. Cuéntanos tu visión y nuestros maestros pasteleros transformarán tus ideas en una experiencia dulce inolvidable, elaborada con pasión artesanal.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start w-full">
        {/* Left Column: Form Settings */}
        <div className="flex-1 w-full lg:w-[65%] flex flex-col gap-10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-10" id="custom-pedido-form">
            
            {/* Step 1: Shape Base */}
            <section className="bg-surface-container-low p-6 md:p-8 rounded-xl flex flex-col gap-6 shadow-sm border border-outline-variant/30">
              <div className="flex items-center gap-4 border-b border-outline-variant/40 pb-4">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg font-serif">1</div>
                <h2 className="font-serif text-2xl text-primary font-bold">Base del Producto</h2>
              </div>
              <div className="flex flex-col gap-4">
                <label className="text-sm font-semibold uppercase tracking-wider text-primary">Forma y Estructura</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  <label className={`relative flex flex-col items-center gap-3 p-6 rounded-xl bg-white border-2 hover:border-primary transition-all cursor-pointer group ${
                    shape === 'Redonda Clásica' ? 'border-primary ring-2 ring-primary bg-surface-variant/20' : 'border-outline-variant'
                  }`}>
                    <input 
                      type="radio" 
                      name="forma" 
                      value="Redonda Clásica"
                      checked={shape === 'Redonda Clásica'}
                      onChange={() => setShape('Redonda Clásica')}
                      className="sr-only"
                    />
                    <span className="material-symbols-outlined text-4xl text-outline group-hover:text-primary transition-colors">radio_button_unchecked</span>
                    <span className="text-sm font-bold text-on-surface">Redonda Clásica</span>
                  </label>

                  <label className={`relative flex flex-col items-center gap-3 p-6 rounded-xl bg-white border-2 hover:border-primary transition-all cursor-pointer group ${
                    shape === 'Cuadrada Moderna' ? 'border-primary ring-2 ring-primary bg-surface-variant/20' : 'border-outline-variant'
                  }`}>
                    <input 
                      type="radio" 
                      name="forma" 
                      value="Cuadrada Moderna" 
                      checked={shape === 'Cuadrada Moderna'}
                      onChange={() => setShape('Cuadrada Moderna')}
                      className="sr-only"
                    />
                    <span className="material-symbols-outlined text-4xl text-outline group-hover:text-primary transition-colors">crop_square</span>
                    <span className="text-sm font-bold text-on-surface">Cuadrada Moderna</span>
                  </label>

                  <label className={`relative flex flex-col items-center gap-3 p-6 rounded-xl bg-white border-2 hover:border-primary transition-all cursor-pointer group ${
                    shape === 'Múltiples Pisos' ? 'border-primary ring-2 ring-primary bg-surface-variant/20' : 'border-outline-variant'
                  }`}>
                    <input 
                      type="radio" 
                      name="forma" 
                      value="Múltiples Pisos" 
                      checked={shape === 'Múltiples Pisos'}
                      onChange={() => setShape('Múltiples Pisos')}
                      className="sr-only"
                    />
                    <span className="material-symbols-outlined text-4xl text-outline group-hover:text-primary transition-colors">layers</span>
                    <span className="text-sm font-bold text-on-surface">Múltiples Pisos</span>
                  </label>

                </div>
              </div>
            </section>

            {/* Step 2: Flavors & Fillings */}
            <section className="bg-surface-container-low p-6 md:p-8 rounded-xl flex flex-col gap-6 shadow-sm border border-outline-variant/30">
              <div className="flex items-center gap-4 border-b border-outline-variant/40 pb-4">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg font-serif">2</div>
                <h2 className="font-serif text-2xl text-primary font-bold">Sabores y Rellenos</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                <div className="flex flex-col gap-4">
                  <label className="text-sm font-semibold uppercase tracking-wider text-primary">Bizcocho Base</label>
                  <div className="space-y-3">
                    
                    <label className={`flex items-center gap-4 p-4 rounded-lg bg-white border cursor-pointer transition-colors ${
                      cakeBase === 'Vainilla Bourbon' ? 'border-primary bg-surface-variant/10' : 'border-outline-variant'
                    }`}>
                      <input 
                        type="radio" 
                        name="bizcocho" 
                        value="Vainilla Bourbon"
                        checked={cakeBase === 'Vainilla Bourbon'}
                        onChange={() => setCakeBase('Vainilla Bourbon')}
                        className="text-primary focus:ring-primary h-5 w-5 border-outline"
                      />
                      <span className="text-sm text-on-surface font-medium">Vainilla Bourbon</span>
                    </label>

                    <label className={`flex items-center gap-4 p-4 rounded-lg bg-white border cursor-pointer transition-colors ${
                      cakeBase === 'Cacao Intenso' ? 'border-primary bg-surface-variant/10' : 'border-outline-variant'
                    }`}>
                      <input 
                        type="radio" 
                        name="bizcocho" 
                        value="Cacao Intenso"
                        checked={cakeBase === 'Cacao Intenso'}
                        onChange={() => setCakeBase('Cacao Intenso')}
                        className="text-primary focus:ring-primary h-5 w-5 border-outline"
                      />
                      <span className="text-sm text-on-surface font-medium">Cacao Intenso</span>
                    </label>

                    <label className={`flex items-center gap-4 p-4 rounded-lg bg-white border cursor-pointer transition-colors ${
                      cakeBase === 'Zanahoria y Nuez' ? 'border-primary bg-surface-variant/10' : 'border-outline-variant'
                    }`}>
                      <input 
                        type="radio" 
                        name="bizcocho" 
                        value="Zanahoria y Nuez"
                        checked={cakeBase === 'Zanahoria y Nuez'}
                        onChange={() => setCakeBase('Zanahoria y Nuez')}
                        className="text-primary focus:ring-primary h-5 w-5 border-outline"
                      />
                      <span className="text-sm text-on-surface font-medium">Zanahoria y Nuez</span>
                    </label>

                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <label className="text-sm font-semibold uppercase tracking-wider text-primary">Relleno Principal</label>
                  <div className="space-y-3">
                    
                    <label className={`flex items-center gap-4 p-4 rounded-lg bg-white border cursor-pointer transition-colors ${
                      filling === 'Manjar Blanco' ? 'border-primary bg-surface-variant/10' : 'border-outline-variant'
                    }`}>
                      <input 
                        type="radio" 
                        name="relleno" 
                        value="Manjar Blanco"
                        checked={filling === 'Manjar Blanco'}
                        onChange={() => setFilling('Manjar Blanco')}
                        className="text-primary focus:ring-primary h-5 w-5 border-outline"
                      />
                      <span className="text-sm text-on-surface font-medium">Manjar Blanco</span>
                    </label>

                    <label className={`flex items-center gap-4 p-4 rounded-lg bg-white border cursor-pointer transition-colors ${
                      filling === 'Ganache de Frambuesa' ? 'border-primary bg-surface-variant/10' : 'border-outline-variant'
                    }`}>
                      <input 
                        type="radio" 
                        name="relleno" 
                        value="Ganache de Frambuesa"
                        checked={filling === 'Ganache de Frambuesa'}
                        onChange={() => setFilling('Ganache de Frambuesa')}
                        className="text-primary focus:ring-primary h-5 w-5 border-outline"
                      />
                      <span className="text-sm text-on-surface font-medium">Ganache de Frambuesa</span>
                    </label>

                    <label className={`flex items-center gap-4 p-4 rounded-lg bg-white border cursor-pointer transition-colors ${
                      filling === 'Crema Pastelera Vainilla' ? 'border-primary bg-surface-variant/10' : 'border-outline-variant'
                    }`}>
                      <input 
                        type="radio" 
                        name="relleno" 
                        value="Crema Pastelera Vainilla"
                        checked={filling === 'Crema Pastelera Vainilla'}
                        onChange={() => setFilling('Crema Pastelera Vainilla')}
                        className="text-primary focus:ring-primary h-5 w-5 border-outline"
                      />
                      <span className="text-sm text-on-surface font-medium">Crema Pastelera Vainilla</span>
                    </label>

                  </div>
                </div>

              </div>
            </section>

            {/* Step 3: Decoration & Theme */}
            <section className="bg-surface-container-low p-6 md:p-8 rounded-xl flex flex-col gap-6 shadow-sm border border-outline-variant/30">
              <div className="flex items-center gap-4 border-b border-outline-variant/40 pb-4">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg font-serif">3</div>
                <h2 className="font-serif text-2xl text-primary font-bold">Decoración y Temática</h2>
              </div>
              
              <div className="flex flex-col gap-4">
                <label className="text-sm font-semibold uppercase tracking-wider text-primary">Cobertura Exterior</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  <label className={`flex items-center gap-3 p-4 rounded-lg bg-white border cursor-pointer transition-colors ${
                    frosting === 'Buttercream Suizo' ? 'border-primary bg-surface-variant/5' : 'border-outline-variant'
                  }`}>
                    <input 
                      type="radio" 
                      name="cobertura" 
                      value="Buttercream Suizo"
                      checked={frosting === 'Buttercream Suizo'}
                      onChange={() => setFrosting('Buttercream Suizo')}
                      className="text-primary focus:ring-primary h-5 w-5 border-outline"
                    />
                    <span className="text-sm text-on-surface font-medium">Buttercream Suizo</span>
                  </label>

                  <label className={`flex items-center gap-3 p-4 rounded-lg bg-white border cursor-pointer transition-colors ${
                    frosting === 'Fondant Liso' ? 'border-primary bg-surface-variant/5' : 'border-outline-variant'
                  }`}>
                    <input 
                      type="radio" 
                      name="cobertura" 
                      value="Fondant Liso"
                      checked={frosting === 'Fondant Liso'}
                      onChange={() => setFrosting('Fondant Liso')}
                      className="text-primary focus:ring-primary h-5 w-5 border-outline"
                    />
                    <span className="text-sm text-on-surface font-medium">Fondant Liso</span>
                  </label>

                  <label className={`flex items-center gap-3 p-4 rounded-lg bg-white border cursor-pointer transition-colors ${
                    frosting === 'Semi-Naked' ? 'border-primary bg-surface-variant/5' : 'border-outline-variant'
                  }`}>
                    <input 
                      type="radio" 
                      name="cobertura" 
                      value="Semi-Naked"
                      checked={frosting === 'Semi-Naked'}
                      onChange={() => setFrosting('Semi-Naked')}
                      className="text-primary focus:ring-primary h-5 w-5 border-outline"
                    />
                    <span className="text-sm text-on-surface font-medium">Semi-Naked</span>
                  </label>

                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 mt-2">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-primary" htmlFor="descripcion">Especificaciones Especiales</label>
                  <textarea 
                    id="descripcion"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe los colores, flores, figuras personalizadas, mensajes escritos o cualquier detalle especial que tengas en mente para tu creación dulce..."
                    className="w-full p-4 rounded-lg bg-white border border-outline focus:border-2 focus:border-primary focus:outline-none transition-all font-sans text-sm text-on-surface resize-none min-h-[120px]"
                  />
                </div>
              </div>
            </section>

            {/* Step 4: Contact Info */}
            <section className="bg-surface-container-low p-6 md:p-8 rounded-xl flex flex-col gap-6 shadow-sm border border-outline-variant/30">
              <div className="bg-[#fff1ed] p-3 rounded-lg border border-primary/20 text-center flex items-center gap-2 justify-center text-primary text-xs font-bold font-mono shadow-sm col-span-full">
                <span className="material-symbols-outlined text-base">storefront</span>
                Atención: Todos los pedidos son solo para retiro en tienda.
              </div>
              <div className="flex items-center gap-4 border-b border-outline-variant/40 pb-4">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg font-serif">4</div>
                <h2 className="font-serif text-2xl text-primary font-bold">Fecha y Datos de Contacto</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-primary">Fecha del Evento</label>
                  <input 
                    type="date" 
                    min={minDateStr}
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    required
                    className="w-full h-12 px-4 rounded-lg bg-white border border-outline focus:border-2 focus:border-primary focus:outline-none transition-all text-sm"
                  />
                  <p className="text-[11px] text-on-surface-variant italic">Requerimos 48h de anticipación para garantizar insumos frescos.</p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-primary">Cantidad de personas (Aprox.)</label>
                  <input 
                    type="number" 
                    min="1"
                    placeholder="Ej: 30"
                    value={portions}
                    onChange={(e) => setPortions(e.target.value)}
                    required
                    className="w-full h-12 px-4 rounded-lg bg-white border border-outline focus:border-2 focus:border-primary focus:outline-none transition-all text-sm"
                  />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-semibold text-primary">Tipo de Evento</label>
                  <select 
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    required
                    className="w-full h-12 px-4 rounded-lg bg-white border border-outline focus:border-2 focus:border-primary focus:outline-none transition-all text-sm"
                  >
                    <option value="">Selecciona un tipo de festejo...</option>
                    <option value="Matrimonio">Matrimonio</option>
                    <option value="Cumpleaños">Cumpleaños</option>
                    <option value="Aniversario">Aniversario</option>
                    <option value="Evento Corporativo">Evento Corporativo</option>
                    <option value="Baby Shower">Sombreado / Baby Shower</option>
                    <option value="Otro">Otro festejo especial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-semibold text-primary">Nombre Completo</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Ana García"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                    className="w-full h-12 px-4 rounded-lg bg-white border border-outline focus:border-2 focus:border-primary focus:outline-none transition-all text-sm"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-primary">Teléfono / WhatsApp</label>
                  <input 
                    type="tel" 
                    placeholder="Ej: +56 9 1234 5678"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    required
                    className="w-full h-12 px-4 rounded-lg bg-white border border-outline focus:border-2 focus:border-primary focus:outline-none transition-all text-sm"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-primary">Correo Electrónico</label>
                  <input 
                    type="email" 
                    placeholder="Ej: correo@ejemplo.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full h-12 px-4 rounded-lg bg-white border border-outline focus:border-2 focus:border-primary focus:outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </section>

          </form>
        </div>

        {/* Right Column: Sticky Summary */}
        <aside className="w-full lg:w-[35%] lg:sticky lg:top-[104px] z-10 flex flex-col gap-6">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-outline-variant/50 shadow-md flex flex-col gap-6">
            <h3 className="font-serif text-lg font-bold text-primary border-b border-outline-variant/40 pb-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl">receipt_long</span>
              Resumen del Pedido
            </h3>
            
            <div className="flex flex-col gap-5 text-sm text-on-surface">
              <div className="flex justify-between items-start gap-4">
                <span className="text-on-surface-variant font-medium shrink-0">Estructura Base:</span>
                <span className="text-right font-bold text-primary">{shape || 'Pendiente de selección'}</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-on-surface-variant font-medium shrink-0">Bizcocho:</span>
                <span className="text-right font-bold text-primary">{cakeBase || 'Pendiente'}</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-on-surface-variant font-medium shrink-0">Relleno:</span>
                <span className="text-right font-bold text-primary">{filling || 'Pendiente'}</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-on-surface-variant font-medium shrink-0">Cobertura:</span>
                <span className="text-right font-bold text-primary">{frosting || 'Pendiente'}</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-on-surface-variant font-medium shrink-0">Porciones / Pax:</span>
                <span className="text-right font-bold text-primary">{portions ? `${portions} personas` : '-'}</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-on-surface-variant font-medium shrink-0">Fecha de Entrega:</span>
                <span className="text-right font-bold text-primary">{deliveryDate || '-'}</span>
              </div>
            </div>

            <div className="mt-4 pt-6 border-t border-outline-variant/40">
              <p className="text-xs text-on-surface-variant mb-6 text-center italic leading-relaxed">
                * Este formulario envía una solicitud de diseño técnico. Te contactaremos dentro de 48 horas hábiles para acordar los ajustes finales para el retiro.
              </p>
              {errorMessage && <p className="text-xs text-error text-center mb-4 font-bold">{errorMessage}</p>}
              <button 
                type="submit" 
                form="custom-pedido-form"
                disabled={loading}
                className="w-full bg-primary text-white h-[56px] px-6 rounded-full font-bold text-sm hover:bg-[#3e2723] hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar Solicitud'}
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
