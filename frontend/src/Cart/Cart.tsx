// import ProductCard from "../Components/ProductCard";
// import { useState } from "react";
// import { ArrowLeft, ArrowRight } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// const Cart = () => {
//   const [isHoveredLeft, setIsHoveredLeft] = useState(false);
//   const [isHoveredRight, setIsHoveredRight] = useState(false);
//   const navigate = useNavigate();

//   const totalMoney = cartItems.reduce(
//     (sum, item) => sum + item.product.price * item.quantity,
//     0
//   );
//   const formatVND = (v: number) =>
//     new Intl.NumberFormat("vi-VN", {
//       style: "currency",
//       currency: "VND",
//     }).format(v);

//   const handleProceedToCheckout = () => {
//     navigate("/checkOut", {
//       state: {
//         subtotal: totalMoney,
//         cartItems: cartItems,
//       },
//     });
//   };

//   const handleIncreaseProductInShopCart = (productId: number) => {
//     setCartItems((prev) =>
//       prev.map((item) =>
//         item.product.id === productId &&
//         item.quantity < item.product.inStockCount
//           ? { ...item, quantity: item.quantity + 1 }
//           : item
//       )
//     );
//   };

//   const handleDecreaseProductInShopCart = (productId: number) => {
//     setCartItems((prev) =>
//       prev.map((item) =>
//         item.product.id === productId && item.quantity > 1
//           ? { ...item, quantity: item.quantity - 1 }
//           : item
//       )
//     );
//   };

//   const handleDeleteProductInShopCart = (productId: number) => {
//     setCartItems((prev) =>
//       prev.filter((item) => item.product.id !== productId)
//     );
//   };

//   return (
//     <section className="py-6 md:py-8">
//       <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
//         <h1 className="text-3xl font-bold">Giỏ hàng</h1>
//         <div className="grid gird-cols-1 lg:grid-cols-[70%_30%] gap-10 mt-10">
//           <div className="flex flex-col gap-4">
//             {cartItems.map((data) => (
//               <ProductCard
//                 variant="cart"
//                 product={data.product}
//                 quantity={data.quantity}
//                 onIncrease={() =>
//                   handleIncreaseProductInShopCart(data.product.id)
//                 }
//                 onDecrease={() =>
//                   handleDecreaseProductInShopCart(data.product.id)
//                 }
//                 onRemove={() => handleDeleteProductInShopCart(data.product.id)}
//               />
//             ))}
//           </div>
//           <div className="ml-10 mt-4 space-y-4">
//             <h1 className="font-bold truncate text-xl">Tóm tắt đơn hàng</h1>
//             <div className="border-b-2 pb-8">
//               <p className="text-md font-medium">Mã khuyến mãi</p>
//               <div className="flex flex-row items-center gap-3">
//                 <input
//                   type="text"
//                   placeholder="Nhập mã giảm giá"
//                   className="flex flex-1 border border-gray-200 rounded-lg"
//                 />
//                 <button className="rounded-lg border border-gray-200 py-2 px-3">
//                   Áp dụng
//                 </button>
//               </div>
//             </div>
//             <div className="border-b-2 pb-8 space-y-2">
//               <div className="flex flex-row justify-between items-center">
//                 <p className="text-md font-normal">Tạm tính</p>
//                 <p className="font-bold text-md">{formatVND(totalMoney)}</p>
//               </div>
//               <div className="flex flex-row justify-between items-center">
//                 {/* <p className="text-md font-normal">Shipping</p> */}
//                 {/* <p className="text-md font-bold">Free</p> */}
//               </div>
//             </div>
//             <div className="flex flex-col gap-4">
//               <button
//                 onMouseEnter={() => setIsHoveredRight(true)}
//                 onMouseLeave={() => setIsHoveredRight(false)}
//                 onClick={handleProceedToCheckout}
//                 className="rounded-xl p-2 border border-gray-200 items-center bg-[linear-gradient(90deg,theme(colors.green.500),theme(colors.green.600))] bg-no-repeat bg-[length:0%_100%] hover:bg-[length:100%_100%] transition-[background-size] duration-300 ease-out text-black hover:text-white font-bold relative"
//               >
//                 <span className="items-center">Tiến hành thanh toán</span>
//                 <ArrowRight
//                   size={20}
//                   className={`absolute right-6 bottom-1/4 inline-flex items-end transition-opacity ${
//                     isHoveredRight ? "duration-300" : "duration-200"
//                   } transform ${
//                     isHoveredRight
//                       ? "opacity-100 translate-x-2"
//                       : "opacity-0 translate-x-0"
//                   }`}
//                 />
//               </button>
//               <button
//                 onMouseEnter={() => setIsHoveredLeft(true)}
//                 onMouseLeave={() => setIsHoveredLeft(false)}
//                 className="rounded-xl p-2 border border-gray-200 items-center bg-[linear-gradient(0deg,theme(colors.blue.600),theme(colors.blue.500))] bg-no-repeat bg-[length:0%_100%] hover:bg-[length:100%_100%] transition-[background-size] duration-300 ease-out text-black hover:text-white font-bold bg-right relative"
//               >
//                 <ArrowLeft
//                   size={20}
//                   className={`absolute left-2 bottom-1/4 inline-flex transition-opacity ${
//                     isHoveredLeft ? "duration-300" : "duration-200"
//                   } transform ${
//                     isHoveredLeft
//                       ? "opacity-100 translate-x-2"
//                       : "opacity-0 translate-x-0"
//                   }`}
//                 />
//                 <span className="items-center">Tiếp tục mua sắm</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Cart;
