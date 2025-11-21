import FiltersSizeBar from "./FiltersSizeBar";
import ListOfProducts from "./ListOfProducts";
import { useState } from "react";

export type PriceRange = {
  min: number | null;
  max: number | null;
};

const MainProducts = () => {
  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<PriceRange>({ min: null, max: null });
  const [nameFilter, setNameFilter] = useState<string>("");
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-4 mt-10">
      <div className="flex flex-col gap-4 mb-4 px-8">
        <FiltersSizeBar
          onChangeSeLectedOptionIds={setSelectedOptionIds}
          onResolvedCategoryIds={setCategoryId}
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
          nameFilter={nameFilter}
          onNameFilterChange={setNameFilter}
        />
      </div>
      <div className="">
        <ListOfProducts
          selectedOptionIds={selectedOptionIds}
          categoryId={categoryId ?? (undefined as number | undefined)}
          priceRange={priceRange}
          nameFilter={nameFilter}
        />
      </div>
    </div>
  );
};

export default MainProducts;
