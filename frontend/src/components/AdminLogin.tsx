import React, { useState, useEffect } from 'react';

interface AdminLoginProps {
  onLoginSuccess: (token: string) => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const maxLen = 6;

  const handleKeyClick = (val: string) => {
    if (pin.length < maxLen) {
      setPin(prev => prev + val);
      setErrorMessage('');
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0) {
      setPin(prev => prev.slice(0, -1));
      setErrorMessage('');
    }
  };

  const handleVerify = async () => {
    if (pin.length !== maxLen) return;
    setLoading(true);
    setErrorMessage('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        onLoginSuccess(data.token);
      } else {
        setErrorMessage(data.error || 'Código incorrecto. Inténtelo de nuevo.');
        setPin('');
      }
    } catch (err) {
      setErrorMessage('Error de conexión con la cocina.');
    } finally {
      setLoading(false);
    }
  };

  // Keyboard listening supports native testing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key) && pin.length < maxLen) {
        setPin(prev => prev + e.key);
        setErrorMessage('');
      } else if (e.key === 'Backspace') {
        setPin(prev => prev.slice(0, -1));
        setErrorMessage('');
      } else if (e.key === 'Enter' && pin.length === maxLen) {
        handleVerify();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin]);

  return (
    <div className="flex-grow w-full min-h-[600px] flex overflow-hidden">
      {/* Split Layout Left: Ambient Imagery */}
      <div className="hidden lg:block lg:w-5/12 xl:w-1/2 relative bg-primary-container">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-85" 
          style={{ backgroundImage: `url('https://sabor.eluniverso.com/wp-content/uploads/2024/01/shutterstock_642373528-scaled.jpg')` }}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/95"></div>
        <div className="absolute bottom-12 left-12 right-12 z-10 text-white space-y-2">
          <h1 className="font-serif text-4xl font-bold">Dulce Descontrol</h1>
          <p className="font-sans text-sm text-[#ffe1ed] max-w-sm">Sistema de Gestión de Cocina. Entorno de alta precisión para operaciones artesanales organizadas.</p>
        </div>
      </div>

      {/* Split Layout Right: Operator Terminal login */}
      <main className="w-full lg:w-7/12 xl:w-1/2 h-full flex flex-col justify-center items-center p-8 bg-[#fff8f6] z-10 py-12">
        <div className="w-full max-w-md flex flex-col gap-6">
          <div className="text-center flex flex-col gap-2">
            <h1 className="lg:hidden font-serif text-3xl font-bold text-primary mb-1">Dulce Descontrol</h1>
            <h2 className="font-serif text-2xl font-bold text-primary">Acceso Administrativo</h2>
            <p className="font-sans text-xs text-on-surface-variant">Ingrese su código de operador de 6 dígitos (PIN por defecto: 123456).</p>
          </div>

          {/* PIN Digit Boxes Indicators */}
          <div className="flex justify-between gap-3 w-full my-1">
            {Array.from({ length: maxLen }).map((_, idx) => {
              const char = pin[idx] || '';
              const isActive = idx === pin.length;
              return (
                <div 
                  key={idx} 
                  className={`w-12 h-16 bg-white border-2 rounded-lg flex items-center justify-center font-sans font-bold text-xl text-primary transition-all shadow-sm ${
                    isActive ? 'border-primary ring-2 ring-primary bg-[#ffdbd0]' : char ? 'border-primary bg-primary-container/10' : 'border-outline-variant'
                  }`}
                >
                  {char ? '•' : ''}
                </div>
              );
            })}
          </div>

          {/* Error Message */}
          {errorMsg && <p className="text-error text-center text-xs font-bold -mt-2 animate-pulse">{errorMsg}</p>}

          {/* Keypad numbers mapping grid */}
          <div className="grid grid-cols-3 gap-4 w-full select-none">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(val => (
              <button 
                key={val} 
                onClick={() => handleKeyClick(val)}
                className="h-16 bg-[#ffe9e3] hover:bg-[#ffe2da] active:bg-[#e3beb8] rounded-xl flex items-center justify-center font-serif text-2xl text-primary font-bold shadow-sm border border-outline-variant/20 transition-colors focus:outline-none"
              >
                {val}
              </button>
            ))}
            
            {/* Last row keypad elements */}
            <div className="h-16"></div>
            <button 
              onClick={() => handleKeyClick('0')}
              className="h-16 bg-[#ffe9e3] hover:bg-[#ffe2da] active:bg-[#e3beb8] rounded-xl flex items-center justify-center font-serif text-2xl text-primary font-bold shadow-sm border border-outline-variant/20 transition-colors focus:outline-none"
            >
              0
            </button>
            <button 
              onClick={handleBackspace}
              aria-label="Borrar"
              className="h-16 bg-[#fff1ed] hover:bg-[#ffe2da] active:bg-[#ffdad6] rounded-xl flex items-center justify-center text-on-surface-variant shadow-sm border border-outline-variant/20 transition-all focus:outline-none"
            >
              <span className="material-symbols-outlined text-2xl">backspace</span>
            </button>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col gap-4 mt-2">
            <button 
              onClick={handleVerify}
              disabled={pin.length !== maxLen || loading}
              className={`w-full h-16 bg-primary hover:bg-[#3e2723] active:scale-98 text-white rounded-xl flex items-center justify-center font-sans font-bold text-sm transition-all shadow-md ${
                pin.length !== maxLen || loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Confirmando...' : 'Confirmar Acceso'}
            </button>
            
            <button 
              type="button"
              onClick={() => setErrorMessage('Simulación: El código temporal ha sido enviado al correo de operaciones.')}
              className="text-xs text-on-surface-variant hover:text-primary transition-colors text-center underline"
            >
              Enviar código temporal al correo electrónico
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
