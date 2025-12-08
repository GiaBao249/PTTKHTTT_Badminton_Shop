import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
type Props = {
  options: string[];
  selectedOption: string;
  onOptionSelect: (option: string) => void;
  width?: string;
};
const DropdownSelect = ({
  options,
  selectedOption,
  onOptionSelect,
  width = "w-[200px]",
}: Props) => {
  const [selected, setSelected] = useState<string>(selectedOption);
  const [isOpen, setIsOpen] = useState(false);
  const handleSelect = (option: string) => {
    onOptionSelect?.(option);
    setIsOpen(false);
    setSelected(option);
  };
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${width} h-[35px] rounded-md font-medium text-black border border-black/20 text-sm px-3 flex items-center justify-between`}
      >
        <span>{selected}</span>
        <ChevronDown
          size={16}
          className={`transition-transform ${
            isOpen ? "rotate-180" : ""
          } text-gray-700`}
        />
      </button>

      {isOpen && (
        <div className="absolute mt-2 bg-white top-full left-0 rounded-xl shadow-lg z-50 w-full border border-black/10">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelect(option)}
              className="w-full rounded-lg hover:bg-gray-100 transition-all bg-white py-2 px-3 text-left flex items-center justify-between group"
            >
              <span className="text-gray-700 group-hover:text-black transition-colors text-sm">
                {option}
              </span>
              {selected === option && <Check className="w-4 h-4 text-black" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownSelect;
