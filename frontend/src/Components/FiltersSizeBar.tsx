import FilterSection from "./FiltersComponent/FilterSection";
import CheckBoxFilter from "./FiltersComponent/CheckBoxFilter";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";

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
};

const FiltersSizeBar = ({
  onChangeSeLectedOptionIds,
  onResolvedCategoryIds,
}: Props) => {
  const [searchParams] = useSearchParams();
  const categorySlug = (searchParams.get("category") || "all").toLowerCase();
  const [variations, setVariations] = useState<Variation[]>([]);
  const [selectedByVariationId, setSelectedByVariationId] = useState<
    Record<number, string[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>("null");
  const reset = () => {
    setSelectedByVariationId({});
  };
  const slugToCategoryId: Record<string, number> = {
    rackets: 1,
    shoes: 2,
    clothes: 3,
    accessories: 4,
    shuttlecocks: 5,
  };
  const selectedCount = useMemo(
    () =>
      Object.values(selectedByVariationId).reduce(
        (acc, arr) => acc + (arr?.length || 0),
        0
      ),
    [selectedByVariationId]
  );

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
    </>
  );
};

export default FiltersSizeBar;
