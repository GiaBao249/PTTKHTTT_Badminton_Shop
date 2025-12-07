import { injectable, inject } from "tsyringe";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthRepository } from "../repositories/AuthRepository";
import {
  LoginDto,
  RegisterDto,
  AuthResponse,
  UserInfo,
  UserRole,
} from "../models/Auth";
import { AppError } from "../middleware/errorHandler";

const JWT_SECRET = process.env.JWT_SECRET;

@injectable()
export class AuthService {
  constructor(@inject(AuthRepository) private authRepo: AuthRepository) {}
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { username, password } = loginDto;
    if (!username || !password) {
      throw new AppError(
        400,
        "Thiếu username hoặc password",
        "VALIDATION_ERROR"
      );
    }
    let account: any = null;
    let role: UserRole | null = null;
    account = await this.authRepo.findCustomerAccount(username);
    if (account) {
      role = "user";
    } else {
      account = await this.authRepo.findAdminAccount(username);
      if (account) {
        role = "admin";
      }
    }
    if (!account || !role) {
      throw new AppError(
        401,
        "Không đăng nhập được vui lòng kiểm tra lại thông tin",
        "INVALID_CREDENTIALS"
      );
    }
    let passwordMatching: boolean;
    if (
      typeof account.password === "string" &&
      account.password.startsWith("$2b$")
    ) {
      passwordMatching = await bcrypt.compare(password, account.password);
    } else {
      passwordMatching = password === account.password;
      if (passwordMatching) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const meta = this.authRepo.getAccountMeta(role, account);
        await this.authRepo.updatePassword(
          username,
          hashedPassword,
          meta.accountTable
        );
      }
    }
    if (!passwordMatching) {
      throw new AppError(401, "Password không đúng", "INVALID_CREDENTIALS");
    }
    const meta = this.authRepo.getAccountMeta(role, account);
    const token = jwt.sign(
      {
        username: account.username,
        role,
        id: account[meta.idField],
      },
      JWT_SECRET!,
      { expiresIn: "7d" }
    );
    const name =
      role === "user"
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
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { username, password, role, name, phone, gender } = registerDto;
    if (!["admin", "user"].includes(role)) {
      throw new AppError(401, "Invalid role", "VALIDATION_ERROR");
    }
    if (!username || !password || !role || !name) {
      throw new AppError(400, "Missing required fields", "VALIDATION_ERROR");
    }
    const accountTable = role === "user" ? "customeraccounts" : "adminaccounts";
    const usernameExists = await this.authRepo.checkUsernameExists(
      username,
      accountTable
    );
    if (usernameExists) {
      throw new AppError(409, "Username already exists", "DUPLICATE_USERNAME");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    let newId: number;
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
          await this.authRepo.createCustomerAccount(
            username,
            hashedPassword,
            newId
          );
        } catch (error) {
          await this.authRepo.deleteCustomer(newId);
          throw error;
        }
      } else {
        // Admin
        const employee = await this.authRepo.createEmployee({
          name,
          ...(phone && { customer_phone: phone }),
        });
        newId = employee.employ_id;

        // Tạo admin account
        try {
          await this.authRepo.createAdminAccount(
            username,
            hashedPassword,
            newId
          );
        } catch (error) {
          // Rollback: xóa employee nếu tạo account thất bại
          await this.authRepo.deleteEmployee(newId);
          throw error;
        }
      }
      const token = jwt.sign(
        {
          username: username,
          role: role,
          id: newId,
        },
        JWT_SECRET!,
        { expiresIn: "7d" }
      );

      return {
        token,
        username,
        role,
        id: newId,
        name,
      };
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        500,
        "Tạo tài khoản không thành công",
        "REGISTRATION_ERROR"
      );
    }
  }
  getCurrentUser(user: any): UserInfo {
    return {
      username: user.username,
      role: user.role,
      id: user.id,
    };
  }
}
