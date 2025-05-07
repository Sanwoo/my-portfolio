import "./App.css";
import Header from "../src/components/Header";
import TsParticles from "./components/TsParticles";
import Home from "./components/Home";
import About from "./components/About";
import Skills from "./components/Skills";
import Contact from "./components/Contact";

const App = () => {
  return (
    <div>
      <div className="flex flex-col min-h-screen relative">
        <Header />
        <TsParticles />
        <Home />
      </div>
      <About />
      <Skills />
      <Contact />
    </div>
  );
};

export default App;
