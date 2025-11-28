import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "react-feather";
import axios from "axios";

const SiteNav = () => {
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL; // .env dan olamiz
  const [currentLang, setCurrentLang] = useState(localStorage.getItem("lang") || "uz");
  const [menuItems, setMenuItems] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);

  // Navigate funksiyasi
  const handleNavigate = (path) => {
    navigate(path);
    setOpenMenu(null);
  };

  const handleMouseEnter = (id) => setOpenMenu(id);
  const handleMouseLeave = () => setOpenMenu(null);

  // Backenddan menu olish
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/pages/getAll/${currentLang}`);
        if (data.success) setMenuItems(data.data);
      } catch (error) {
        console.log("Menu fetch error:", error);
      }
    };

    fetchMenu();
  }, [BASE_URL, currentLang]);

  return (
    <div className="hidden md:block transition-all duration-500 bg-blue-800">
      <div className="px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="flex justify-center items-center">
          <ul className="flex items-center space-x-0 xl:space-x-1 font-semibold text-xs md:text-sm lg:text-base xl:text-lg">
            {menuItems.map((item) => (
              <li
                key={item._id}
                className="relative"
                onMouseEnter={() => handleMouseEnter(item._id)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => item.children.length === 0 && handleNavigate(item.slug)}
                  className="flex items-center gap-1 lg:gap-2 text-white hover:text-yellow-300 hover:bg-blue-700/50 py-3 lg:py-4 px-2 md:px-3 lg:px-4 xl:px-6 cursor-pointer rounded-lg transition-all duration-300 group whitespace-nowrap"
                >
                  <span className="group-hover:scale-105 transition-transform text-xs md:text-sm lg:text-base xl:text-lg">
                    {item.title}
                  </span>
                  {item.children.length > 0 && (
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-300 ${
                        openMenu === item._id ? "rotate-180 text-yellow-300" : "group-hover:scale-110"
                      } w-3 h-3 md:w-4 md:h-4 lg:w-4 lg:h-4`}
                    />
                  )}
                </button>

                {item.children.length > 0 && openMenu === item._id && (
                  <div className="absolute left-0 top-full bg-white border border-gray-300 rounded-xl w-44 md:w-48 lg:w-52 xl:w-56 z-50 overflow-hidden shadow-md">
                    <ul className="p-2 space-y-1">
                      {item.children.map((child) => (
                        <li
                          key={child._id}
                          onClick={() => handleNavigate(child.slug)}
                          className="flex items-center space-x-2 lg:space-x-3 hover:bg-gray-200 rounded-lg px-2 lg:px-3 py-2 lg:py-3 text-black cursor-pointer transition-all duration-200 group"
                        >
                          {child.icon && <span className="text-base lg:text-lg">{child.icon}</span>}
                          <span className="font-medium group-hover:text-blue-600 group-hover:translate-x-1 transition-transform text-xs md:text-sm lg:text-base">
                            {child.title}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SiteNav;
