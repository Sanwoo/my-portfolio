import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import { scroller } from "react-scroll";
import avatorJPG from "../assets/avator.jpg";
import { motion } from "motion/react";
import slideUp from "@/utils/slideUp";

const Header = () => {
  const navItems = [
    {
      name: "Home",
      link: "Home",
    },
    {
      name: "About",
      link: "About",
    },
    {
      name: "Skills",
      link: "Skills",
    },
    {
      name: "Contact",
      link: "Contact",
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const handleScrollTo = (link: string) => {
    scroller.scrollTo(link, {
      duration: 800,
      delay: 0,
      smooth: "easeInOutQuart",
    });
  };

  const handleDownloadResume = () => {
    const url = "/public/李家辉Web前端.pdf";
    const link = document.createElement("a");
    link.href = url;
    link.download = "李家辉-Web前端.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      variants={slideUp(0.5)}
      initial="initial"
      whileInView="animate"
      className="w-full z-10 fixed"
    >
      <Navbar>
        {/* 桌面端 */}
        <NavBody>
          <NavbarLogo img={avatorJPG} name="Ounce" />
          <NavItems
            items={navItems}
            onItemClick={(item) => handleScrollTo(item.link)}
          />
          <div className="flex items-center gap-4">
            <NavbarButton variant="primary" onClick={handleDownloadResume}>
              Resume
            </NavbarButton>
          </div>
        </NavBody>

        {/* 手机端 */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo img={avatorJPG} name="Ounce" />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollTo(item.link);
                  setIsMobileMenuOpen(false);
                }}
                className="relative text-neutral-600 dark:text-neutral-300"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-4">
              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                className="w-full"
                onClickCapture={handleDownloadResume}
              >
                Resume
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </motion.div>
  );
};

export default Header;
