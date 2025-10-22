import FilterSection from "./FiltersComponent/FilterSection";
import CheckBoxFilter from "./FiltersComponent/CheckBoxFilter";
import { useState } from "react";
import { useSearchParams } from "react-router";
const FiltersSizeBar = () => {
  const [weights, setWeights] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || "all";
  const reset = () => {
    setWeights([]);
    setBrands([]);
  };
  //? bỏ các phần sau , sau khi xong phần filter và lấy dữ liệu từ database bỏ vào thay thế các phần ở dưới.
  const OPTIONS_Weight_Racket = [
    "< 80g",
    "80–85g",
    "85–90g",
    "90–95g",
    "> 95g",
  ];
  const OPTIONS_Weight_Shoes = [
    "Lightweight (< 250g)",
    "Standard (250g - 350g)",
    "Heavyweight (> 350g)",
  ];

  const OPTIONS_Brand_Shoes = ["Yonex", "Adidas", "Puma", "Victor", "Li-Ning"];
  const OPTIONS_Brand_Racket = ["Yonex", "Adidas", "Puma", "Victor", "Li-Ning"];

  const getWeightOptions = () => {
    if (category === "rackets") {
      return OPTIONS_Weight_Racket;
    } else if (category === "shoes") {
      return OPTIONS_Weight_Shoes;
    }
    return [];
  };

  const getBrandOptions = () => {
    if (category === "rackets") {
      return OPTIONS_Brand_Racket;
    } else if (category === "shoes") {
      return OPTIONS_Brand_Shoes;
    }
    return [];
  };

  const weightOptions = getWeightOptions();
  const brandOptions = getBrandOptions();
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-xl">Filters</h2>
        <button
          onClick={reset}
          className="rounded-md font-medium text-black border border-black/20 w-[110px] h-[35px] text-sm"
        >
          Reset Filters
        </button>
      </div>
      {/* {console.log(weightOptions.length > 0)} */}
      {weightOptions.length > 0 && (
        <FilterSection title="Weight">
          <CheckBoxFilter
            value={weights}
            onChange={setWeights}
            options={weightOptions}
          />
        </FilterSection>
      )}
      {brandOptions.length > 0 && (
        <FilterSection title="Brand">
          <CheckBoxFilter
            value={brands}
            onChange={setBrands}
            options={brandOptions}
          />
        </FilterSection>
      )}
    </>
  );
};

export default FiltersSizeBar;
