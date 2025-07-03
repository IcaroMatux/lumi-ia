import React, { useState, useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";
import { Clipboard, ThumbsUp, ThumbsDown } from "lucide-react";
import { Paperclip } from "lucide-react";



export default function App() {
  const [chatHistories, setChatHistories] = useState(() => {
    try {
      const saved = localStorage.getItem("chatHistories");
      const parsed = saved ? JSON.parse(saved) : { "Chat 1": [] };
      return typeof parsed === "object" && !Array.isArray(parsed) ? parsed : { "Chat 1": [] };
    } catch {
      return { "Chat 1": [] };
    }
  });

  const [currentChat, setCurrentChat] = useState(() => {
    return localStorage.getItem("currentChat") || "Chat 1";
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingMessage, setTypingMessage] = useState("");
  const [waitingToNameChat, setWaitingToNameChat] = useState(false);
  const [chats, setChats] = useState(() => Object.keys(chatHistories || { "Chat 1": [] }));
  const [attachment, setAttachment] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [typingChat, setTypingChat] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const isSendingRef = useRef(false);
  const [copied, setCopied] = useState(null);
  const [showFeedbackPopup, setShowFeedBackPopup] = useState(false);



  useEffect(() => {
    localStorage.setItem("chatHistories", JSON.stringify(chatHistories));
  }, [chatHistories]);

  useEffect(() => {
    localStorage.setItem("currentChat", currentChat);
  }, [currentChat]);


  useEffect(() => {
    if (Object.keys(chatHistories).length === 0) {
      const newChatName = "Chat 1";
      setChatHistories({ [newChatName]: [] });
      setChats([newChatName]);
      setCurrentChat(newChatName);
    }
  }, [chatHistories]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);


  const handleNewChat = () => {
    const newChatName = `Chat ${chats.length + 1}`;
    setChats((prev) => [...prev, newChatName]);
    setChatHistories((prev) => ({ ...prev, [newChatName]: [] }));
    setCurrentChat(newChatName);
    setWaitingToNameChat(true);
  };

  const handleChatClick = (chat) => {
    setCurrentChat(chat);
  };

  const handleDeleteChat = (chatToDelete) => {
    setChatHistories((prev) => {
      const updated = { ...prev };
      delete updated[chatToDelete];
      return updated;
    });

    setChats((prev) => {
      const updatedChats = prev.filter((chat) => chat !== chatToDelete);

      // ⚡ Se não restar nenhum, cria "Nova Conversa"
      if (updatedChats.length === 0) {
        const fallbackChat = "Nova Conversa";
        setChatHistories({ [fallbackChat]: [] });
        setCurrentChat(fallbackChat);
        setWaitingToNameChat(true);
        return [fallbackChat];
      }

      // ⚡ Se restar só 1, ativa renomeio
      if (updatedChats.length === 1) {
        setWaitingToNameChat(true);
      }

      return updatedChats;
    });

    // Atualiza o chat atual se necessário
    if (currentChat === chatToDelete) {
      setCurrentChat((prev) => {
        const remainingChats = chats.filter((chat) => chat !== chatToDelete);
        return remainingChats.length > 0 ? remainingChats[0] : "Nova Conversa";
      });
    }
  };



  const handleInputChange = (e) => setInput(e.target.value);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // volta para false depois de 2s
  };

  const handleFeedBackClick = (index, rating) => {
    console.log("Feedback:", rating);

    handleRateMessage(index, rating); // Marca a mensagem

    setShowFeedBackPopup(true); // Mostra o popup

    setTimeout(() => setShowFeedBackPopup(false), 3000);
  };

  const handleRateMessage = (index, rating) => {
    setChatHistories((prev) => {
      const updatedChat = [...(prev[currentChat] || [])];
      if (updatedChat[index] && updatedChat[index].sender === "bot") {
        updatedChat[index] = {
          ...updatedChat[index], rating,
          feedbackComment: rating === "like"
            ? "Resposta Satisfatória"
            : "Resposta Insatisfatória"
        };
        const feedbackText =
          rating === "like" ? "Resposta Satisfatória." : "Resposta Insatisfatória";
        updatedChat[index] = {
          ...updatedChat[index],
          rating,
          feedbackComment: feedbackText,
        };
      }
      return { ...prev, [currentChat]: updatedChat };
    });
  };

  const handleSend = async () => {
    if (isSendingRef.current || typingMessage !== "" || (input.trim() === "" && !attachment)) return;

    isSendingRef.current = true;
    setLoading(true);


    const userMessage = {
      sender: "user",
      ...(attachment && { image: attachment }),
      ...(input.trim() && { text: input }),
    };

    setChatHistories((prev) => ({
      ...prev,
      [currentChat]: [...(prev[currentChat] || []), userMessage],
    }));

    setInput("");
    setTypingMessage("...");
    setTypingChat(currentChat);
    setLoading(true);

    try {
      const formData = new FormData();
      const prompt = input.trim() !== "" ? input : "Analise esta imagem em português do Brasil.";
      formData.append("prompt", prompt);

      if (attachment && attachment.startsWith("data:")) {
        const blob = await (await fetch(attachment)).blob();
        formData.append("file", blob);
      }

      const API_BASE_URL = process.env.REACT_APP_API_URL;

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data || !data.response) {
        throw new Error("Resposta inválida do backend");
      }

      const fullText = data.response;

      // Simulação de digitação
      let index = 0;
      const speed = 25;

      setTypingMessage("");

      const typeChar = () => {
        if (index < fullText.length) {
          setTypingMessage((prev) => prev + fullText[index]);
          index++;
          setTimeout(typeChar, speed);
        } else {
          const botMessage = { sender: "bot", text: fullText };
          setChatHistories((prev) => ({
            ...prev,
            [currentChat]: [...(prev[currentChat] || []), botMessage],
          }));
          setTypingMessage("");

          // Renomear chat se necessário
          if (waitingToNameChat && fullText.length > 0) {
            const firstLine = fullText.split("\n")[0].trim();
            const maxLength = 30;
            let newName = firstLine.slice(0, maxLength + 1);

            if (newName.length > maxLength) {
              const lastSpace = newName.lastIndexOf(" ");
              newName = lastSpace > 0 ? newName.slice(0, lastSpace) : newName.slice(0, maxLength);
            }

            newName = newName || currentChat;

            if (newName !== currentChat && !chats.includes(newName)) {
              setChatHistories((prev) => {
                const updated = { ...prev };
                updated[newName] = updated[currentChat];
                delete updated[currentChat];
                return updated;
              });

              setChats((prevChats) =>
                prevChats.map((chat) => (chat === currentChat ? newName : chat))
              );

              setCurrentChat(newName);
            }

            setWaitingToNameChat(false);
          }
        }
      };

      typeChar();
    } catch (error) {
      console.error("Erro ao chamar o backend:", error);
      const errorMessage = { sender: "bot", text: "Erro ao gerar resposta da IA." };
      setChatHistories((prev) => ({
        ...prev,
        [currentChat]: [...(prev[currentChat] || []), errorMessage],
      }));
      setTypingMessage("");
    } finally {
      setLoading(false);
      isSendingRef.current = false
      setAttachment(null);
      setPreviewImage(null);
    }
  };


  // 
  return (
    <div className="flex flex-col md:flex-row h-screen bg-white text-black dark:bg-[#202123] dark:text-white transition-all duration-1500 ease-in-out">
      <aside className="flex md:flex w-full md:w-64 bg-gray-100 dark:bg-[#1e1f29] text-black dark:text-white p-5 border-r border-white/20 flex-col shadow-lg transition-all duration-1500 ease-in-out">

        <div className="flex flex-col pb-2 mb-4">
          <div className="flex items-center mb-2">
            <MessageSquare className="w-5 h-5 mr-2" />
            <h2 className="text-xl md:text-2xl font-bold tracking-wide">
              Chats
            </h2>
          </div>
          <div className="w-full border-b border-gray-400 dark:border-gray-600"></div>
        </div>




        <ul className="flex flex-col overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {chats.map((chat, index) => (
            <li
              key={index}
              onClick={() => handleChatClick(chat)}
              className={`p-3 cursor-pointer transition-colors duration-200 ${chat === currentChat
                ? "bg-gray-300 dark:bg-gray-700 text-black dark:text-white"
                : "hover:bg-gray-200 dark:hover:bg-gray-600 text-black dark:text-white"
                }`}
            >
              {chat}
            </li>
          ))}
        </ul>

        <div className="wfull -mx-5 border-t border-white/20 my-4 "></div>
        <button
          onClick={handleNewChat}
          className="mt-5 flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full text-white font-semibold px-5 py-3 shadow-md transition transform hover:-translate-y-0.5 hover:scale-105 active:translate-y-0 active:scale-100 focus:outline-none focus:ring-4 focus:ring-blue-400/50"
          title="Criar novo chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Novo Chat
        </button>

        <button
          onClick={() => handleDeleteChat(currentChat)}
          className="mt-3 flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full text-white font-semibold px-5 py-3 shadow-md transition transform hover:-translate-y-0.5 hover:scale-105 active:translate-y-0 active:scale-100 focus:outline-none focus:ring-4 focus:ring-red-400/50"
          title="Deletar chat atual"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4" />
          </svg>
          Deletar Chat
        </button>
      </aside>


      <main className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 bg-white dark:bg-[#1A1A1A] transition-all duration-1500 ease-in-out">

        <div className="flex items-center justify-between mb-6">
          <h1 className="flex-1 text-center text-2xl sm:text-3xl md:text-4xl font-semibold text-black dark:text-gray-100 tracking-wide">
            Como posso ajudar?
          </h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-gray-200 text-black dark:bg-gray-600 dark:text-white px-3 py-2 rounded-xl shadow transition hover:scale-105"
          >
            {darkMode ? "☀️ Claro" : "🌙 Escuro"}
          </button>
        </div>


        <div className="flex-1 overflow-y-auto mb-6 space-y-5 p-4 md:p-6 rounded-2xl bg-[#20232a] bg-gray-100 dark:bg-[#1e1f29] shadow-inner scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {(chatHistories[currentChat] || []).map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-full md:max-w-3xl px-4 py-3 md:px-5 md:py-4 rounded-2xl border transition-all duration-300 ${msg.sender === "user"
                ? "ml-auto bg-gray-200 dark:bg-gray-600 text-black dark:text-white border-gray-300 dark:border-gray-600"
                : "mr-auto bg-gray-100 dark:bg-[#1e1e1e] border border-gray-300 dark:border-gray-700 text-black dark:text-gray-300"}`}
            >
              {msg.image ? (
                <div className="flex flex-col items-center space-y-2">
                  <img src={msg.image} alt="anexo" className="rounded-lg max-w-full sm:max-w-xs mx-auto shadow-md" />
                  {msg.text?.trim() && <p className="text-sm text-center text-gray-300">{msg.text}</p>}
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{msg.text}</div>
              )}
              {msg.sender === "bot" && (
                <div className="mt-2 flex gap-2 justify-end">
                  {msg.rating ? (
                    <div
                      className={`mt-2 text-sm font-semibold ${msg.rating === "like"
                        ? "text-green-500 dark:text-green-400"
                        : "text-red-500 dark:text-red-400"
                        }`}
                    >
                      {msg.feedbackComment}
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-4 mt-4">
                        {/* Copiar */}
                        <button
                          onClick={() => handleCopy(msg.text)}
                          className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                        >
                          <Clipboard className="w-5 h-5" strokeWidth={1.5} />
                          <span className="text-sm">Copiar</span>
                          {copied && (
                            <span className="ml-2 text-green-500 text-xs transition-opacity duration-200">
                              Copiado!
                            </span>
                          )}
                        </button>



                        {/* Gostei */}
                        <button
                          onClick={() => handleFeedBackClick(idx, "like")}
                          // onClick={() => console.log("Gostei")}
                          className="text-gray-400 hover:text-green-500 transition-colors duration-200"
                          title="Gostei"
                        >
                          <ThumbsUp className="w-5 h-5" strokeWidth={1.5} />
                        </button>


                        {/* Não gostei */}
                        <button
                          onClick={() => handleFeedBackClick(idx, "dislike")}
                          // onClick={() => console.log("Não gostei")}
                          className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                          title="Não gostei"
                        >
                          <ThumbsDown className="w-5 h-5" strokeWidth={1.5} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}


          {typingMessage && typingChat === currentChat && (
            <div className="whitespace-pre-wrap px-4 py-3 md:px-5 md:py-4 rounded-2xl max-w-full md:max-w-3xl border mr-auto bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-black dark:text-gray-300 animate-pulse shadow-md">
              {typingMessage}
            </div>
          )}
        </div>

        {
          previewImage && (
            <div className="relative w-20 h-20">
              <img src={previewImage} alt="Preview" className="w-full h-full object-cover rounded-xl" />
              <button
                onClick={() => {
                  setAttachment(null);
                  setPreviewImage(null);
                }}
                className="absolute -top-2 -right-2 bg-white text-black rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-500 hover:text-white transition"
                title="Remover imagem"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )
        }

        <div className="sticky bg-gray-100 dark:bg-[#1e1f29] p-4 sm:p-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 items-stretch sm:items-center rounded-t-3xl shadow-lg">
          <label
            htmlFor="fileUpload"
            className="p-3 dark:hover:bg-gray-600 rounded-2xl cursor-pointer text-black dark:text-white transition-colors text-center"
            title="Anexar arquivo"
          >
            <Paperclip className="w-5 h-5" />
          </label>

          <input
            type="file"
            id="fileUpload"
            accept="image/*"
            disabled={loading}
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;

              const toBase64 = (file) =>
                new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result);
                  reader.onerror = reject;
                  reader.readAsDataURL(file);
                });

              const base64 = await toBase64(file);
              setAttachment(base64); // Agora é uma string base64, não o File
              setPreviewImage(base64); // Exibe a imagem corretamente mesmo após reload
            }}
            style={{ display: "none" }}
          />

          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            disabled={loading || typingMessage !== ""}
            placeholder="Digite sua pergunta..."
            className="flex-1 p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none border border-gray-600 shadow-inner placeholder-gray-400 transition-all focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (!loading && typingMessage === "") {
                  handleSend();
                }
              }
            }}
          />

          <button
            onClick={handleSend}
            className="relative flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 rounded-full text-white font-semibold text-lg shadow-lg shadow-green-800/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-green-400"
            disabled={loading || typingMessage !== ""}
            title="Enviar mensagem"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"></path>
                </svg>
                Enviando...
              </>
            ) : (
              "Enviar"
            )}
          </button>
        </div>
        {showFeedbackPopup && (
          <div className="fixed bottom-5 right-5 bg-white text-black px-6 py-4 rounded-xl shadow-xl animate-bounce transition-all duration-300">
            Obrigado pelo feedback! 🎉
          </div>
        )}
      </main >
    </div >
  );
}
