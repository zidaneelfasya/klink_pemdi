"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Phone, Video, MoreVertical, Paperclip, Camera, Mic, Send } from "lucide-react"

interface ChatMessage {
  id: number
  sender: "user" | "bot"
  message: string
  timestamp: string
  status?: "sent" | "delivered" | "read"
}

const whatsappScript: Omit<ChatMessage, 'id' | 'timestamp' | 'status'>[] = [
  { sender: "user", message: "/klinik_pemdi" },
  { sender: "bot", message: `Selamat datang di layanan chatbot Klinik PEMDI! 👋

Silakan pilih salah satu opsi berikut dengan mengetik angka atau teks:

1️⃣ *Bertanya tentang Klinik PEMDI* (ketik: 1 atau tanya)
2️⃣ *Tidak Memerlukan Layanan* (ketik: 2 atau tidak)

Contoh: ketik "1" untuk mulai bertanya` },
  { sender: "user", message: "1" },
  { sender: "bot", message: "Silakan bertanya tentang kebutuhan Anda terkait Klinik PEMDI. Saya siap membantu! 😊" },
  { sender: "user", message: "bagaimana cara mengajukan layanan bssn" },
  { sender: "bot", message: `Untuk mengajukan layanan di Badan Siber dan Sandi Negara (BSSN), berikut adalah langkah-langkah yang perlu diikuti:

1.  *Surat Permohonan:* Instansi Pusat atau Pemerintah Daerah mengirimkan surat permohonan layanan. Surat ini ditujukan kepada Kepala BSSN c.g. Direktorat terkait di lingkungan Deputi Bidang Keamanan Siber dan Sandi Pemerintahan dan Pembangunan Manusia.
2.  *Waktu Pengiriman Surat:* Surat permohonan dikirim paling lambat 1 minggu sebelum tanggal pelaksanaan pelayanan.
3.  *Alamat Email:* Surat permohonan dikirim melalui email ke alamat:

    *   humasbssn.go.id
    *   Sesuai dengan Direktorat terkait:
    *   Direktorat Keamanan Siber dan Sandi Pemerintah Pusat: tu.d31bssn.go.id
    *   Direktorat Keamanan Siber dan Sandi Pemerintah D…Read More` },
  { sender: "bot", message: `Apakah anda puas dengan jawabannya?

1️⃣ Ya, puas (ketik: ya atau 1)
2️⃣ Tidak puas (ketik: tidak atau 2)

Silakan pilih salah satu opsi di atas` },
  { sender: "user", message: "1" },
  { sender: "bot", message: "Terima kasih telah menggunakan layanan chatbot klinik pemdi. 😊" }

]

export default function WhatsAppPreview() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (currentIndex < whatsappScript.length) {
      const timer = setTimeout(() => {
        const currentMessage = whatsappScript[currentIndex]
        
        if (currentMessage.sender === "bot") {
          setIsTyping(true)
          setTimeout(() => {
            setIsTyping(false)
            setMessages(prev => [...prev, {
              id: currentIndex,
              ...currentMessage,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: "read"
            }])
            setCurrentIndex(prev => prev + 1)
          }, 2000) // Bot typing delay
        } else {
          setMessages(prev => [...prev, {
            id: currentIndex,
            ...currentMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: "read"
          }])
          setCurrentIndex(prev => prev + 1)
        }
      }, currentIndex === 0 ? 1000 : 3000) // Initial delay and between messages

      return () => clearTimeout(timer)
    } else {
      // Reset animation after completion
      const resetTimer = setTimeout(() => {
        setMessages([])
        setCurrentIndex(0)
        setIsTyping(false)
      }, 6000)
      
      return () => clearTimeout(resetTimer)
    }
  }, [currentIndex, messages.length])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages, isTyping])

  return (
    <div className="relative h-[500px] w-full max-w-sm mx-auto">
      {/* WhatsApp Container */}
      <div className="relative h-full bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-gray-800">
        {/* Status Bar */}
        <div className="bg-green-500 px-4 py-1 flex justify-between items-center text-white text-xs">
          <div className="flex items-center gap-1">
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
            <span className="ml-2">Telkomsel</span>
          </div>
          <div>09:41</div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-2 border border-white rounded-sm">
              <div className="w-full h-full bg-white rounded-sm"></div>
            </div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-3 h-2 border border-white rounded-sm">
              <div className="w-2/3 h-full bg-white rounded-sm"></div>
            </div>
          </div>
        </div>

        {/* Chat Header */}
        <div className="bg-green-500 px-4 py-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white p-2 rounded-full flex items-center justify-center">
              <img src="images/klinik_logo.svg" alt="" />
            </div>
            <div>
              <div className="font-semibold text-sm">Klinik PEMDI</div>
              <div className="text-xs opacity-90">online</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Video className="w-5 h-5" />
            <Phone className="w-5 h-5" />
            <MoreVertical className="w-5 h-5" />
          </div>
        </div>

        {/* Chat Background */}
        <div 
          className="flex-1 relative"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundColor: '#e5ddd5'
          }}
        >
          {/* Chat Messages */}
          <div 
            ref={scrollRef}
            className="h-80 p-4 space-y-2 overflow-y-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.3, 
                    ease: "easeOut"
                  }}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[75%] rounded-lg px-3 py-2 shadow-sm ${
                    message.sender === "user" 
                      ? "bg-green-500 text-white rounded-tr-sm" 
                      : "bg-white text-gray-800 rounded-tl-sm"
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-line">{message.message}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 ${
                      message.sender === "user" ? "text-white/80" : "text-gray-500"
                    }`}>
                      <span className="text-xs">{message.timestamp}</span>
                      {message.sender === "user" && (
                        <div className="flex">
                          <div className="w-4 h-3 text-white/80">
                            <svg viewBox="0 0 16 11" className="w-full h-full fill-current">
                              <path d="m11.1 2.7-5.5 5.5-2.4-2.4L2 7l3.6 3.6L12.3 4l-1.2-1.3z"/>
                              <path d="m5.8 7.5-2.4-2.4L2.2 6.3l3.6 3.6L16.4 4.2 15.1 2.9 5.8 7.5z"/>
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-start"
                >
                  <div className="bg-white rounded-lg rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1">
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 bg-gray-500 rounded-full"
                      />
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-gray-500 rounded-full"
                      />
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-gray-500 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-gray-100 px-4 py-2 flex items-center gap-3">
          <div className="flex items-center gap-3 text-gray-600">
            <Paperclip className="w-5 h-5" />
            <Camera className="w-5 h-5" />
          </div>
          <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Type a message"
              className="flex-1 bg-transparent text-sm outline-none"
              disabled
            />
            <Mic className="w-5 h-5 text-gray-600" />
          </div>
          <button className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
