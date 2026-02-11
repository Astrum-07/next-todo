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

// Orqa fon animatsiyasi - Ranglar korinadigan qilindi
const FullPageBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] bg-slate-50 overflow-hidden">
      {/* Grid setkasi - Siz aytgan rangda va yorqinroq */}
      <div 
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `linear-gradient(${MAIN_COLOR} 2px, transparent 2px), linear-gradient(90deg, ${MAIN_COLOR} 2px, transparent 2px)`,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Suzib yuruvchi tortburchaklar */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: Math.random() * 100 + "vw", y: "110vh" }}
          animate={{ 
            opacity: [0, 0.4, 0], 
            y: "-10vh",
            rotate: [0, 90, 180]
          }}
          transition={{ 
            duration: Math.random() * 15 + 10, 
            repeat: Infinity, 
            ease: "linear",
            delay: Math.random() * 10
          }}
          className="absolute border-[3px]"
          style={{ 
            borderColor: MAIN_COLOR,
            width: Math.random() * 100 + 50 + "px",
            height: Math.random() * 100 + 50 + "px",
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
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl bg-white border-[6px] border-black shadow-[20px_20px_0px_0px_rgba(13,177,130,0.4)] z-10 flex flex-col md:flex-row overflow-hidden"
      >
        {/* LEFT PANEL - Qora o'rniga rangliroq qilindi */}
        <div 
          className="w-full md:w-80 p-8 flex flex-col justify-between border-b-[6px] md:border-b-0 md:border-r-[6px] border-black text-white"
          style={{ backgroundColor: MAIN_COLOR }}
        >
          <div>
            <h1 className="text-6xl font-black italic tracking-tighter leading-none">CORE</h1>
            <div className="h-2 w-full mt-4 bg-black"></div>
            <div className="mt-10">
              <p className="text-[10px] font-bold uppercase mb-2 text-black/60">Current System Time</p>
              <p className="text-4xl font-black tabular-nums text-black">{currentTime}</p>
            </div>
          </div>
          
          <div className="mt-10 bg-black p-4 shadow-[4px_4px_0px_0px_#fff]">
            <div className="flex justify-between text-[10px] font-bold uppercase text-white">
              <span>Nodes: {todos.length}</span>
              <span style={{ color: MAIN_COLOR }}>Done: {todos.filter(t => t.completed).length}</span>
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="flex-1 p-4 md:p-10 bg-white flex flex-col min-w-0">
          
          {/* INPUT BAR */}
          <div className="flex mb-10 border-[5px] border-black bg-white shadow-[6px_6px_0px_0px_#000] shrink-0">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="ENTER TASK TITLE..."
              className="flex-1 p-5 outline-none text-black font-black text-xl uppercase placeholder:text-neutral-300 min-w-0"
            />
            <button
              onClick={add}
              disabled={loading}
              className="px-10 font-black text-xl text-white border-l-[5px] border-black transition-all active:translate-y-1 shrink-0"
              style={{ backgroundColor: MAIN_COLOR }}
            >
              {loading ? "..." : "ADD"}
            </button>
          </div>

          {/* LIST */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 max-h-[550px]">
            <AnimatePresence mode="popLayout">
              {todos.map((todo) => (
                <motion.div
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white border-[4px] border-black p-5 flex items-center justify-between group gap-4 transition-all hover:bg-neutral-50"
                  style={{ borderLeftColor: todo.completed ? "#000" : MAIN_COLOR, borderLeftWidth: "12px" }}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Checkbox */}
                    <div 
                      onClick={() => toggle(todo)}
                      className={`w-10 h-10 border-[4px] border-black cursor-pointer flex items-center justify-center shrink-0 transition-all ${todo.completed ? 'bg-black text-white' : 'bg-white hover:border-[rgb(13,177,130)]'}`}
                    >
                      {todo.completed && <span className="font-black text-xl">✓</span>}
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
                          className="w-full border-b-4 border-black font-black text-2xl outline-none bg-yellow-50 p-1 uppercase"
                        />
                      ) : (
                        <div className="flex flex-col min-w-0">
                          <h3 
                            onClick={() => toggle(todo)}
                            className={`text-xl font-black uppercase truncate transition-all ${todo.completed ? 'opacity-20 line-through' : 'text-black group-hover:text-[rgb(13,177,130)]'}`}
                          >
                            {todo.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-neutral-400 tabular-nums">UPDATED: {todo.updatedAt}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    <button 
                      onClick={() => {setEditId(todo.id); setEditValue(todo.title);}} 
                      className="px-4 py-2 border-[3px] border-black font-black text-xs hover:bg-black hover:text-white transition-all uppercase bg-white"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => remove(todo.id)} 
                      className="px-4 py-2 border-[3px] border-black font-black text-xs bg-black text-white hover:bg-red-600 transition-all uppercase"
                    >
                      Del
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {todos.length === 0 && !loading && (
            <div className="text-center py-20 border-[6px] border-dashed border-neutral-200">
              <p className="font-black text-neutral-300 text-3xl uppercase italic">No Active Streams</p>
            </div>
          )}
        </div>
      </motion.div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: black; }
        * { border-radius: 0px !important; }
        ::selection { background: ${MAIN_COLOR}; color: white; }
        input { color: black !important; }
      `}</style>
    </div>
  );
}