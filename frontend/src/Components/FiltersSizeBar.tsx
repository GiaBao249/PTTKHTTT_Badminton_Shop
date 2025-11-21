import FilterSection from "./FiltersComponent/FilterSection";
import CheckBoxFilter from "./FiltersComponent/CheckBoxFilter";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import type { PriceRange } from "./MainProducts";

type VariationOption = {
  variation_option_id: number;
  value: string;
};

type Variation = {
  variation_id: number;
  name: string;
  variation_options: VariationOption[];
};

const API_BASE = import.meta.env.VITE_API_URL;

type Props = {
  onChangeSeLectedOptionIds?: (ids: number[]) => void;
  onResolvedCategoryIds?: (id: number | null) => void;
  priceRange?: PriceRange;
  onPriceRangeChange?: (range: PriceRange) => void;
  nameFilter?: string;
  onNameFilterChange?: (name: string) => void;
};

const FiltersSizeBar = ({
  onChangeSeLectedOptionIds,
  onResolvedCategoryIds,
  priceRange,
  onPriceRangeChange,
  nameFilter,
  onNameFilterChange,
}: Props) => {
  const [searchParams] = useSearchParams();
  const categorySlug = (searchParams.get("category") || "all").toLowerCase();
  const [variations, setVariations] = useState<Variation[]>([]);
  const [selectedByVariationId, setSelectedByVariationId] = useState<
    Record<number, string[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>("null");
  const [localMinPrice, setLocalMinPrice] = useState<string>(
    priceRange?.min?.toString() || ""
  );
  const [localMaxPrice, setLocalMaxPrice] = useState<string>(
    priceRange?.max?.toString() || ""
  );
  const [localNameFilter, setLocalNameFilter] = useState<string>(
    nameFilter || ""
  );

  useEffect(() => {
    setLocalMinPrice(priceRange?.min?.toString() || "");
    setLocalMaxPrice(priceRange?.max?.toString() || "");
  }, [priceRange]);

  useEffect(() => {
    setLocalNameFilter(nameFilter || "");
  }, [nameFilter]);

  const reset = () => {
    setSelectedByVariationId({});
    if (onPriceRangeChange) {
      onPriceRangeChange({ min: null, max: null });
    }
    if (onNameFilterChange) {
      onNameFilterChange("");
    }
    setLocalMinPrice("");
    setLocalMaxPrice("");
    setLocalNameFilter("");
  };
  const slugToCategoryId: Record<string, number> = {
    rackets: 1,
    shoes: 2,
    clothes: 3,
    accessories: 4,
    shuttlecocks: 5,
  };
  const selectedCount = useMemo(() => {
    const variationCount = Object.values(selectedByVariationId).reduce(
      (acc, arr) => acc + (arr?.length || 0),
      0
    );
    const priceCount =
      (priceRange?.min != null ? 1 : 0) + (priceRange?.max != null ? 1 : 0);
    const nameCount = nameFilter && nameFilter.trim().length > 0 ? 1 : 0;
    return variationCount + priceCount + nameCount;
  }, [selectedByVariationId, priceRange, nameFilter]);

  const handlePriceChange = (type: "min" | "max", value: string) => {
    const numValue = value.trim() === "" ? null : parseFloat(value);
    if (type === "min") {
      setLocalMinPrice(value);
      if (onPriceRangeChange) {
        onPriceRangeChange({
          min: numValue && !isNaN(numValue) ? numValue : null,
          max: priceRange?.max ?? null,
        });
      }
    } else {
      setLocalMaxPrice(value);
      if (onPriceRangeChange) {
        onPriceRangeChange({
          min: priceRange?.min ?? null,
          max: numValue && !isNaN(numValue) ? numValue : null,
        });
      }
    }
  };

  const handleNameChange = (value: string) => {
    setLocalNameFilter(value);
    if (onNameFilterChange) {
      onNameFilterChange(value);
    }
  };

  useEffect(() => {
    let aborted = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        setVariations([]);
        if (categorySlug === "all") {
          if (!aborted && onResolvedCategoryIds) onResolvedCategoryIds(null);
          return;
        }
        const categoryId = slugToCategoryId[categorySlug];
        if (!categoryId) {
          if (!aborted && onResolvedCategoryIds) onResolvedCategoryIds(null);
          return;
        }
        if (!aborted && onResolvedCategoryIds) {
          onResolvedCategoryIds(categoryId);
        }
        const resVar = await fetch(
          `${API_BASE}/api/products/category/${categoryId}/variations`
        );
        if (!resVar.ok) {
          throw new Error(`HTTP ${resVar.status}`);
        }
        const vars: Variation[] = await resVar.json();
        if (!aborted) {
          setVariations(vars);
        }
      } catch (e: any) {
        if (!aborted) setError(e.message || "Không load được dữ liệu");
      } finally {
        if (!aborted) setLoading(false);
      }
    };
    load();
    return () => {
      aborted = true;
    };
  }, [categorySlug, onResolvedCategoryIds]);

  useEffect(() => {
    setSelectedByVariationId({});
  }, [categorySlug]);

  const setSelection = (variationId: number, values: string[]) => {
    setSelectedByVariationId((prev) => ({ ...prev, [variationId]: values }));
  };
  useEffect(() => {
    if (!onChangeSeLectedOptionIds) return;
    const ids: number[] = [];
    variations.forEach((v) => {
      const pickedValues = selectedByVariationId[v.variation_id] || [];
      pickedValues.forEach((val) => {
        const opt = v.variation_options.find((o) => o.value === val);
        if (opt) ids.push(opt.variation_option_id);
      });
    });
    onChangeSeLectedOptionIds(ids);
  }, [selectedByVariationId, variations, onChangeSeLectedOptionIds]);

  return (
    <>
      <div className="flex item-center justify-between">
        <h2 className="font-bold text-xl">Lọc theo yêu cầu</h2>
        <button
          onClick={reset}
          className="rounded-md font-medium text-black border border-black/20 w-[110px] h-[35px] text-sm"
        >
          Bỏ lọc{selectedCount ? ` (${selectedCount})` : ""}
        </button>
      </div>

      {loading && <div className="text-sm text-gray-600">Đang tải lọc...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {categorySlug !== "all" && !loading && variations.length === 0 && (
        <div className="text-sm text-gray-600">
          Không có lọc cho danh mục này.
        </div>
      )}

      {variations.map((v) => (
        <FilterSection key={v.variation_id} title={v.name}>
          <CheckBoxFilter
            value={selectedByVariationId[v.variation_id] || []}
            onChange={(vals) => setSelection(v.variation_id, vals)}
            options={v.variation_options.map((o) => o.value)}
          />
        </FilterSection>
      ))}

      <FilterSection title="Lọc theo giá" defaultOpen={false}>
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-700">Giá tối thiểu (VNĐ)</label>
            <input
              type="number"
              value={localMinPrice}
              onChange={(e) => handlePriceChange("min", e.target.value)}
              placeholder="Nhập giá tối thiểu"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              min="0"
              step="1000"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-700">Giá tối đa (VNĐ)</label>
            <input
              type="number"
              value={localMaxPrice}
              onChange={(e) => handlePriceChange("max", e.target.value)}
              placeholder="Nhập giá tối đa"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              min="0"
              step="1000"
            />
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Lọc theo tên" defaultOpen={false}>
        <div className="space-y-3">
          <input
            type="text"
            value={localNameFilter}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Nhập tên sản phẩm"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
      </FilterSection>
    </>
  );
};

export default FiltersSizeBar;
