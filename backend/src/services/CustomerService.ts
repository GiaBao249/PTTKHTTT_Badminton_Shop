import { inject, injectable } from "tsyringe";
import { CustomerRepository } from "../repositories/CustomerRepository";
import { Customer, CustomerWithStats } from "../models/Customer";
import { supabase } from "../config/supabase";
import { totalmem } from "os";
import { AppError } from "../middleware/errorHandler";

@injectable()
export class CustomerService {
  constructor(
    @inject(CustomerRepository) private customerRepo: CustomerRepository
  ) {}
  async getAllCustomerWithStats(): Promise<CustomerWithStats[]> {
    const [customers, statsMap] = await Promise.all([
      this.customerRepo.findAll(),
      this.customerRepo.getOrdersStats(),
    ]);
    return customers.map((customer) => {
      const stats = statsMap.get(customer.customer_id) || {
        total_orders: 0,
        total_spent: 0,
      };
      return {
        ...customer,
        total_orders: stats.total_orders,
        total_spent: stats.total_spent,
      };
    });
  }
  async getCustomerByIdWithStats(
    customerId: number
  ): Promise<CustomerWithStats> {
    const customer = await this.customerRepo.findById(customerId);
    if (!customer) {
      throw new AppError(
        404,
        "Không tìm thấy khách hàng",
        "CUSTOMER_NOT_FOUND"
      );
    }
    const statsMap = await this.customerRepo.getOrdersStats();
    const stats = statsMap.get(customerId) || {
      total_orders: 0,
      total_spent: 0,
    };
    return {
      ...customer,
      total_orders: stats.total_orders,
      total_spent: stats.total_spent,
    };
  }
}
