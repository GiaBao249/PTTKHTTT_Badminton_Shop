import { Check } from "lucide-react";
type Props = {
  value: string[];
  onChange: (v: string[]) => void;
  options: string[];
};

const CheckBoxFilter = ({ value, onChange, options }: Props) => {
  const toggle = (opt: string) =>
    onChange(
      value.includes(opt) ? value.filter((x) => x !== opt) : [...value, opt]
    );

  return (
    <div className="space-y-3">
      {options.map((opt) => {
        const isChecked = value.includes(opt);
        return (
          <label
            key={opt}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isChecked}
                onChange={() => toggle(opt)}
              />
              <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:border-black peer-checked:bg-black transition-all group-hover:border-gray-400 flex items-center justify-center">
                {isChecked && <Check className=" text-white" />}
              </div>
            </div>
            <span className="text-sm text-gray-700 group-hover:text-black transition-colors">
              {opt}
            </span>
          </label>
        );
      })}
    </div>
  );
};

export default CheckBoxFilter;
