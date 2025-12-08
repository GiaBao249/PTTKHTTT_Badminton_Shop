import { useEffect, useState } from "react";
type HeaderProductProps = {
  namePage: string;
  countProducts: number;
};
const HeaderProduct = ({ namePage, countProducts }: HeaderProductProps) => {
  const [nameProducts, setNameProducts] = useState<string>(namePage);
  const [countProductsState, setCountProductsState] = useState<number>(0);
  useEffect(() => {
    setNameProducts(namePage);
    setCountProductsState(countProducts);
  }, [namePage, countProducts]);
  return (
    <div>
      <h2 className="font-bold text-2xl">{nameProducts}</h2>
      <p className="text-sm text-gray-500 mt-2">
        {countProductsState} sản phẩm tìm thấy
      </p>
    </div>
  );
};

export default HeaderProduct;
