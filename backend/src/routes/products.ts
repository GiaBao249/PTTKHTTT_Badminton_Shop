import express from "express";
import { registerListRoutes } from "./products/list";
import { registerFeaturedRoutes } from "./products/featured";
import { registerVariationRoutes } from "./products/variations";
import { registerSearchRoutes } from "./products/search";
import { registerFilterRoutes } from "./products/filter";
import { registerCountRoutes } from "./products/count";
import { registerTopByCategoryRoutes } from "./products/top";
import { registerDetailRoutes } from "./products/detail";
import { registerSpecificationRoutes } from "./products/specification";
const router = express.Router();

registerListRoutes(router);
registerTopByCategoryRoutes(router);
registerVariationRoutes(router);
registerSearchRoutes(router);
registerFilterRoutes(router);
registerCountRoutes(router);
registerFeaturedRoutes(router);
registerSpecificationRoutes(router);

registerDetailRoutes(router);
export default router;
