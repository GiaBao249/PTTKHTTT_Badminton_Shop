import type { Products } from "../types/ProductTypes/ProductType";

const FullDescription = ({ product }: { product: Products }) => {
  return (
    <div className="">
      <h2 className="font-bold text-2xl">Product Description</h2>
      <div>
        {product.description} Lorem, ipsum dolor sit amet consectetur
        adipisicing elit. Voluptatibus veniam eaque ratione, facere adipisci
        sunt exercitationem odio quam! Ratione alias, cupiditate non aliquam,
        quaerat suscipit amet, accusamus facilis aperiam nisi et adipisci eum?
        Quia ad quisquam quidem id quis aperiam aspernatur laboriosam tenetur
        odit blanditiis recusandae dolores architecto deserunt soluta inventore
        dolorum quae molestias, doloremque voluptatibus harum. Quam esse nam
        aspernatur repellendus repellat tempore, hic officiis quo culpa eligendi
        suscipit distinctio voluptatibus commodi error nobis omnis aliquid? Nam
        consequatur reiciendis labore, optio sapiente sed unde quaerat aliquam
        veritatis aperiam fugit cumque dolores distinctio velit nobis natus
        sequi eos animi maiores?
      </div>
    </div>
  );
};

export default FullDescription;
