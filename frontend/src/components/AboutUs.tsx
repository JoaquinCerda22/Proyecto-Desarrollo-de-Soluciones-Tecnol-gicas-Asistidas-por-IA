import React from 'react';

export default function AboutUs() {
  return (
    <div className="flex-grow">
      {/* Hero Section */}
      <section className="relative w-full h-[450px] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-80" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDswfz0A4LV3nnnVaGPYKookiLeFVJdRGUu_f2UjVZJwLFRtKmzXAiY_Z8NrYxzwsEnbHCSE9xaRGmmNx8PkwxCupqyYB-n7ATintCTSg9vSPPTsClKT7RaIrh48ZfQjLtS9gsbX-8YmxdMrjR1rBqrEeVxvhne_IHeFhYfObOWzgwfe23YffliCvvOMVswS8dTPghljX31ZP3LlOVph-FlD7QSgeZ6MdHtMoerPhHo-K_XIaEl3Dvzjzx3pmbd_yUUk8mHOUmDhjQL"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-12">
          <h1 className="font-serif text-5xl md:text-6xl text-primary mb-6 drop-shadow-md">Nuestra Historia</h1>
          <p className="font-sans text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto bg-white/80 p-6 rounded-xl backdrop-blur-sm border border-outline-variant shadow-lg leading-relaxed">
            Nacido de una pasión por la excelencia artesanal, abrazamos el 'dulce descontrol' de la cocina para crear pasteles que son organizados en sabor y confiables en deleite.
          </p>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="rounded-xl overflow-hidden shadow-lg border border-outline-variant/30 h-[450px]">
            <img 
              alt="Baking Ingredients" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCM5O8T8iuSTegMJyXIrXhQM1ph1iMhu-TwgAD7KP_rSkt62wtceL-T3KLnIW7S66M6zoZ-EeYMcAV8h1PCfSOmq5COTkj0W4TKYvFNwR4gJSjZKbygims19SVpHspgQe7jDqRP-amNqAOWy9j-VAPyGilvzPYUH7Bhi6ubOa2AWqR23Wpp6lz033jmUDoJ1UFzaZYLBMQ8Jx6UsQHjUIG9ZXwh0T5SZqVS_ocIwJApvOJVQyhJpyjKpTZkJfmz8lBEuh0cfqqBoeP"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col justify-center space-y-6">
            <h2 className="font-serif text-3xl md:text-4xl text-primary">Nuestra Misión</h2>
            <div className="w-16 h-1 bg-primary-container rounded-full"></div>
            <p className="font-sans text-lg text-on-surface leading-relaxed">
              En Dulce Descontrol creemos que la perfección se encuentra en la cuidadosa orquestación de los ingredientes crudos. Nuestra misión es transformar elementos simples—harina premium, mantequilla rica y azúcar de caña pura—en momentos de pura alegría.
            </p>
            <p className="font-sans text-base text-on-surface-variant leading-relaxed">
              No solo horneamos; diseñamos perfiles de sabor. Cada receta es un testimonio de nuestro compromiso con el rigor artesanal, equilibrando la calidez del trabajo manual con la precisión de la pastelería contemporánea para ofrecer una experiencia consistente y excepcional.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
