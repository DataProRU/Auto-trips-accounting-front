import React from "react";
import logo from "../../assets/logo.png";

const Header: React.FC = () => {
  return (
    <div className="header p-8 flex items-center justify-center gap-4   bg-white rounded-b-[13px] max-w-full mx-auto   ">
      <img alt="Логотип" src={logo} className="h-[70px]" />
      <h1 className="text-2xl  font-bold text-center  text-black">
        Финансовый учёт
      </h1>
    </div>
  );
};

export default Header;
