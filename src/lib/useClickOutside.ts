import { useEffect, useRef, RefObject } from "react";

// 将函数handler传入useClickOutside，返回一个ref，将ref赋给某个元素，点击该元素外部时就会触发函数handler
const useClickOutside = <T extends HTMLElement>(
  handler: (event: MouseEvent | TouchEvent) => void
): RefObject<T | null> => {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // 如果 ref 不存在或者点击事件发生在 ref 元素内部，则不执行任何操作
      const target = event.target as Node;
      if (!ref.current || ref.current.contains(target)) {
        return;
      }

      handler(event);
    };

    // 添加鼠标点击和触摸事件监听器
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    // 清理函数，移除事件监听器
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [handler]);

  return ref;
};

export default useClickOutside;
