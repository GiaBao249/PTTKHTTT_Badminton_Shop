require("dotenv").config();

export interface VietQRConfig {
  bankCode: string;
  accountNumber: string;
  accountName: string;
  template: string;
}

export const vietqrConfig: VietQRConfig = {
  bankCode: (process.env.VIETQR_BANK_CODE || "").trim(),
  accountNumber: (process.env.VIETQR_ACCOUNT_NUMBER || "").trim(),
  accountName: (process.env.VIETQR_ACCOUNT_NAME || "").trim(),
  template: (process.env.VIETQR_TEMPLATE || "compact2").trim(),
};

/**
 * Tạo QR code theo chuẩn VietQR
 * Format: https://img.vietqr.io/image/{BANK_CODE}-{ACCOUNT_NUMBER}-{TEMPLATE}.png?amount={AMOUNT}&addInfo={MESSAGE}
 */
export function createVietQRCode(amount: number, message: string = ""): string {
  if (!vietqrConfig.bankCode || !vietqrConfig.accountNumber) {
    throw new Error(
      "VietQR configuration is missing. Please check VIETQR_BANK_CODE and VIETQR_ACCOUNT_NUMBER in .env file"
    );
  }

  // Format message - loại bỏ ký tự đặc biệt
  const cleanMessage = message
    .replace(/[^\w\s\-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 25); // VietQR giới hạn message tối đa 25 ký tự

  // Tạo URL QR code VietQR
  const qrUrl = `https://img.vietqr.io/image/${vietqrConfig.bankCode}-${
    vietqrConfig.accountNumber
  }-${vietqrConfig.template}.png?amount=${Math.round(
    amount
  )}&addInfo=${encodeURIComponent(cleanMessage)}`;

  return qrUrl;
}

/**
 * Tạo QR code data theo chuẩn VietQR để quét trực tiếp
 * Format theo chuẩn VietQR 2.0
 */
export function createVietQRData(amount: number, message: string = ""): string {
  if (!vietqrConfig.bankCode || !vietqrConfig.accountNumber) {
    throw new Error(
      "VietQR configuration is missing. Please check VIETQR_BANK_CODE and VIETQR_ACCOUNT_NUMBER in .env file"
    );
  }

  // Format message
  const cleanMessage = message
    .replace(/[^\w\s\-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 25);

  // Tạo data theo format VietQR 2.0
  // Format: 00020101021238570010A00000072701270006ACB00108QRIBFTTA53037045404<AMOUNT>5802VN62140815<MESSAGE>6304<CRC>
  // Tuy nhiên, cách đơn giản hơn là tạo URL và client sẽ render QR code từ URL đó

  return `https://img.vietqr.io/image/${vietqrConfig.bankCode}-${
    vietqrConfig.accountNumber
  }-${vietqrConfig.template}.png?amount=${Math.round(
    amount
  )}&addInfo=${encodeURIComponent(cleanMessage)}`;
}

/**
 * Lấy thông tin ngân hàng từ bank code
 */
export function getBankName(bankCode: string): string {
  const bankNames: { [key: string]: string } = {
    VCB: "Vietcombank",
    TCB: "Techcombank",
    ACB: "ACB",
    VPB: "VPBank",
    TPB: "TPBank",
    VIB: "VIB",
    MBB: "MB Bank",
    STB: "Sacombank",
    HDB: "HDBank",
    VAB: "VietABank",
    MSB: "MSB",
    BID: "BIDV",
    CTG: "Vietinbank",
    EIB: "Eximbank",
    OJB: "OceanBank",
    VCCB: "Viet Capital Bank",
    NAB: "Nam A Bank",
    PGB: "PGBank",
    GPB: "GPBank",
    SEAB: "SeABank",
    ABB: "ABBank",
    LPB: "LienVietPostBank",
    KLB: "Kienlongbank",
    SHB: "SHB",
    SCB: "SCB",
    OCB: "OCB",
    BAB: "Bac A Bank",
    NCB: "NCB",
  };

  return bankNames[bankCode] || bankCode;
}
