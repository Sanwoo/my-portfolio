import React from "react";
import Earth from "../components/Earth";
import { motion } from "motion/react";
import slideUp from "@/utils/slideUp";

const About: React.FC = () => {
  return (
    <section className="min-h-screen bg-[#e2e8f0]" id="About">
      <div className="container m-auto flex flex-col justify-center items-center gap-30">
        <motion.span
          variants={slideUp(0.4)}
          initial="initial"
          whileInView="animate"
          className="text-blue-950 font-semibold text-5xl p-25"
        >
          Something About <span className="text-orange-500">Me</span>
        </motion.span>
        <div className="flex flex-row gap-50">
          <div className="flex flex-col gap-3 w-2xl justify-center">
            <motion.span
              variants={slideUp(0.5)}
              initial="initial"
              whileInView="animate"
              className="text-indigo-800 text-4xl font-bold"
            >
              I am Ounce
            </motion.span>
            <motion.span
              variants={slideUp(0.6)}
              initial="initial"
              whileInView="animate"
              className="text-3xl font-medium text-blue-800"
            >
              Frontend Developer
            </motion.span>
            <motion.span
              variants={slideUp(0.7)}
              initial="initial"
              whileInView="animate"
              className="text-2xl font-normal "
            >
              I am a frontend developer living in Wuhan, Hubei, a place marked
              on the globe on the right. I graduated from Changsha University of
              Science and Technology Chengnan College with a major in
              Communication Engineering. And I'm passionate about code and
              improving skills
            </motion.span>
            <motion.span
              variants={slideUp(0.8)}
              initial="initial"
              whileInView="animate"
              className="text-xl font-light mt-2 text-blue-700"
            >
              Email: sanwoo1277255458@gmail.com
            </motion.span>
          </div>
          <Earth width="300px" height="300px" />
        </div>
      </div>
    </section>
  );
};

export default About;
