// Type declarations for Swiper CSS side-effect imports
// Fixes TS error: Cannot find module 'swiper/css' or its corresponding type declarations

declare module "swiper/css";
declare module "swiper/css/navigation";
declare module "swiper/css/pagination";

// Generic fallback for CSS imports
declare module "*.css";
