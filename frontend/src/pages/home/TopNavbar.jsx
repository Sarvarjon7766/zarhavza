import React from "react";

const TopNavbar = () => {
  return (
    <div className="relative overflow-hidden bg-transparent py-2">
      <div className="marquee-container">
        <div className="marquee-text">
          🌐 Web sayt test rejimida ishlamoqda !!!
        </div>
      </div>

      <style jsx>{`
        .marquee-container {
          width: 100%;
          overflow: hidden;
          position: relative;
          height: 30px;
        }

        .marquee-text {
          position: absolute;
          white-space: nowrap;
          left: 100%; /* boshlanish: o‘ng chet */
          font-weight: 700;
          font-size: 16px;
          color: #b80b0bff;
          animation: marquee 15s linear infinite;
        }

        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100vw); /* to‘liq ekran bo‘ylab chapga */
          }
        }

        .marquee-text:hover {
          animation-duration: 5s; /* hover qilganda tezroq */
        }
      `}</style>
    </div>
  );
};

export default TopNavbar;
