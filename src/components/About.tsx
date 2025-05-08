import React from "react";
import Earth from "../components/Earth";
import { motion } from "motion/react";
import slideUp from "@/utils/slideUp";

const About: React.FC = () => {
  return (
    <section className="min-h-screen bg-[#e2e8f0] py-16" id="About">
      <div className="container mx-auto px-4 flex flex-col justify-center items-center gap-8 md:gap-12">
        <motion.span
          variants={slideUp(0.4)}
          initial="initial"
          whileInView="animate"
          className="text-blue-950 font-semibold text-3xl md:text-5xl text-center mb-6 md:mb-25"
        >
          Something About <span className="text-orange-500">Me</span>
        </motion.span>
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
          <div className="flex flex-col gap-3 w-full md:w-2/3 md:pl-30 justify-center order-2 md:order-1 text-center md:text-left">
            <motion.span
              variants={slideUp(0.5)}
              initial="initial"
              whileInView="animate"
              className="text-indigo-800 text-3xl md:text-4xl font-bold"
            >
              I am Ounce
            </motion.span>
            <motion.span
              variants={slideUp(0.6)}
              initial="initial"
              whileInView="animate"
              className="text-2xl md:text-3xl font-medium text-blue-800"
            >
              Frontend Developer
            </motion.span>
            <motion.span
              variants={slideUp(0.7)}
              initial="initial"
              whileInView="animate"
              className="text-lg md:text-2xl font-normal"
            >
              I am a frontend developer living in Wuhan, Hubei, a place marked
              on the globe. I graduated from Changsha University of Science and
              Technology Chengnan College with a major in Communication
              Engineering. And I'm passionate about code and improving skills
            </motion.span>
            <motion.span
              variants={slideUp(0.8)}
              initial="initial"
              whileInView="animate"
              className="text-base md:text-xl font-light mt-2 text-blue-700"
            >
              Email: sanwoo1277255458@gmail.com
            </motion.span>
          </div>
          {/* 地球仪 */}
          <motion.div
            variants={slideUp(0.9)}
            initial="initial"
            whileInView="animate"
            className="order-1 md:order-2 w-full md:w-1/3 flex justify-center"
          >
            <Earth width="280px" height="280px" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
