import FiltersSizeBar from "./FiltersSizeBar";
import ListOfProducts from "./ListOfProducts";
const MainProducts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-4 mt-10">
      <div className="flex flex-col gap-4 mb-4 px-8">
        <FiltersSizeBar />
      </div>
      <div className="">
        <ListOfProducts />
      </div>
    </div>
  );
};

export default MainProducts;
