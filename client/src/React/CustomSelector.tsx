import { useEffect, useRef, useState } from "react";
import ArrowDIcon from "../components/Icons/ArrowDIcon.tsx";
import SearchIcon from "@/components/Icons/SearchIcon.tsx";

// CustomSelector.tsx

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [dropdownWidth, setDropdownWidth] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      setDropdownWidth(`${containerRef.current.offsetWidth}px`);
    }
  }, [isOpen]);

  const [inputValue, setInputValue] = useState("");

  // Unique id for each selector instance
  const selectorId = Math.random().toString(36).substr(2, 9);

  const toggleDropdown = () => {
    if (!isOpen) {
      // Notify others to close
      window.dispatchEvent(new CustomEvent("custom-selector-open", { detail: selectorId }));
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".custom-selector")) {
        setIsOpen(false);
        setInputValue("");
      }
    };

    const handleOtherSelectorOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail !== selectorId) {
        setIsOpen(false);
        setInputValue("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("custom-selector-open", handleOtherSelectorOpen);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("custom-selector-open", handleOtherSelectorOpen);
    };
  }, [selectorId]);

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
      {isOpen && (
        <ul className="absolute left-0 right-0 z-10 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-auto transition-all duration-200 ease-in-out block">
          <div className="flex items-center px-4 py-2 border-b">
            <SearchIcon className="text-gray-400 size-3" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="placeholder:text-gray-700 px-2 w-full outline-none"
              placeholder={label}
              onClick={e => e.stopPropagation()}
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
      )}
    </div>
  );
};

export default CustomSelector;
