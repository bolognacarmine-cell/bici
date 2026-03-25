'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Mic, Sparkles } from 'lucide-react'

export const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, text: "Ciao! Sono l'assistente AI di Ciclofficina Vincenzo. Come posso aiutarti oggi?", sender: 'bot' },
  ])
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const hapticFeedback = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50) // PWA Standard Haptics
    }
  }

  const handleSend = () => {
    if (!input.trim()) return
    hapticFeedback()
    const userMsg = { id: Date.now(), text: input, sender: 'user' }
    setMessages([...messages, userMsg])
    setInput('')
    
    // Simulate bot response (Groq/Claude Mock)
    setTimeout(() => {
      const botMsg = { 
        id: Date.now() + 1, 
        text: "Ottima domanda! La nostra officina a Marcianise è specializzata in riparazioni di ogni tipo. Vuoi sapere gli orari o prenotare un appuntamento?", 
        sender: 'bot' 
      }
      setMessages(prev => [...prev, botMsg])
    }, 1000)
  }

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("La ricerca vocale non è supportata dal tuo browser.")
      return
    }
    
    setIsListening(!isListening)
    
    // Mock Web Speech API integration
    if (!isListening) {
      setTimeout(() => {
        setInput("Quali sono i vostri orari?")
        setIsListening(false)
      }, 2000)
    }
  }

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="mb-4 w-[350px] h-[500px] glass dark:glass-dark rounded-3xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-5 btn-primary flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="text-white w-6 h-6" />
                </div>
                <div>
                   <h3 className="font-bold text-white leading-tight">Vincenzo AI</h3>
                   <span className="text-xs text-white/70">Online ora</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg">
                <X className="text-white w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                    msg.sender === 'user' 
                    ? 'bg-primary-start text-white rounded-tr-none' 
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/20">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Scrivi un messaggio..."
                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-start outline-none"
                  />
                  <button 
                    onClick={toggleListening}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${isListening ? 'text-primary-start animate-pulse' : 'text-zinc-400'}`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={handleSend} className="w-12 h-12 btn-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 btn-primary rounded-full shadow-2xl flex items-center justify-center group"
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}
      </motion.button>
    </div>
  )
}
