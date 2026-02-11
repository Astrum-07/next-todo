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

// Orqa fon animatsiyasi - eng orqada turishini kafolatlaymiz
const FullPageBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] bg-[#0a0a0a] overflow-hidden">
      <div 
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(${MAIN_COLOR} 2px, transparent 2px), linear-gradient(90deg, ${MAIN_COLOR} 2px, transparent 2px)`,
          backgroundSize: '80px 80px'
        }}
      />
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: Math.random() * 100 + "vw", y: Math.random() * 100 + "vh" }}
          animate={{ opacity: [0, 0.2, 0], x: [Math.random() * 100 + "vw", Math.random() * 100 + "vw"], y: [Math.random() * 100 + "vh", Math.random() * 100 + "vh"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute border border-dashed border-[rgb(13,177,130)] w-40 h-40"
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
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 md:p-10 font-mono">
      <FullPageBackground />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-6xl bg-white border-[8px] border-black shadow-[20px_20px_0px_0px_#000] z-10 flex flex-col md:flex-row min-h-[600px]"
      >
        {/* SIDEBAR */}
        <div className="w-full md:w-80 bg-black text-white p-8 flex flex-col justify-between border-b-[8px] md:border-b-0 md:border-r-[8px] border-black">
          <div>
            <h1 className="text-6xl font-black italic tracking-tighter">TASKS</h1>
            <div className="h-4 w-full mt-4" style={{ backgroundColor: MAIN_COLOR }}></div>
            <div className="mt-10">
              <p className="text-[10px] font-bold opacity-50 uppercase mb-2">Current System Time</p>
              <p className="text-4xl font-black tabular-nums">{currentTime}</p>
            </div>
          </div>
          
          <div className="mt-10 border border-white/20 p-4 bg-white/5">
            <div className="flex justify-between text-[10px] font-bold uppercase">
              <span>Total: {todos.length}</span>
              <span style={{ color: MAIN_COLOR }}>Done: {todos.filter(t => t.completed).length}</span>
            </div>
          </div>
        </div>

        {/* MAIN AREA */}
        <div className="flex-1 p-4 md:p-10 bg-[#f9f9f9] flex flex-col min-w-0">
          
          {/* INPUT BAR */}
          <div className="flex mb-10 border-[6px] border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] shrink-0">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="ADD NEW OBJECTIVE..."
              className="flex-1 p-4 bg-transparent outline-none text-black font-black text-xl uppercase placeholder:text-neutral-300 min-w-0"
            />
            <button
              onClick={add}
              disabled={loading}
              className="px-8 font-black text-xl text-white border-l-[6px] border-black hover:brightness-110 active:bg-black shrink-0"
              style={{ backgroundColor: MAIN_COLOR }}
            >
              {loading ? "..." : "ADD"}
            </button>
          </div>

          {/* LIST */}
          <div className="flex-1 overflow-y-auto pr-2 scroll-custom space-y-4">
            <AnimatePresence mode="popLayout">
              {todos.map((todo) => (
                <motion.div
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white border-[4px] border-black p-4 flex items-center justify-between group gap-4"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Checkbox */}
                    <div 
                      onClick={() => toggle(todo)}
                      className={`w-10 h-10 border-[4px] border-black cursor-pointer flex items-center justify-center shrink-0 ${todo.completed ? 'bg-black text-white' : 'bg-white'}`}
                    >
                      {todo.completed && <span className="font-black">!</span>}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {editId === todo.id ? (
                        <input
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit(todo)}
                          onKeyDown={(e) => e.key === "Enter" && saveEdit(todo)}
                          className="w-full border-b-2 border-black font-black text-xl outline-none bg-neutral-100 p-1"
                        />
                      ) : (
                        <div className="flex flex-col min-w-0">
                          <h3 
                            onClick={() => toggle(todo)}
                            className={`text-xl font-black uppercase truncate ${todo.completed ? 'opacity-20 line-through' : 'text-black'}`}
                          >
                            {todo.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="w-6 h-[2px]" style={{ backgroundColor: MAIN_COLOR }}></span>
                            <span className="text-[9px] font-bold text-neutral-400 tabular-nums">{todo.updatedAt}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions - DOIM KO'RINADIGAN QILINDI */}
                  <div className="flex gap-2 shrink-0">
                    <button 
                      onClick={() => {setEditId(todo.id); setEditValue(todo.title);}} 
                      className="px-3 py-1 border-2 border-black font-black text-[10px] hover:bg-black hover:text-white transition-all uppercase bg-white text-black"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => remove(todo.id)} 
                      className="px-3 py-1 border-2 border-black font-black text-[10px] bg-black text-white hover:bg-red-600 transition-all uppercase"
                    >
                      Del
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <style jsx global>{`
        .scroll-custom::-webkit-scrollbar { width: 8px; }
        .scroll-custom::-webkit-scrollbar-track { background: #eee; }
        .scroll-custom::-webkit-scrollbar-thumb { background: black; }
        * { border-radius: 0px !important; }
        input { color: black !important; } /* Matn yozganda qora bo'lishi uchun */
      `}</style>
    </div>
  );
}