import React, { useEffect, useRef } from "react";
import { CardItem, CardBody, CardContainer } from "@/components/ui/3d-card";
import { AuroraText } from "@/components/magicui/aurora-text";
import Typed from "typed.js";
import avatorJPG from "../assets/avator.jpg";
import { motion } from "motion/react";
import slideUp from "@/utils/slideUp";

const Home: React.FC = () => {
  const el = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // typedjs实现打字效果
    const typed = new Typed(el.current, {
      strings: [
        "Frontend Developer",
        "Video Gamer",
        "Lifelong Learner",
        "Music Lover",
      ],
      typeSpeed: 50,
      backSpeed: 65,
      loop: true,
      showCursor: true,
    });

    return () => {
      typed.destroy();
    };
  }, []);
  return (
    <section
      className="flex-grow flex flex-col md:flex-row justify-center md:justify-around items-center"
      id="Home"
    >
      <motion.div
        variants={slideUp(0.7)}
        initial="initial"
        whileInView="animate"
        className="flex flex-col justify-center items-center md:items-start gap-6"
      >
        <span className="font-semibold text-2xl md:text-5xl text-violet-950">
          Hi There,
        </span>
        <div className="flex flex-row">
          <span className="text-violet-950 font-semibold text-2xl md:text-5xl">
            I'm Li JiaHui
          </span>
          <AuroraText className="font-semibold text-2xl md:text-5xl">
            /Ounce
          </AuroraText>
        </div>
        <span className="font-semibold text-2xl md:text-3xl text-balck">
          A <span ref={el} className="text-red-900"></span>
        </span>
      </motion.div>
      <motion.div
        variants={slideUp(0.9)}
        initial="initial"
        whileInView="animate"
        className="w-48 md:w-64 max-w-full h-auto"
      >
        <CardContainer>
          <CardBody>
            <CardItem>
              <img
                src={avatorJPG}
                className="rounded-full hover:shadow-2xl hover:shadow-gray-500"
              />
            </CardItem>
          </CardBody>
        </CardContainer>
      </motion.div>
    </section>
  );
};

export default Home;
