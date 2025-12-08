import { useSearchParams } from "react-router-dom";
import HeaderProduct from "../Components/HeaderProduct";
import MainProducts from "../Components/MainProducts";
import { useEffect, useState } from "react";
const TITLE_MAP: Record<string, string> = {
  all: "TẤT CẢ SẢN PHẨM",
  rackets: "VỢT CẦU LÔNG",
  shoes: "GIÀY CẦU LÔNG",
  shuttlecocks: "QUẢ CẦU",
  clothes: "ÁO THỂ THAO",
  accessories: "PHỤ KIỆN CẦU LÔNG",
};

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const category = (searchParams.get("category") || "all").toLowerCase();
  const namePage = TITLE_MAP[category] ?? "Tất cả sản phẩm";

  const [countProducts, setCountProducts] = useState<number>(0);
  useEffect(() => {
    const fetchCountProducts = async () => {
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/products/count?category=${category}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { count: number } = await res.json();
      setCountProducts(data.count);
    };
    fetchCountProducts();
  }, [category]);

  return (
    <section className="py-6 md:py-8">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <HeaderProduct namePage={namePage} countProducts={countProducts} />
        <MainProducts />
      </div>
    </section>
  );
};

export default ProductsPage;
