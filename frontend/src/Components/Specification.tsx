import { useEffect, useState } from "react";
import type { Products } from "../types/ProductTypes/ProductType";

type PairItemSpecification = {
  name: string;
  value: string;
};
const API_BASE = import.meta.env.VITE_API_URL;
const Specification = ({ product }: { product: Products }) => {
  const [specification, setSpecification] = useState<PairItemSpecification[]>(
    []
  );
  useEffect(() => {
    const fetchSpecification = async () => {
      const response = await fetch(
        `${API_BASE}/api/products/${product.id}/specification`
      );
      console.log(product.id);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: PairItemSpecification[] = await response.json();
      setSpecification(data ?? []);
    };
    fetchSpecification();
  }, [product.id]);
  return (
    <>
      <h2 className="font-bold text-2xl">Technical Specifications</h2>
      <div className="grid grid-cols-2 gap-3">
        {specification.map((item) => (
          <div className="flex justify-between border-b border-border py-3">
            <p className="font-bold text-md">{item.name}</p>
            <p className="text-lg">{item.value}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default Specification;
