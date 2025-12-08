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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const tsyringe_1 = require("tsyringe");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AuthRepository_1 = require("../repositories/AuthRepository");
const errorHandler_1 = require("../middleware/errorHandler");
const JWT_SECRET = process.env.JWT_SECRET;
let AuthService = class AuthService {
    constructor(authRepo) {
        this.authRepo = authRepo;
    }
    async login(loginDto) {
        const { username, password } = loginDto;
        if (!username || !password) {
            throw new errorHandler_1.AppError(400, "Thiếu username hoặc password", "VALIDATION_ERROR");
        }
        let account = null;
        let role = null;
        account = await this.authRepo.findCustomerAccount(username);
        if (account) {
            role = "user";
        }
        else {
            account = await this.authRepo.findAdminAccount(username);
            if (account) {
                role = "admin";
            }
        }
        if (!account || !role) {
            throw new errorHandler_1.AppError(401, "Không đăng nhập được vui lòng kiểm tra lại thông tin", "INVALID_CREDENTIALS");
        }
        let passwordMatching;
        if (typeof account.password === "string" &&
            account.password.startsWith("$2b$")) {
            passwordMatching = await bcrypt_1.default.compare(password, account.password);
        }
        else {
            passwordMatching = password === account.password;
            if (passwordMatching) {
                const hashedPassword = await bcrypt_1.default.hash(password, 10);
                const meta = this.authRepo.getAccountMeta(role, account);
                await this.authRepo.updatePassword(username, hashedPassword, meta.accountTable);
            }
        }
        if (!passwordMatching) {
            throw new errorHandler_1.AppError(401, "Password không đúng", "INVALID_CREDENTIALS");
        }
        const meta = this.authRepo.getAccountMeta(role, account);
        const token = jsonwebtoken_1.default.sign({
            username: account.username,
            role,
            id: account[meta.idField],
        }, JWT_SECRET, { expiresIn: "7d" });
        const name = role === "user"
            ? account.customer?.customer_name
            : account.employees?.name;
        return {
            token,
            username: account.account_name,
            role,
            id: account[meta.idField],
            name,
        };
    }
    async register(registerDto) {
        const { username, password, role, name, phone, gender } = registerDto;
        if (!["admin", "user"].includes(role)) {
            throw new errorHandler_1.AppError(401, "Invalid role", "VALIDATION_ERROR");
        }
        if (!username || !password || !role || !name) {
            throw new errorHandler_1.AppError(400, "Missing required fields", "VALIDATION_ERROR");
        }
        const accountTable = role === "user" ? "customeraccounts" : "adminaccounts";
        const usernameExists = await this.authRepo.checkUsernameExists(username, accountTable);
        if (usernameExists) {
            throw new errorHandler_1.AppError(409, "Username already exists", "DUPLICATE_USERNAME");
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        let newId;
        try {
            // Tạo customer hoặc employee
            if (role === "user") {
                const customer = await this.authRepo.createCustomer({
                    customer_name: name,
                    ...(phone && { customer_phone: phone }),
                    ...(gender && { customer_gender: gender }),
                });
                newId = customer.customer_id;
                // Tạo customer account
                try {
                    await this.authRepo.createCustomerAccount(username, hashedPassword, newId);
                }
                catch (error) {
                    await this.authRepo.deleteCustomer(newId);
                    throw error;
                }
            }
            else {
                // Admin
                const employee = await this.authRepo.createEmployee({
                    name,
                    ...(phone && { customer_phone: phone }),
                });
                newId = employee.employ_id;
                // Tạo admin account
                try {
                    await this.authRepo.createAdminAccount(username, hashedPassword, newId);
                }
                catch (error) {
                    // Rollback: xóa employee nếu tạo account thất bại
                    await this.authRepo.deleteEmployee(newId);
                    throw error;
                }
            }
            const token = jsonwebtoken_1.default.sign({
                username: username,
                role: role,
                id: newId,
            }, JWT_SECRET, { expiresIn: "7d" });
            return {
                token,
                username,
                role,
                id: newId,
                name,
            };
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError) {
                throw error;
            }
            throw new errorHandler_1.AppError(500, "Tạo tài khoản không thành công", "REGISTRATION_ERROR");
        }
    }
    getCurrentUser(user) {
        return {
            username: user.username,
            role: user.role,
            id: user.id,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(AuthRepository_1.AuthRepository)),
    __metadata("design:paramtypes", [AuthRepository_1.AuthRepository])
], AuthService);
//# sourceMappingURL=AuthService.js.map