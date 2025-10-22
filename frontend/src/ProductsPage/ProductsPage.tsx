import { useSearchParams } from "react-router-dom";
import HeaderProduct from "../Components/HeaderProduct";
import MainProducts from "../Components/MainProducts";
const TITLE_MAP: Record<string, string> = {
  all: "All Products",
  rackets: "Rackets",
  shoes: "Shoes",
  shuttlecocks: "Shuttlecocks",
  strings: "Strings",
  accessories: "Accessories",
};

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const category = (searchParams.get("category") || "all").toLowerCase();
  const namePage = TITLE_MAP[category] ?? "All Products";

  const countProducts = 0;

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
