"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ITodo {
  id: string;
  title: string;
  completed: boolean;
  updatedAt: string;
}

const API_URL = "https://69080b1eb49bea95fbf23575.mockapi.io/api/v1/Todo";
const MAIN_COLOR = "rgb(13, 177, 130)";

const FullPageBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] bg-[#050505] overflow-hidden">
      <div 
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(${MAIN_COLOR} 2px, transparent 2px), linear-gradient(90deg, ${MAIN_COLOR} 2px, transparent 2px)`,
          backgroundSize: '80px 80px'
        }}
      />
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 0, 
            x: Math.random() * 100 + "vw", 
            y: Math.random() * 100 + "vh" 
          }}
          animate={{ 
            opacity: [0, 0.3, 0],
            x: [Math.random() * 100 + "vw", Math.random() * 100 + "vw"],
            y: [Math.random() * 100 + "vh", Math.random() * 100 + "vh"],
            rotate: [0, 180]
          }}
          transition={{ 
            duration: Math.random() * 25 + 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute border"
          style={{ 
            borderColor: MAIN_COLOR,
            width: Math.random() * 150 + 50 + "px",
            height: Math.random() * 150 + 50 + "px",
            borderStyle: i % 2 === 0 ? 'solid' : 'dashed'
          }}
        />
      ))}
    </div>
  );
};

export default function TodoApp() {
  const [todos, setTodos] = useState<ITodo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const getStamp = () => new Date().toLocaleString("uz-UZ", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    day: "2-digit", month: "2-digit", year: "numeric"
  });

  useEffect(() => {
    setIsMounted(true);
    setCurrentTime(new Date().toLocaleTimeString());
    const t = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const r = await fetch(API_URL);
      const d = await r.json();
      if (Array.isArray(d)) setTodos(d.sort((a, b) => Number(b.id) - Number(a.id)));
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const add = async () => {
    if (!inputValue.trim()) return;
    setLoading(true);
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: inputValue, completed: false, updatedAt: getStamp() }),
      });
      setInputValue("");
      fetchAll();
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const toggle = async (t: ITodo) => {
    const up = { ...t, completed: !t.completed, updatedAt: getStamp() };
    setTodos(prev => prev.map(i => i.id === t.id ? up : i));
    try {
      await fetch(`${API_URL}/${t.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(up) });
    } catch (e) { fetchAll(); }
  };

  const remove = async (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
    try { await fetch(`${API_URL}/${id}`, { method: "DELETE" }); } catch (e) { fetchAll(); }
  };

  const saveEdit = async (t: ITodo) => {
    if (!editValue.trim()) return;
    const up = { ...t, title: editValue, updatedAt: getStamp() };
    setEditId(null);
    setTodos(prev => prev.map(i => i.id === t.id ? up : i));
    try {
      await fetch(`${API_URL}/${t.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(up) });
    } catch (e) { fetchAll(); }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 md:p-10 font-mono text-black">
      <FullPageBackground />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-6xl bg-white border-[6px] md:border-[10px] border-black shadow-[15px_15px_0px_0px_#000] md:shadow-[30px_30px_0px_0px_#000] z-10 flex flex-col md:flex-row overflow-hidden"
      >
        {/* SIDEBAR / HEADER */}
        <div className="w-full md:w-72 lg:w-96 bg-black text-white p-6 md:p-10 flex flex-col justify-between border-b-[6px] md:border-b-0 md:border-r-[10px] border-black">
          <div className="flex md:flex-col justify-between items-center md:items-start">
            <div>
              <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter leading-none">TASKS</h1>
              <div className="h-2 md:h-4 w-12 md:w-full mt-2 md:mt-4" style={{ backgroundColor: MAIN_COLOR }}></div>
            </div>
            <div className="md:mt-10 text-right md:text-left">
              <span className="hidden md:block text-[10px] font-bold opacity-50 uppercase tracking-widest mb-2">Current System Time</span>
              <p className="text-xl md:text-5xl font-black tabular-nums tracking-tighter">{currentTime}</p>
            </div>
          </div>
          
          <div className="hidden md:block mt-10">
            <div className="border border-white/20 p-4 space-y-2 bg-white/5">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span className="opacity-50">Total Node:</span>
                    <span>{todos.length}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span className="opacity-50">Completed:</span>
                    <span style={{ color: MAIN_COLOR }}>{todos.filter(t => t.completed).length}</span>
                </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 p-4 md:p-12 bg-[#f8f8f8]">
          {/* INPUT SECTION */}
          <div className="flex mb-8 md:mb-12 border-[4px] md:border-[8px] border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="ADD NEW OBJECTIVE..."
              className="flex-1 p-3 md:p-6 bg-transparent outline-none text-black font-black text-base md:text-2xl uppercase placeholder:text-neutral-300 min-w-0"
            />
            <button
              onClick={add}
              disabled={loading}
              className="px-6 md:px-12 font-black text-sm md:text-2xl text-white border-l-[4px] md:border-l-[8px] border-black transition-all active:translate-y-1 shrink-0"
              style={{ backgroundColor: MAIN_COLOR }}
            >
              {loading ? "..." : "ADD"}
            </button>
          </div>

          {/* LIST SECTION */}
          <div className="space-y-4 md:space-y-6 max-h-[50vh] md:max-h-[600px] overflow-y-auto pr-2 scroll-custom">
            <AnimatePresence mode="popLayout">
              {todos.map((todo) => (
                <motion.div
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="bg-white border-[3px] md:border-[4px] border-black p-4 md:p-6 flex flex-col gap-3 relative group hover:shadow-[8px_8px_0px_0px_#000] transition-all"
                >
                  <div className="flex items-start justify-between gap-3 md:gap-6">
                    <div className="flex items-start gap-3 md:gap-6 flex-1 min-w-0">
                      <div 
                        onClick={() => toggle(todo)}
                        className={`w-8 h-8 md:w-12 md:h-12 border-[3px] md:border-[4px] border-black cursor-pointer flex items-center justify-center shrink-0 transition-all ${todo.completed ? 'bg-black' : 'bg-white'}`}
                      >
                        {todo.completed && <span className="text-white text-xl md:text-3xl font-black">!</span>}
                      </div>

                      <div className="flex-1 min-w-0">
                        {editId === todo.id ? (
                          <input
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => saveEdit(todo)}
                            onKeyDown={(e) => e.key === "Enter" && saveEdit(todo)}
                            className="w-full bg-neutral-100 border-b-2 md:border-b-4 border-black text-lg md:text-2xl font-black text-black outline-none p-1 uppercase"
                          />
                        ) : (
                          <div className="flex flex-col">
                            <h3 
                              onClick={() => toggle(todo)}
                              className={`text-lg md:text-2xl font-black uppercase cursor-pointer leading-tight transition-all break-words ${todo.completed ? 'opacity-20 line-through' : 'text-black'}`}
                            >
                              {todo.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="w-6 md:w-10 h-[2px]" style={{ backgroundColor: MAIN_COLOR }}></span>
                              <span className="text-[8px] md:text-[10px] font-black text-neutral-400 uppercase tabular-nums tracking-tighter">
                                {todo.updatedAt}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <button 
                        onClick={() => {setEditId(todo.id); setEditValue(todo.title);}} 
                        className="px-2 md:px-4 py-1 md:py-2 border-2 border-black font-black text-[9px] md:text-xs hover:bg-black hover:text-white transition-all uppercase"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => remove(todo.id)} 
                        className="px-2 md:px-4 py-1 md:py-2 border-2 border-black font-black text-[9px] md:text-xs bg-black text-white hover:bg-red-600 transition-all uppercase"
                      >
                        Del
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {todos.length === 0 && !loading && (
            <div className="text-center py-10 md:py-20 border-[4px] md:border-[8px] border-dashed border-neutral-200">
              <p className="font-black text-neutral-300 text-2xl md:text-4xl uppercase tracking-tighter italic">Zero Objectives</p>
            </div>
          )}
        </div>
      </motion.div>

      <style jsx global>{`
        .scroll-custom::-webkit-scrollbar { width: 8px; }
        .scroll-custom::-webkit-scrollbar-track { background: transparent; }
        .scroll-custom::-webkit-scrollbar-thumb { background: black; }
        
        /* Hamma elementlardan radiusni olib tashlash */
        * { border-radius: 0px !important; }
        
        /* Cursor dizayni */
        body { cursor: crosshair; }
        
        /* Seleksiya rangi */
        ::selection { background: ${MAIN_COLOR}; color: white; }

        @media (max-width: 768px) {
          .scroll-custom::-webkit-scrollbar { width: 4px; }
        }
      `}</style>
    </div>
  );
}