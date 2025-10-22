import { useState } from "react";
import { ChevronDown } from "lucide-react";
type Props = {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};
const FilterSection = ({ title, defaultOpen = false, children }: Props) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-black/10 pt-4 first:border-t-0 first:pt-0 flex flex-col">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="font-medium">{title}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && <div className="mt-4 w-full">{children}</div>}
    </div>
  );
};

export default FilterSection;
