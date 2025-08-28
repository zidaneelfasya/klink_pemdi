"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Search, MessageSquare, Send } from "lucide-react"

export default function ChatInterface() {
  const [selectedChat, setSelectedChat] = useState("que-123")
  const [message, setMessage] = useState("")

  const chatHistory = [
    {
      id: "que-123",
      title: "Lorem Ipsum is simply dummy text",
      preview:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's ...",
      date: "Oct 13",
    },
    {
      id: "que-124",
      title: "Lorem Ipsum is simply dummy text",
      preview:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's ...",
      date: "Oct 13",
    },
    {
      id: "que-125",
      title: "Lorem Ipsum is simply dummy text",
      preview:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's ...",
      date: "Oct 13",
    },
    {
      id: "que-126",
      title: "Lorem Ipsum is simply dummy text",
      preview:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's ...",
      date: "Oct 13",
    },
    {
      id: "que-127",
      title: "Lorem Ipsum is simply dummy text",
      preview:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's ...",
      date: "Oct 13",
    },
    {
      id: "que-128",
      title: "Lorem Ipsum is simply dummy text",
      preview:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's ...",
      date: "Oct 13",
    },
    {
      id: "que-129",
      title: "Lorem Ipsum is simply dummy text",
      preview:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's ...",
      date: "Oct 13",
    },
  ]

  const messages = [
    {
      id: 1,
      sender: "Tatang Suratang",
      code: "11818181",
      content:
        "Dalam upaya memperluas penerapan SPBE di daerah terpencil atau tertinggal, faktor seperti infrastruktur internet yang terbatas, rendahnya literasi digital, dan anggaran yang minim sering menjadi kendala. Bagaimana strategi yang dapat diadopsi oleh pemerintah pusat dan daerah untuk mengatasi disparitas ini, terutama dalam hal pembangunan infrastruktur, pelatihan SDM, dan pendanaan? Apakah model kolaborasi dengan penyedia layanan swasta atau BUMN bisa menjadi solusi? Bagaimana cara memastikan bahwa daerah tertinggal tidak semakin tertinggal dalam era digitalisasi?",
      timestamp: "Feb 28, 2025 10:31 AM",
      avatar: "/generic-user-avatar.png",
      initials: "TS",
      isUser: true,
    },
    {
      id: 2,
      sender: "Chatbot Asik",
      code: "11818181",
      content:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).",
      timestamp: "Feb 28, 2025 10:32 AM",
      avatar: "/chatbot-avatar.png",
      initials: "CA",
      isUser: false,
    },
  ]

  const handleSubmit = () => {
    if (message.trim()) {
      console.log("Submitting message:", message)
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="absolute top-0 right-0 z-10 p-4">
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-semibold text-gray-900 text-sm">Tatang Suratang</div>
            <div className="text-xs text-gray-500">tatang123@gmail.com</div>
          </div>
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-white">TS</span>
          </div>
        </div>
      </div>

      {/* Sidebar - Fixed position */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col h-full">
        <div className="p-3 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-900">History</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search History" className="pl-10 bg-gray-50 border-gray-200" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedChat === chat.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-900 text-sm line-clamp-1">{chat.title}</h3>
                <span className="text-xs text-gray-500 ml-2">{chat.date}</span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">{chat.preview}</p>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">{chat.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-6 py-2 flex-shrink-0 pt-16">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Lorem Ipsum is simply dummy text</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>que-123</span>
            </div>
            <span>|</span>
            <span>Created at 13/11/2025</span>
          </div>
        </div>

        <div className="p-4 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="relative">
            <Textarea
              placeholder="Isi Pertanyaan Anda Disini..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="min-h-[80px] resize-none border-gray-200 pr-12"
            />
            <Button
              onClick={handleSubmit}
              size="sm"
              className="absolute bottom-2 right-2 h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.isUser ? "justify-end" : "justify-start"}`}>
              {!msg.isUser && (
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-700">{msg.initials}</span>
                  </div>
                </div>
              )}

              <div className={`max-w-[70%] ${msg.isUser ? "order-1" : "order-2"}`}>
                <div className={`flex items-center gap-2 mb-2 ${msg.isUser ? "justify-end" : "justify-start"}`}>
                  <span className="font-semibold text-gray-900 text-sm">{msg.sender}</span>
                  <span className="text-xs text-gray-500">Code : {msg.code}</span>
                  <span className="text-xs text-gray-500">{msg.timestamp}</span>
                </div>

                <div
                  className={`rounded-2xl px-4 py-3 ${
                    msg.isUser ? "bg-blue-500 text-white rounded-br-md" : "bg-gray-100 text-gray-900 rounded-bl-md"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>

              {msg.isUser && (
                <div className="flex-shrink-0 order-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">{msg.initials}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
