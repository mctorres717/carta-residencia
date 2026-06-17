"use client";

import React, { useState, useEffect } from 'react';
import propietariosData from '../data/propietarios.json';

const numeroALetras = (num: number): string => {
  const unidades = [
    'cero', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
    'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte',
    'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve', 'treinta', 'treinta y un'
  ];
  return unidades[num] || num.toString();
};

const mesesLetras = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

export default function GeneradorCartas() {
  const [isLogged, setIsLogged] = useState(false);
  const [password, setPassword] = useState('');
  const [buscar, setBuscar] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [propietarioSeleccionado, setPropietarioSeleccionado] = useState<any>(null);
  const [fechaManual, setFechaManual] = useState('');
  const [fechaActual, setFechaActual] = useState({ diaLetras: '', diaNumero: 0, mesLetras: '', anoNumero: 2026 });

  useEffect(() => {
    const hoy = new Date();
    actualizarFecha(hoy);
    setFechaManual(hoy.toISOString().split('T')[0]);
  }, []);

  const actualizarFecha = (fecha: Date) => {
    setFechaActual({
      diaLetras: numeroALetras(fecha.getDate()),
      diaNumero: fecha.getDate(),
      mesLetras: mesesLetras[fecha.getMonth()],
      anoNumero: fecha.getFullYear()
    });
  };

  const handleCambioFecha = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFechaManual(e.target.value);
    const nuevaFecha = new Date(e.target.value + 'T12:00:00');
    actualizarFecha(nuevaFecha);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin2026') { setIsLogged(true); }
    else alert('Clave de acceso denegada.');
  };

  const listaFiltrada = propietariosData.filter((item: any) =>
    item.APARTAMENTO?.toString().toLowerCase().includes(buscar.toLowerCase()) ||
    item.PROPIETARIO?.toString().toLowerCase().includes(buscar.toLowerCase())
  );

  const seleccionarPropietario = (prop: any) => {
    setPropietarioSeleccionado(prop);
    setBuscar(prop.APARTAMENTO);
    setIsOpen(false);
  };

  if (!isLogged) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 font-serif">
        <form onSubmit={handleLogin} className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm">
          <div className="flex justify-between items-center mb-8 px-2">
            <img src="/ministerio.png" alt="Min" className="h-12 w-auto object-contain opacity-90" onError={(e) => e.currentTarget.style.display='none'} />
            <img src="/logo_edificio.png" alt="Torre D10" className="h-12 w-auto object-contain opacity-90" onError={(e) => e.currentTarget.style.display='none'} />
          </div>
          <h1 className="text-xl font-bold text-center text-white uppercase tracking-widest mb-6">Portal Administrativo</h1>
          <input 
            type="password" 
            placeholder="Clave de administrador" 
            className="w-full bg-black border border-neutral-800 rounded-lg p-4 text-center text-white font-bold tracking-widest outline-none focus:border-neutral-500 mb-6 transition-colors"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-neutral-200 hover:bg-white text-black font-bold py-3 rounded-lg uppercase tracking-wider transition-colors shadow-lg">Entrar al Sistema</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-serif antialiased pb-12 print:bg-white print:text-black print:p-0">
      <style>{`
        @media print {
          body { bg-color: white; color: black; }
          .no-print { display: none !important; }
          .print-area { display: block !important; box-shadow: none !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
        }
      `}</style>

      <header className="no-print bg-neutral-900 border-b border-neutral-800 py-6 px-4 shadow-xl">
        <div className="max-w-4xl mx-auto flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <img src="/ministerio.png" alt="Ministerio" className="h-16 md:h-20 w-auto object-contain" onError={(e) => e.currentTarget.style.display='none'} />
            <div className="flex flex-col items-end">
              <img src="/logo_edificio.png" alt="Logo Edificio" className="h-16 md:h-20 w-auto object-contain mb-3" onError={(e) => e.currentTarget.style.display='none'} />
              <button onClick={() => { setIsLogged(false); setPassword(''); }} className="text-[10px] text-neutral-400 hover:text-white transition-colors uppercase font-bold tracking-widest">
                Cerrar Sesión
              </button>
            </div>
          </div>
          
          <div className="text-center w-full">
            <h1 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-widest whitespace-nowrap drop-shadow-sm">
              Conjunto Residencial Torre D-10
            </h1>
            <h2 className="text-xs md:text-sm text-neutral-400 uppercase tracking-widest whitespace-nowrap mt-2">
              Urbanismo Simón Bolívar, Sector D, Torre D-10, Ciudad Tiuna, Coche – Caracas
            </h2>
          </div>
        </div>
      </header>

      <div className="no-print max-w-3xl mx-auto pt-8 px-4">
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-6 items-end relative z-30">
          
          <div className="w-full md:w-2/3 relative">
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Buscador de Propietarios</label>
            <div className="flex">
              <input
                type="text"
                className="w-full bg-black border border-neutral-800 rounded-l-xl p-4 text-sm font-semibold text-white focus:outline-none focus:border-neutral-500 transition-colors"
                placeholder="Ej: 12-B o nombre..."
                value={buscar}
                onChange={(e) => { setBuscar(e.target.value); setIsOpen(true); }}
                onFocus={() => setIsOpen(true)}
              />
              <button onClick={() => setIsOpen(!isOpen)} className="bg-neutral-800 border-y border-r border-neutral-700 rounded-r-xl px-4 text-neutral-400 hover:text-white transition-colors">▼</button>
            </div>
            {isOpen && (
              <ul className="absolute left-0 right-0 mt-2 max-h-60 bg-black border border-neutral-800 rounded-xl overflow-y-auto shadow-2xl z-50 divide-y divide-neutral-900 custom-scrollbar">
                {listaFiltrada.length > 0 ? (
                  listaFiltrada.map((item: any, idx: number) => (
                    <li key={idx} onClick={() => seleccionarPropietario(item)} className="p-4 text-sm font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white cursor-pointer flex justify-between items-center transition-colors">
                      <span className="font-bold bg-neutral-900 px-3 py-1 rounded text-white border border-neutral-800">{item.APARTAMENTO}</span>
                      <span className="text-xs truncate max-w-[200px] uppercase font-mono">{item.PROPIETARIO}</span>
                    </li>
                  ))
                ) : (
                  <li className="p-4 text-sm text-neutral-500 text-center">No se encontraron registros</li>
                )}
              </ul>
            )}
          </div>

          <div className="w-full md:w-1/3">
            <label className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">Fecha de Emisión</label>
            <input 
              type="date" 
              value={fechaManual}
              onChange={handleCambioFecha}
              className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-sm font-semibold text-white focus:outline-none focus:border-neutral-500 transition-colors cursor-pointer"
            />
          </div>
        </div>

        <button
          onClick={() => window.print()}
          disabled={!propietarioSeleccionado}
          className={`w-full mt-6 py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-xl flex items-center justify-center gap-2 ${
            propietarioSeleccionado ? 'bg-white hover:bg-gray-200 text-black active:scale-[0.98]' : 'bg-neutral-900 text-neutral-600 cursor-not-allowed'
          }`}
        >
          🖨️ Generar y Descargar PDF
        </button>
      </div>

      <div className="print-area max-w-[800px] mx-auto bg-white text-black mt-8 p-[2.5cm] shadow-2xl min-h-[11in] font-serif text-justify text-[12pt]">
        {propietarioSeleccionado ? (
          <div>
            <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-8">
              <img src="/ministerio.png" alt="Ministerio" className="h-16 w-auto object-contain" onError={(e) => e.currentTarget.style.display='none'} />
              <img src="/logo_edificio.png" alt="Logo Edificio" className="h-16 w-auto object-contain" onError={(e) => e.currentTarget.style.display='none'} />
            </div>

            <h2 className="text-center text-[18pt] font-bold underline uppercase tracking-wide mb-10">
              Constancia de Residencia
            </h2>

            <p className="mb-6 leading-[1.8] tracking-normal font-normal">
              Quienes suscriben, en representación del <strong className="font-bold">COMITÉ MULTIFAMILIAR DE GESTIÓN (C.M.G.) DE LA TORRE D-10</strong>, 
              en el ejercicio de nuestras facultades como Voceros Principales del referido Comité en el Urbanismo "Simón Bolívar", 
              Sector D, Ciudad Tiuna, por medio de la presente, hacemos constar que el (la) ciudadano (a) <strong className="font-bold uppercase">{propietarioSeleccionado.PROPIETARIO}</strong>, 
              titular de la cédula de identidad N° <strong className="font-bold">V-{propietarioSeleccionado.CEDULA}</strong>, de nacionalidad venezolano (a), 
              habita en la: <strong className="font-bold">Torre D-10, Piso {propietarioSeleccionado.PISO}, Apartamento {propietarioSeleccionado.APARTAMENTO}</strong>, 
              desde el mes de {propietarioSeleccionado["INICIO MES"]} del año {propietarioSeleccionado["INICIO AÑO"]}.
            </p>

            <p className="mb-6 leading-[1.8]">
              Tiempo durante el cual, el ciudadano ha mantenido una conducta ejemplar, observando los principios de convivencia ciudadana y respeto a las normas comunitarias establecidas en la edificación.
            </p>

            <p className="mb-6 leading-[1.8]">
              Constancia que se expide a petición de la parte interesada en la ciudad de Caracas, a los {fechaActual.diaLetras} ({fechaActual.diaNumero}) días del mes de {fechaActual.mesLetras} del año {fechaActual.anoNumero}.
            </p>

            {/* SECCIÓN SIN COMILLAS */}
            <div className="text-center leading-[1.8]">
              <p className="font-normal m-0 p-0">Atentamente,</p>
              <p className="m-0 p-0"><strong className="font-bold">Comité Multifamiliar de Gestión de la TORRE D-10</strong></p>
            </div>
            
            <br/><br/><br/><br/>

            <div className="mb-10 font-normal grid grid-cols-2 gap-x-12 text-center text-[11pt]">
              <div>
                <p className="border-t border-black pt-2"><strong className="font-bold">Vocera Principal</strong></p>
                <p><strong className="font-bold">Sindy Chacón</strong></p>
                <p>C.I V- 17.693.292</p>
                <p>Telf. (0424) 560-15-62</p>
              </div>
              <div>
                <p className="border-t border-black pt-2"><strong className="font-bold">Vocero Principal</strong></p>
                <p><strong className="font-bold">Marcos Díaz</strong></p>
                <p>C.I V- 16.662.440</p>
                <p>Telf. (0414) 017-40-62</p>
              </div>
            </div>

            {/* NOTA SIN COMILLAS */}
            <p className="text-[8pt] italic leading-relaxed mb-6"><strong className="font-bold">Nota: Se deja constancia que a la presente fecha el CMG de la torre D10, se encuentra en proceso de regularización ante la Inmobiliaria Nacional.</strong></p>

            {/* FOOTER SIN COMILLAS */}
            <footer className="text-center text-[10pt] mt-8 pt-4 border-t border-gray-200"><strong className="font-bold">Urbanismo Simón Bolívar, Sector D, Torre D-10, Ciudad Tiuna, Coche – Caracas</strong></footer>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-neutral-800 py-36 border-4 border-dashed border-neutral-200 rounded-2xl no-print">
            <span className="text-5xl mb-4 text-neutral-300">🏢</span>
            <p className="text-sm font-semibold tracking-wide text-neutral-400">Busca un propietario para previsualizar el documento oficial.</p>
          </div>
        )}
      </div>
    </div>
  );
}