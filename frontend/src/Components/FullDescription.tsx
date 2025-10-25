import type { Products } from "../types/ProductTypes/ProductType";

const FullDescription = ({ product }: { product: Products }) => {
  return <div className="">{product.description}</div>;
};

export default FullDescription;
