import { useState } from "react";

const navItems = ["Главная", "О нас", "Услуги", "Контакты"];

const Index = () => {
  const [active, setActive] = useState("Главная");

  return (
    <div className="min-h-screen bg-white font-inter">
      <header className="border-b border-gray-100">
        <nav className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-semibold tracking-tight text-gray-900">Логотип</span>
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item}>
                <button
                  onClick={() => setActive(item)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active === item
                      ? "bg-gray-900 text-white"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>
    </div>
  );
};

export default Index;
