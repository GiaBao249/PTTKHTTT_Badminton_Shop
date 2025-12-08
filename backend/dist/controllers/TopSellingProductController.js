"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopSellingProductController = void 0;
const tsyringe_1 = require("tsyringe");
const TopSellingProductService_1 = require("../services/TopSellingProductService");
const errorHandler_1 = require("../middleware/errorHandler");
let TopSellingProductController = class TopSellingProductController {
    constructor(topSellingProductService) {
        this.topSellingProductService = topSellingProductService;
        this.getTopSellingProducts = async (req, res) => {
            try {
                const limit = parseInt(req.query.limit) || 5;
                const products = await this.topSellingProductService.getTopSellingProducts(limit);
                res.json(products);
            }
            catch (error) {
                if (error instanceof errorHandler_1.AppError) {
                    res
                        .status(error.statusCode)
                        .json({ error: error.message, code: error.code });
                }
                else {
                    console.error("Error getting top selling products:", error);
                    res.status(500).json({ error: "Lỗi khi lấy sản phẩm bán chạy" });
                }
            }
        };
    }
};
exports.TopSellingProductController = TopSellingProductController;
exports.TopSellingProductController = TopSellingProductController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(TopSellingProductService_1.TopSellingProductService)),
    __metadata("design:paramtypes", [TopSellingProductService_1.TopSellingProductService])
], TopSellingProductController);
//# sourceMappingURL=TopSellingProductController.js.map