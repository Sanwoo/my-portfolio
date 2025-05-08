import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import slideUp from "@/utils/slideUp";
import useClickOutside from "@/lib/useClickOutside";

// Deepseek API 配置
const DEEPSEEK_API_KEY = "sk-9ca735b930f34f5798b5c8795ad419e2";
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

const AiChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    [
      {
        role: "assistant",
        content: "Hi, I'm deepseek of Ounce, anything I can help u?",
      },
    ]
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const clickOutsideRef = useClickOutside<HTMLDivElement>(() =>
    setIsOpen(false)
  );

  // 添加历史消息导航状态
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // 当消息列表更新时，滚动到底部
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    // 重置历史索引
    setHistoryIndex(-1);
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 只有当有历史消息时才处理上下键
    if (messageHistory.length === 0) return;

    if (e.key === "ArrowUp") {
      e.preventDefault(); // 防止光标移动到输入框开头
      // 向上浏览历史消息
      const newIndex =
        historyIndex < messageHistory.length - 1
          ? historyIndex + 1
          : historyIndex;
      setHistoryIndex(newIndex);
      setInput(messageHistory[newIndex] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault(); // 防止光标移动到输入框末尾
      // 向下浏览历史消息
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(messageHistory[newIndex]);
      } else if (historyIndex === 0) {
        // 如果已经到达最新的消息，则清空输入框
        setHistoryIndex(-1);
        setInput("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 添加用户消息
    setMessages([...messages, { role: "user", content: input }]);
    const userInput = input;

    // 将当前消息添加到历史记录的开头
    setMessageHistory((prev) => [userInput, ...prev]);
    // 重置历史索引
    setHistoryIndex(-1);

    setInput("");
    setIsLoading(true);

    try {
      // 准备发送给 Deepseek 的消息历史
      const messageHistory = [
        ...messages.map((msg) => ({ role: msg.role, content: msg.content })),
        { role: "user", content: userInput },
      ];

      const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat", // 指定模型
          messages: messageHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
      }

      const data = await response.json();

      // 处理 Deepseek API 的响应
      const botReply =
        data.choices && data.choices[0]?.message?.content
          ? data.choices[0].message.content
          : "Sry, I can't understand";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: botReply },
      ]);
    } catch (error) {
      console.error("发送消息时出错:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sry, something went weong, try again later plz!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed left-4 bottom-4 z-50">
      <div ref={clickOutsideRef}>
        <motion.button
          onClick={toggleChat}
          variants={slideUp(1)}
          initial="initial"
          whileInView="animate"
          className="hover:cursor-pointer hover:scale-110 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full p-3 shadow-lg duration-300 flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
            />
          </svg>
        </motion.button>

        {/* 对话窗口 */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="absolute bottom-16 left-0 w-80 md:w-96 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200"
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 flex justify-between items-center">
                <h3 className="font-medium">Deepseek Assistant</h3>
                <button
                  onClick={toggleChat}
                  className="text-white hover:text-gray-200 transition-colors hover:cursor-pointer"
                  aria-label="关闭聊天"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              <div
                ref={chatContainerRef}
                className="p-3 h-80 overflow-y-auto flex flex-col gap-3 bg-gray-50"
              >
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-blue-100 self-end text-blue-900"
                        : "bg-white self-start text-gray-800 shadow-sm border border-gray-200"
                    }`}
                  >
                    {msg.content}
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white self-start p-3 rounded-lg flex items-center gap-1 shadow-sm border border-gray-200"
                  >
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </motion.div>
                )}
              </div>

              <form
                onSubmit={handleSubmit}
                className="border-t p-3 flex gap-2 bg-white"
              >
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    messageHistory.length
                      ? "↑↓ to Switch historical input"
                      : "Say something..."
                  }
                  className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <motion.button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md px-4 py-2 disabled:opacity-50"
                  disabled={isLoading || !input.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  发送
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AiChatBot;
