import { useEffect, useState } from "react";
import ArrowDIcon from "../components/Icons/ArrowDIcon";
import SearchIcon from "@/components/Icons/SearchIcon";

// CustomSelector.tsx
// Este componente es un selector personalizado que muestra una lista de opciones
// y permite seleccionar una opción. Se cierra al hacer clic fuera del selector.
interface CustomSelectorProps {
    label?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

const CustomSelector: React.FC<CustomSelectorProps> = ({
    label = "Selecciona una opción",
  options,
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".custom-selector")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="custom-selector w-full font-medium h-full relative">
      <div
        className="bg-white p-2 flex items-center justify-between border rounded "
        onClick={toggleDropdown}
      >
        <span className="flex-1 px-2 text-gray-700 truncate">
          {value || label}
        </span>
        <ArrowDIcon
          className={`ml-2 text-orange-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>
      <ul className={`absolute left-0 right-0 z-10 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-auto transition-all duration-200 ease-in-out ${isOpen ? "block" : "hidden"}`}>
        <div className="flex items-center px-4 py-2 border-b">
          <SearchIcon className="text-gray-400 size-3" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="placeholder:text-gray-700 px-2 w-full outline-none"
            placeholder={label}
          />
        </div>
        {options
          .filter(option => option.toLowerCase().includes(inputValue.toLowerCase()))
          .map((option) => (
            <li
              key={option}
              className={`px-4 py-2 hover:bg-orange-500 hover:text-white cursor-pointer ${option === value ? "bg-orange-100" : ""}`}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
                setInputValue("");
              }}
            >
              {option}
            </li>
        ))}
      </ul>
    </div>
  );
};

export default CustomSelector;

/*<div className="absolute z-10 hidden bg-white border border-gray-300 rounded-lg shadow-lg mt-1">
        {options.map((option) => (
          <div
            key={option}
            className="px-4 py-2 hover:bg-blue-500 hover:text-white cursor-pointer"
            onClick={() => onChange(option)}
          >
            {option}
          </div>
        ))}
      </div>*/
