import React, { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className="flex-grow max-w-6xl mx-auto w-full px-4 py-12 flex flex-col items-center justify-center gap-12">
      {/* Hero Section */}
      <section className="text-center space-y-4 max-w-3xl">
        <h1 className="font-serif text-4xl md:text-5xl text-primary leading-tight font-bold">Hablemos de Dulce</h1>
        <p className="font-sans text-lg text-on-surface-variant leading-relaxed">
          Ya sea que estés planeando un gran evento de catering, haciendo un pedido especial, o simplemente tengas una dulce pregunta, nuestra cocina artesanal está lista para escucharte.
        </p>
      </section>

      {/* Main Content Area */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Contact Form */}
        <section className="bg-white rounded-xl shadow-lg border-2 border-outline-variant/10 p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-surface-container-highest rounded-bl-full opacity-50 pointer-events-none"></div>
          
          <h2 className="font-serif text-2xl font-bold text-primary mb-4 z-10 relative">Envíanos un mensaje</h2>
          
          {submitted ? (
            <div className="p-6 bg-tertiary-fixed text-on-tertiary-fixed rounded-lg text-center space-y-3 z-10 relative">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
              <h3 className="font-serif text-xl font-bold">¡Mensaje enviado con éxito!</h3>
              <p className="text-sm">Te responderemos en un plazo máximo de 24 horas hábiles.</p>
              <button 
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', subject: '', message: '' });
                }} 
                className="mt-2 text-xs font-bold underline cursor-pointer"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 z-10 relative">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface mb-2" htmlFor="name">Nombre</label>
                <input 
                  className="w-full h-12 px-4 rounded border-2 border-outline-variant focus:border-primary-container focus:ring-0 transition-colors bg-surface-bright text-on-surface font-sans" 
                  id="name" 
                  type="text" 
                  required
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface mb-2" htmlFor="email">Correo electrónico</label>
                <input 
                  className="w-full h-12 px-4 rounded border-2 border-outline-variant focus:border-primary-container focus:ring-0 transition-colors bg-surface-bright text-on-surface font-sans" 
                  id="email" 
                  type="email" 
                  required
                  placeholder="Tu correo electrónico"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface mb-2" htmlFor="subject">Asunto</label>
                <input 
                  className="w-full h-12 px-4 rounded border-2 border-outline-variant focus:border-primary-container focus:ring-0 transition-colors bg-surface-bright text-on-surface font-sans" 
                  id="subject" 
                  type="text" 
                  placeholder="Catering, pedido especial, etc."
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface mb-2" htmlFor="message">Mensaje</label>
                <textarea 
                  className="w-full p-4 rounded border-2 border-outline-variant focus:border-primary-container focus:ring-0 transition-colors bg-surface-bright text-on-surface font-sans resize-none" 
                  id="message" 
                  rows={4}
                  required
                  placeholder="¿Cómo podemos endulzar tu día?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>
              <button 
                className="w-full min-h-[52px] bg-error hover:bg-[#93000a] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95 mt-4" 
                type="submit"
              >
                Enviar Mensaje
              </button>
            </form>
          )}
        </section>

        {/* Direct Contact & Info */}
        <section className="space-y-8 flex flex-col justify-center h-full">
          <div className="grid gap-6">
            <div className="flex items-start gap-4 p-6 bg-surface-container rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">location_on</span>
              </div>
              <div>
                <h3 className="font-sans text-lg font-bold text-primary mb-1">Nuestra Pastelería</h3>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  123 Calle Artesanal<br />Distrito Pastelero, Santiago de Chile
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-surface-container rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">mail</span>
              </div>
              <div>
                <h3 className="font-sans text-lg font-bold text-primary mb-1">Escríbenos</h3>
                <p className="font-sans text-sm text-on-surface-variant lead-relaxed">
                  dulce.descontrol01@gmail.com
                </p>
              </div>
            </div>
          </div>

          {/* WhatsApp Action */}
          <div className="p-8 bg-surface-container-high rounded-xl text-center space-y-4">
            <h3 className="font-serif text-xl font-bold text-primary">¿Lo necesitas más rápido?</h3>
            <p className="font-sans text-sm text-on-surface-variant leading-relaxed">Chatea con nuestra cocina directamente para consultas urgentes.</p>
            <a 
              href="https://wa.me/56947452159" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 px-8 min-h-[52px] bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <span className="material-symbols-outlined">chat</span>
              Contactar por WhatsApp
            </a>
          </div>

          {/* Social Media */}
          <div className="text-center pt-4">
            <p className="font-sans text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">Sigue la dulzura</p>
            <div className="flex justify-center gap-6">
              <a className="w-12 h-12 rounded-full border-2 border-outline-variant flex items-center justify-center text-primary hover:bg-surface-variant hover:border-primary transition-colors" href="https://www.instagram.com/dulce.descontrol01/" target="_blank" rel="noopener noreferrer">
                <svg aria-hidden="true" className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path clipRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153 1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" fillRule="evenodd"></path>
                </svg>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
