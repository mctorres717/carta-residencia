"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- CONEXIÓN A SUPABASE ---
const supabase = createClient(
  'https://spdhfslvbslsuuzckmqr.supabase.co',
  'sb_publishable_DH68PA1DWbc66PALwVDyXA_dHLQPrL1'
);

const numeroALetras = (num: number): string => {
  const unidades = ['cero', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve', 'treinta', 'treinta y un'];
  return unidades[num] || num.toString();
};

const mesesLetras = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const anioActual = new Date().getFullYear();
const listaAnios = Array.from({ length: anioActual - 2010 + 1 }, (_, i) => anioActual - i);

export default function SistemaTorreD10() {
  const [isLogged, setIsLogged] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'CARTA' | 'ACTUALIZAR'>('CARTA');
  
  const [propietarios, setPropietarios] = useState<any[]>([]);
  const [buscar, setBuscar] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [propietarioSeleccionado, setPropietarioSeleccionado] = useState<any>(null);
  const [fechaManual, setFechaManual] = useState('');
  const [fechaActual, setFechaActual] = useState({ diaLetras: '', diaNumero: 0, mesLetras: '', anoNumero: 2026 });

  const [editingProp, setEditingProp] = useState<any>(null);
  const [pisoActivo, setPisoActivo] = useState('TODOS');

  useEffect(() => {
    const hoy = new Date();
    actualizarFecha(hoy);
    setFechaManual(hoy.toISOString().split('T')[0]);
    fetchPropietarios();

    const channel = supabase.channel('cambios-d10')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'propietarios_d10' }, fetchPropietarios)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchPropietarios = async () => {
    const { data } = await supabase.from('propietarios_d10').select('*');
    if (data) {
      const ordenados = data.sort((a, b) => a.apartamento.localeCompare(b.apartamento, undefined, { numeric: true, sensitivity: 'base' }));
      setPropietarios(ordenados);
    }
  };

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
    // AQUÍ PUEDES CAMBIAR LA CLAVE DE ACCESO
    if (password === 'admin2026') setIsLogged(true);
    else alert('Clave de acceso denegada.');
  };

  const handleSavePropietario = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('propietarios_d10')
      .update({
        propietario: editingProp.propietario,
        cedula: editingProp.cedula,
        piso: editingProp.piso,
        inicio_mes: editingProp.inicio_mes,
        inicio_ano: editingProp.inicio_ano
      })
      .eq('id', editingProp.id);

    if (error) alert(`Error al guardar: ${error.message}`);
    else {
      alert(`Datos del apartamento ${editingProp.apartamento} actualizados con éxito.`);
      setEditingProp(null);
      fetchPropietarios();
    }
  };

  const handlePrint = () => {
    if (!propietarioSeleccionado) return;
    const partesNombre = propietarioSeleccionado.propietario.trim().split(/\s+/);
    const primerNombre = partesNombre[0] || '';
    let primerApellido = '';
    if (partesNombre.length === 2) primerApellido = partesNombre[1];
    else if (partesNombre.length >= 3) primerApellido = partesNombre[2];

    const nombreFormateado = `${primerNombre} ${primerApellido}`.trim();
    const hoy = new Date();
    const fechaDescarga = `${String(hoy.getDate()).padStart(2, '0')}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${hoy.getFullYear()}`;
    
    const tituloOriginal = document.title;
    document.title = `Carta de Residencia – ${nombreFormateado} – Apto ${propietarioSeleccionado.apartamento} – ${fechaDescarga}`;
    window.print();
    setTimeout(() => { document.title = tituloOriginal; }, 1000);
  };

  const getSemaforoEstilo = (item: any) => {
    const nombre = item.propietario?.trim().toLowerCase() || '';
    if (nombre === '' || nombre === 'vacío' || nombre === 'vacio') {
      return { tarjeta: 'border-red-900/40 bg-red-950/30 text-red-400', badge: 'bg-red-500/20 text-red-400 border-red-500/30', texto: 'Disponible' };
    }
    if (item.propietario && item.cedula && item.piso && item.inicio_mes && item.inicio_ano) {
      return { tarjeta: 'border-emerald-900/40 bg-emerald-950/30 text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', texto: 'Completo' };
    }
    return { tarjeta: 'border-amber-900/40 bg-amber-950/30 text-amber-400', badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30', texto: 'Incompleto' };
  };

  const listaFiltradaCarta = propietarios.filter((item: any) =>
    item.apartamento?.toString().toLowerCase().includes(buscar.toLowerCase()) ||
    item.propietario?.toString().toLowerCase().includes(buscar.toLowerCase())
  );

  const pisosUnicos = Array.from(new Set(propietarios.map(p => p.piso).filter(Boolean))).sort((a: any, b: any) => Number(a) - Number(b));
  const propietariosFiltradosActualizar = pisoActivo === 'TODOS' 
    ? propietarios 
    : propietarios.filter((p: any) => p.piso === pisoActivo);

  if (!isLogged) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
        <form onSubmit={handleLogin} className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm">
          <div className="flex justify-between items-center mb-8 px-2">
            <img src="/ministerio.png" alt="Min" className="h-10 w-auto object-contain opacity-80" onError={(e) => e.currentTarget.style.display='none'} />
            <img src="/logo_edificio.png" alt="Torre D10" className="h-10 w-auto object-contain opacity-80" onError={(e) => e.currentTarget.style.display='none'} />
          </div>
          <h1 className="text-lg font-bold text-center text-white uppercase tracking-widest mb-6">Portal Administrativo</h1>
          <input type="password" placeholder="Clave de acceso" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-center text-white font-bold tracking-widest outline-none focus:border-blue-500 mb-6 transition-colors" value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg uppercase tracking-wider transition-colors shadow-lg text-sm">Ingresar al Sistema</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans antialiased pb-12 print:bg-white print:text-black print:p-0">
      <style>{`
        @media print {
          @page { size: letter portrait; margin: 2.5cm 3cm 2.5cm 3cm; }
          .no-print { display: none !important; }
          body { background-color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-area { box-shadow: none !important; margin: 0 !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; min-height: auto !important; height: auto !important; font-family: serif !important;}
        }
      `}</style>
      
      {/* HEADER CORPORATIVO COMPACTO */}
      <header className="no-print bg-slate-900 border-b border-slate-800 py-4 px-4 shadow-lg sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
        <div className="max-w-5xl mx-auto flex flex-col gap-4">
          
          {/* Fila Superior: Distribución Matemática 3 Columnas */}
          <div className="flex items-center justify-between w-full">
            {/* Izquierda: Ministerio */}
            <div className="w-1/4 flex justify-start">
              <img src="/ministerio.png" alt="Ministerio" className="h-10 md:h-14 w-auto object-contain" onError={(e) => e.currentTarget.style.display='none'} />
            </div>

            {/* Centro: Títulos Compactos */}
            <div className="w-2/4 text-center flex flex-col justify-center">
              <h1 className="text-lg md:text-2xl font-bold text-white uppercase tracking-widest drop-shadow-sm leading-tight">Conjunto Residencial Torre D-10</h1>
              <h2 className="text-[9px] md:text-xs text-slate-400 uppercase tracking-widest mt-1">Urbanismo Simón Bolívar, Sector D, Torre D-10, Ciudad Tiuna, Coche – Caracas</h2>
            </div>

            {/* Derecha: Edificio y Botón Salir */}
            <div className="w-1/4 flex flex-col items-end justify-center gap-2">
              <img src="/logo_edificio.png" alt="Logo Edificio" className="h-10 md:h-14 w-auto object-contain" onError={(e) => e.currentTarget.style.display='none'} />
              <button onClick={() => { setIsLogged(false); setPassword(''); }} className="text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded transition-colors uppercase font-bold tracking-widest border border-slate-700">Cerrar Sesión</button>
            </div>
          </div>

          {/* Fila Inferior: Pestañas */}
          <div className="flex gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800 w-full max-w-sm mx-auto">
            <button onClick={() => setActiveTab('CARTA')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === 'CARTA' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Emisión Oficial</button>
            <button onClick={() => setActiveTab('ACTUALIZAR')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === 'ACTUALIZAR' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>Gestión de Datos</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-8">
        
        {/* PESTAÑA: CARTA DE RESIDENCIA */}
        {activeTab === 'CARTA' && (
          <div className="no-print animate-fadeIn max-w-3xl mx-auto">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row gap-6 items-end relative z-30">
              <div className="w-full md:w-2/3 relative">
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Seleccionar Propietario</label>
                <div className="flex">
                  <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-l-xl p-3.5 text-sm font-semibold text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="Buscar apto o nombre..." value={buscar} onChange={(e) => { setBuscar(e.target.value); setIsOpen(true); }} onFocus={() => setIsOpen(true)} />
                  <button onClick={() => setIsOpen(!isOpen)} className="bg-slate-800 border-y border-r border-slate-700 rounded-r-xl px-4 text-slate-400 hover:text-white">▼</button>
                </div>
                {isOpen && (
                  <ul className="absolute left-0 right-0 mt-2 max-h-60 bg-slate-900 border border-slate-800 rounded-xl overflow-y-auto shadow-2xl z-50 divide-y divide-slate-800 custom-scrollbar">
                    {listaFiltradaCarta.map((item: any, idx: number) => (
                      <li key={idx} onClick={() => { setPropietarioSeleccionado(item); setBuscar(item.apartamento); setIsOpen(false); }} className="p-4 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer flex justify-between items-center transition-colors">
                        <span className="font-bold bg-slate-950 px-3 py-1 rounded text-white border border-slate-800">{item.apartamento}</span>
                        <span className="text-xs truncate max-w-[200px] uppercase font-mono">{item.propietario || 'Disponible'}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="w-full md:w-1/3">
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Fecha del Documento</label>
                <input type="date" value={fechaManual} onChange={handleCambioFecha} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm font-semibold text-white cursor-pointer focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
            </div>
            <button onClick={handlePrint} disabled={!propietarioSeleccionado} className={`w-full mt-6 py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-xl flex items-center justify-center gap-2 ${propietarioSeleccionado ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'}`}>🖨️ Generar Constancia Oficial</button>
          </div>
        )}

        {/* PESTAÑA: ACTUALIZAR DATA */}
        {activeTab === 'ACTUALIZAR' && (
          <div className="no-print flex flex-col md:flex-row gap-6 animate-fadeIn">
            
            {/* Panel Lateral Elegante */}
            <div className="w-full md:w-52 flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <button onClick={() => setPisoActivo('TODOS')} className={`px-4 py-3.5 flex-none md:w-full rounded-xl text-xs font-bold tracking-wider uppercase transition-colors shadow-sm text-left ${pisoActivo === 'TODOS' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-white'}`}>
                🏢 Todos los Pisos
              </button>
              {pisosUnicos.map(piso => (
                <button key={piso} onClick={() => setPisoActivo(piso as string)} className={`px-4 py-3 flex-none md:w-full rounded-xl text-xs font-bold tracking-wider uppercase transition-colors shadow-sm text-left ${pisoActivo === piso ? 'bg-slate-800 text-white border border-slate-600' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-white'}`}>
                  Nivel {piso}
                </button>
              ))}
            </div>

            {/* Grilla Ejecutiva */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 h-fit">
              {propietariosFiltradosActualizar.map((item: any) => {
                const estilo = getSemaforoEstilo(item);
                return (
                  <div key={item.id} className={`p-5 rounded-xl border transition-all flex flex-col justify-between shadow-md bg-slate-900 hover:border-slate-600`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-xl font-bold tracking-tight block text-white">Apto {item.apartamento}</span>
                        <span className={`text-xs font-bold uppercase block mt-1 tracking-wider ${item.propietario ? 'text-blue-400' : 'text-slate-500'}`}>{item.propietario || 'Sin Propietario Registrado'}</span>
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border ${estilo.badge}`}>{estilo.texto}</span>
                    </div>
                    
                    <div className="text-[11px] font-mono text-slate-400 space-y-1.5 mb-5 border-t border-slate-800 pt-3">
                      <div className="flex justify-between"><span className="uppercase text-[9px] tracking-widest">Cédula:</span> <span className="text-slate-200 font-sans font-medium">{item.cedula || 'Pendiente'}</span></div>
                      <div className="flex justify-between"><span className="uppercase text-[9px] tracking-widest">Piso:</span> <span className="text-slate-200 font-sans font-medium">{item.piso || 'Pendiente'}</span></div>
                      <div className="flex justify-between"><span className="uppercase text-[9px] tracking-widest">Ingreso:</span> <span className="text-slate-200 font-sans font-medium">{item.inicio_mes ? `${item.inicio_mes} ${item.inicio_ano}` : 'Pendiente'}</span></div>
                    </div>

                    <button onClick={() => setEditingProp(item)} className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors">Modificar Registro</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Ejecutivo de Edición */}
        {editingProp && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 no-print animate-fadeIn">
            <form onSubmit={handleSavePropietario} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold uppercase tracking-wider text-white">Apto {editingProp.apartamento}</h3>
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700 font-mono">Edición</span>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Nombre Completo del Propietario</label>
                <input type="text" value={editingProp.propietario || ''} onChange={e => setEditingProp({...editingProp, propietario: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="Ej: SINDY CHACÓN" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Cédula</label>
                  <input type="text" value={editingProp.cedula || ''} onChange={e => setEditingProp({...editingProp, cedula: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="Ej: 17693292" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Piso</label>
                  <input type="text" value={editingProp.piso || ''} onChange={e => setEditingProp({...editingProp, piso: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="Ej: 1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Mes de Ingreso</label>
                  <select value={editingProp.inicio_mes || ''} onChange={e => setEditingProp({...editingProp, inicio_mes: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 appearance-none transition-colors cursor-pointer">
                    <option value="">-- Seleccionar --</option>
                    {mesesLetras.map(mes => <option key={mes} value={mes} className="capitalize">{mes}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Año de Ingreso</label>
                  <select value={editingProp.inicio_ano || ''} onChange={e => setEditingProp({...editingProp, inicio_ano: e.target.value})} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 appearance-none transition-colors cursor-pointer">
                    <option value="">-- Seleccionar --</option>
                    {listaAnios.map(anio => <option key={anio} value={anio}>{anio}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setEditingProp(null)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-lg text-xs uppercase tracking-wider transition-colors border border-slate-700">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-lg shadow-blue-900/20">Guardar Datos</button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* ÁREA DE IMPRESIÓN OFICIAL */}
      {activeTab === 'CARTA' && (
        <div className="print-area max-w-[800px] mx-auto bg-white text-black mt-8 p-[2.5cm] shadow-2xl min-h-[11in] text-justify flex flex-col justify-between" style={{ fontFamily: 'Times New Roman, serif', fontSize: '12pt' }}>
          {propietarioSeleccionado ? (
            <>
              <div>
                <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-8">
                  <img src="/ministerio.png" alt="Ministerio" className="h-16 w-auto object-contain" onError={(e) => e.currentTarget.style.display='none'} />
                  <img src="/logo_edificio.png" alt="Logo Edificio" className="h-16 w-auto object-contain" onError={(e) => e.currentTarget.style.display='none'} />
                </div>

                <h2 className="text-center font-bold underline uppercase tracking-wide mb-8" style={{ fontSize: '18pt' }}>Constancia de Residencia</h2>

                <p className="mb-5 font-normal" style={{ lineHeight: '1.7' }}>
                  Quienes suscriben, en representación del <strong className="font-bold">COMITÉ MULTIFAMILIAR DE GESTIÓN (C.M.G.) DE LA TORRE D-10</strong>, 
                  en el ejercicio de nuestras facultades como Voceros Principales del referido Comité en el Urbanismo "Simón Bolívar", 
                  Sector D, Ciudad Tiuna, por medio de la presente, hacemos constar que el (la) ciudadano (a) <strong className="font-bold uppercase">{propietarioSeleccionado.propietario}</strong>, 
                  titular de la cédula de identidad N° <strong className="font-bold">V-{propietarioSeleccionado.cedula}</strong>, de nacionalidad venezolano (a), 
                  habita en la: <strong className="font-bold">Torre D-10, Piso {propietarioSeleccionado.piso}, Apartamento {propietarioSeleccionado.apartamento}</strong>, 
                  desde el mes de {propietarioSeleccionado.inicio_mes} del año {propietarioSeleccionado.inicio_ano}.
                </p>

                <p className="mb-5" style={{ lineHeight: '1.7' }}>Tiempo durante el cual, el ciudadano ha mantenido una conducta ejemplar, observando los principios de convivencia ciudadana y respeto a las normas comunitarias establecidas en la edificación.</p>
                <p className="mb-5" style={{ lineHeight: '1.7' }}>Constancia que se expide a petición de la parte interesada en la ciudad de Caracas, a los {fechaActual.diaLetras} ({fechaActual.diaNumero}) días del mes de {fechaActual.mesLetras} del año {fechaActual.anoNumero}.</p>
              </div>

              <div>
                <div className="text-center" style={{ lineHeight: '1.7' }}>
                  <p className="font-normal m-0 p-0">Atentamente,</p>
                  <p className="m-0 p-0"><strong className="font-bold">Comité Multifamiliar de Gestión de la TORRE D-10</strong></p>
                </div>
                <div className="h-14"></div>
                <div className="mb-5 font-normal grid grid-cols-2 gap-x-12 text-center" style={{ fontSize: '11pt' }}>
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
                <p className="italic mb-4" style={{ fontSize: '8pt', lineHeight: '1.6' }}><strong className="font-bold">Nota: Se deja constancia que a la presente fecha el CMG de la torre D10, se encuentra en proceso de regularización ante la Inmobiliaria Nacional.</strong></p>
                <footer className="text-center pt-3 border-t border-gray-200" style={{ fontSize: '10pt' }}><strong className="font-bold">Urbanismo Simón Bolívar, Sector D, Torre D-10, Ciudad Tiuna, Coche – Caracas</strong></footer>
              </div>
            </>
          ) : (
            <div className="h-[70vh] flex flex-col items-center justify-center text-slate-800 border-4 border-dashed border-slate-200 rounded-2xl no-print font-sans">
              <span className="text-5xl mb-4 text-slate-300">🏢</span>
              <p className="text-sm font-semibold tracking-wide text-slate-400">Busca un vecino en el panel web para previsualizar el PDF oficial.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}