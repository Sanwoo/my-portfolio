import React, { useState } from "react";
import { IconArrowUp } from "@tabler/icons-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import { scroller } from "react-scroll";

// 点击回到页面顶部
const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  // 监听滚动超过300时显示按钮
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  });

  // 滚动到顶部的函数
  const scrollToTop = () => {
    scroller.scrollTo("Home", {
      duration: 800,
      delay: 0,
      smooth: "easeInOutQuart",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="hover:cursor-pointer fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg transition-colors hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2"
        >
          <IconArrowUp size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;
