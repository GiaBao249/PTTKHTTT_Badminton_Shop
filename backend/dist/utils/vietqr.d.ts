export interface VietQRConfig {
    bankCode: string;
    accountNumber: string;
    accountName: string;
    template: string;
}
export declare const vietqrConfig: VietQRConfig;
/**
 * Tạo QR code theo chuẩn VietQR
 * Format: https://img.vietqr.io/image/{BANK_CODE}-{ACCOUNT_NUMBER}-{TEMPLATE}.png?amount={AMOUNT}&addInfo={MESSAGE}
 */
export declare function createVietQRCode(amount: number, message?: string): string;
/**
 * Tạo QR code data theo chuẩn VietQR để quét trực tiếp
 * Format theo chuẩn VietQR 2.0
 */
export declare function createVietQRData(amount: number, message?: string): string;
/**
 * Lấy thông tin ngân hàng từ bank code
 */
export declare function getBankName(bankCode: string): string;
//# sourceMappingURL=vietqr.d.ts.map