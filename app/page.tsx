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
    <div className="fixed inset-0 z-[-1] bg-[#0a0a0a] overflow-hidden">
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(${MAIN_COLOR} 1.5px, transparent 1.5px), linear-gradient(90deg, ${MAIN_COLOR} 1.5px, transparent 1.5px)`,
          backgroundSize: '100px 100px'
        }}
      />
      {Array.from({ length: 25 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 0, 
            scale: 0.5, 
            x: Math.random() * 100 + "vw", 
            y: Math.random() * 100 + "vh" 
          }}
          animate={{ 
            opacity: [0, 0.4, 0],
            scale: [0.5, 1.2, 0.5],
            x: [Math.random() * 100 + "vw", Math.random() * 100 + "vw"],
            y: [Math.random() * 100 + "vh", Math.random() * 100 + "vh"]
          }}
          transition={{ 
            duration: Math.random() * 20 + 15, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute border-2 border-dashed"
          style={{ 
            borderColor: MAIN_COLOR,
            width: Math.random() * 200 + 50 + "px",
            height: Math.random() * 200 + 50 + "px",
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
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-10 font-mono">
      <FullPageBackground />
      
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-5xl bg-white border-[10px] border-black shadow-[30px_30px_0px_0px_#000] relative z-10 overflow-hidden flex flex-col md:flex-row"
      >
        <div className="md:w-80 bg-black text-white p-10 flex flex-col justify-between border-b-[10px] md:border-b-0 md:border-r-[10px] border-black">
          <div>
            <h1 className="text-8xl font-black italic tracking-tighter leading-none m-0">CORE</h1>
            <div className="h-4 w-full mt-4" style={{ backgroundColor: MAIN_COLOR }}></div>
            <p className="mt-8 text-[10px] font-bold opacity-50 uppercase tracking-[0.3em]">Data Management Terminal</p>
          </div>
          <div className="mt-20">
            <p className="text-sm font-bold opacity-40 uppercase mb-1">Live Feed:</p>
            <p className="text-5xl font-black tabular-nums tracking-tight">{currentTime}</p>
          </div>
        </div>

        <div className="flex-1 p-6 sm:p-12 bg-neutral-100">
          <div className="flex mb-12 border-[8px] border-black bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)]">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="ENTER OBJECTIVE..."
              className="flex-1 p-6 bg-transparent outline-none text-black font-black text-2xl uppercase placeholder:text-neutral-300"
            />
            <button
              onClick={add}
              disabled={loading}
              className="px-12 font-black text-2xl text-white border-l-[8px] border-black transition-all active:translate-y-1"
              style={{ backgroundColor: MAIN_COLOR }}
            >
              {loading ? "..." : "ADD"}
            </button>
          </div>

          <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 scroll-custom">
            <AnimatePresence mode="popLayout">
              {todos.map((todo) => (
                <motion.div
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-white border-[4px] border-black p-6 flex flex-col gap-4 relative group hover:border-[rgb(13,177,130)] transition-colors"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-start gap-6 flex-1">
                      <div 
                        onClick={() => toggle(todo)}
                        className={`w-12 h-12 border-[4px] border-black cursor-pointer flex items-center justify-center shrink-0 transition-all ${todo.completed ? 'bg-black' : 'bg-white'}`}
                      >
                        {todo.completed && <span className="text-white text-3xl font-black italic">!</span>}
                      </div>

                      <div className="flex-1">
                        {editId === todo.id ? (
                          <input
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => saveEdit(todo)}
                            onKeyDown={(e) => e.key === "Enter" && saveEdit(todo)}
                            className="w-full bg-neutral-100 border-b-4 border-black text-2xl font-black text-black outline-none p-1 uppercase"
                          />
                        ) : (
                          <div className="flex flex-col">
                            <h3 
                              onClick={() => toggle(todo)}
                              className={`text-2xl font-black uppercase cursor-pointer leading-tight transition-all ${todo.completed ? 'opacity-20 line-through' : 'text-black'}`}
                            >
                              {todo.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-3">
                              <span className="w-10 h-[3px]" style={{ backgroundColor: MAIN_COLOR }}></span>
                              <span className="text-[10px] font-black text-neutral-400 uppercase tabular-nums tracking-wider">
                                Sync: {todo.updatedAt} | ID: {todo.id}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => {setEditId(todo.id); setEditValue(todo.title);}} 
                        className="px-4 py-2 border-2 border-black font-black text-xs hover:bg-black hover:text-white transition-all uppercase"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => remove(todo.id)} 
                        className="px-4 py-2 border-2 border-black font-black text-xs bg-black text-white hover:bg-red-600 transition-all uppercase"
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
            <div className="text-center py-20 border-[8px] border-dashed border-neutral-200">
              <p className="font-black text-neutral-300 text-4xl uppercase tracking-tighter italic">No Stream Data</p>
            </div>
          )}
        </div>
      </motion.div>

      <style jsx global>{`
        .scroll-custom::-webkit-scrollbar { width: 12px; }
        .scroll-custom::-webkit-scrollbar-track { background: white; border-left: 4px solid black; }
        .scroll-custom::-webkit-scrollbar-thumb { background: black; border: 2px solid white; }
        * { border-radius: 0px !important; cursor: crosshair !important; }
        ::selection { background: ${MAIN_COLOR}; color: white; }
      `}</style>
    </div>
  );
}