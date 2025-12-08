import { useQuery } from "@tanstack/react-query";

interface VariationOption {
  variation_option_id: number;
  value: string;
}

interface Variation {
  variation_id: number;
  name: string;
  variation_options: VariationOption[];
}

export const useVariations = (categoryId: number | null) => {
  return useQuery<Variation[]>({
    queryKey: ["variations", categoryId],
    queryFn: async () => {
      if (!categoryId) {
        return [];
      }

      const API_BASE = import.meta.env.VITE_API_URL;
      const response = await fetch(
        `${API_BASE}/api/products/category/${categoryId}/variations`
      );

      if (!response.ok) {
        throw new Error("Không thể tải variations");
      }

      return response.json();
    },
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

