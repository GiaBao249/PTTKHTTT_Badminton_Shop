import { Request, Response } from "express";
import { CustomerInfoService } from "../services/CustomerInfoService";
export declare class CustomerInfoController {
    private customerInfoService;
    constructor(customerInfoService: CustomerInfoService);
    /**
     * GET /api/info/:id
     * Lấy customer info với addresses
     */
    getCustomerInfo: (req: Request, res: Response) => Promise<void>;
    /**
     * PUT /api/info/:id
     * Cập nhật customer info
     */
    updateCustomer: (req: Request, res: Response) => Promise<void>;
    /**
     * PUT /api/info/:id/password
     * Đổi password
     */
    updatePassword: (req: Request, res: Response) => Promise<void>;
    /**
     * POST /api/info/:id/address
     * Tạo address mới
     */
    createAddress: (req: Request, res: Response) => Promise<void>;
    /**
     * PUT /api/info/:id/address/:addressId
     * Cập nhật address
     */
    updateAddress: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=CustomerInfoController.d.ts.map