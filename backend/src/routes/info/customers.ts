import { Router, Request, Response } from "express";
import { supabase } from "../../config/supabase";
import { authRequired } from "../../middleware/authRequired";
import bcrypt from "bcrypt";
export function registerInfoCustomerRoutes(router: Router) {
  router.get("/:id", async (req: Request, res: Response) => {
    try {
      const idParam = req.params.id;
      if (!idParam) {
        return res.status(400).json({ error: "Customer ID is required" });
      }
      const customerId = parseInt(idParam, 10);
      if (isNaN(customerId)) {
        return res.status(400).json({ error: "Invalid customer ID" });
      }
      const user = (req as any).user;
      if (user.role === "user" && user.id !== customerId) {
        return res.status(403).json({ error: "không có quyền truy cập" });
      }
      const { data: cus, error: cusErr } = await supabase
        .from("customer")
        .select(
          `
      customer_id , customer_name , customer_gender , customer_phone , customer_email
      `
        )
        .eq("customer_id", customerId)
        .single();
      if (cusErr) {
        return res.status(404).json({ error: "Không tìm thấy khách hàng" });
      }
      const { data: address, error: addressError } = await supabase
        .from("address")
        .select("*")
        .eq("customer_id", customerId)
        .order("address_id", { ascending: true });
      console.log("address rows for", customerId, "=>", {
        address,
        addressError,
      });
      if (addressError) {
        return res
          .status(404)
          .json({ error: "Không tìm thấy địa chỉ khách hàng" });
      }
      res.json({
        ...cus,
        address: address || [],
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Lỗi server" });
    }
  });
  router.put("/:id", async (req: Request, res: Response) => {
    try {
      const idParam = req.params.id;
      if (!idParam) {
        return res.status(400).json({ error: "Customer ID is required" });
      }
      const customerId = parseInt(idParam, 10);
      if (isNaN(customerId)) {
        return res.status(400).json({ error: "Invalid customer ID" });
      }
      const user = (req as any).user;
      if (user.role !== "user" || user.id !== customerId) {
        return res.status(403).json({ error: "Không có quyền truy cập" });
      }
      const { customer_name, customer_phone, customer_gender, customer_email } =
        req.body;
      const updateData: any = {};
      if (customer_name) updateData.customer_name = customer_name;
      if (customer_phone) updateData.customer_phone = customer_phone;
      if (customer_gender) updateData.customer_gender = customer_gender;
      if (customer_email) updateData.customer_email = customer_email;
      const { data, error } = await supabase
        .from("customer")
        .update(updateData)
        .eq("customer_id", customerId)
        .select()
        .single();
      if (error) {
        throw error;
      }
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Lỗi server" });
    }
  });

  router.put("/:id/password", async (req: Request, res: Response) => {
    try {
      const idParam = req.params.id;
      if (!idParam) {
        return res.status(400).json({ error: "Customer ID is required" });
      }
      const customerId = parseInt(idParam, 10);
      if (isNaN(customerId)) {
        return res.status(400).json({ error: "Invalid customer ID" });
      }
      const user = (req as any).user;
      if (user.role === "user" && Number(user.id) !== customerId) {
        return res.status(403).json({ error: "Không có quyền truy cập" });
      }
      const { current_password, new_password } = req.body;
      console.log("Current password received:", current_password);
      console.log("Current password length:", current_password?.length);
      if (!current_password || !new_password) {
        return res.status(400).json({ error: "Thiếu thông tin đăng nhập" });
      }
      if (new_password.length < 6) {
        return res
          .status(400)
          .json({ error: "Mật khẩu mới phải có ít nhất 6 ký tự" });
      }
      console.log("=> cur " + current_password);
      console.log("=> new " + new_password);
      const { data: account, error: accountError } = await supabase
        .from("customeraccounts")
        .select("password")
        .eq("customer_id", customerId)
        .single();
      if (accountError || !account) {
        return res.status(404).json({ error: "Không tìm thấy tài khoản" });
      }
      console.log("Account found:", account ? "Yes" : "No");
      console.log("Password type:", typeof account.password);
      console.log(
        "Password starts with $2b$:",
        account.password?.startsWith("$2b$")
      );
      console.log("Password length:", account.password?.length);
      console.log(
        "Password (first 10 chars):",
        account.password?.substring(0, 10)
      );
      let isPasswordValid: boolean;
      if (
        typeof account.password === "string" &&
        account.password.startsWith("$2b$")
      ) {
        isPasswordValid = await bcrypt.compare(
          current_password,
          account.password
        );
      } else {
        isPasswordValid = current_password === account.password;
      }
      console.log("Is password valid:", isPasswordValid);
      console.log("Password comparison:", {
        isHashed: account.password?.startsWith("$2b$"),
        currentPassword: current_password,
        dbPassword: account.password,
        directCompare: current_password === account.password,
      });
      if (!isPasswordValid) {
        console.log("??");
        return res.status(401).json({ error: "Mật khẩu hiện tại không đúng" });
      }
      const hashedPassword = await bcrypt.hash(new_password, 10);
      const { error: updateError } = await supabase
        .from("customeraccounts")
        .update({ password: hashedPassword })
        .eq("customer_id", customerId);
      if (updateError) {
        console.log("ok");
        return res.status(400).json({ error: updateError.message });
      }
      console.log("ac");
      res.json({ message: "Đổi mật khẩu thành công" });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Lỗi server" });
    }
  });

  router.post("/:id/address", async (req: Request, res: Response) => {
    try {
      const idParam = req.params.id;
      if (!idParam) {
        return res.status(400).json({ error: "Customer ID is required" });
      }
      const customerId = parseInt(idParam, 10);
      if (isNaN(customerId)) {
        return res.status(400).json({ error: "Invalid customer ID" });
      }
      const user = (req as any).user;
      if (user.role === "user" && Number(user.id) !== customerId) {
        return res.status(403).json({ error: "Không có quyền truy cập" });
      }
      const { address_line, ward, district, city, postal_code } = req.body;
      if (!address_line || !ward || !district || !city) {
        return res.status(400).json({ error: "Thiếu thông tin địa chỉ" });
      }
      const { data, error } = await supabase
        .from("address")
        .insert([
          {
            customer_id: customerId,
            address_line,
            ward,
            district,
            city,
            postal_code: postal_code || null,
          },
        ])
        .select()
        .single();
      if (error) {
        throw error;
      }
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Lỗi server" });
    }
  });

  router.put("/:id/address/:addressId", async (req: Request, res: Response) => {
    try {
      const idParam = req.params.id;
      const addressIdParam = req.params.addressId;
      if (!idParam || !addressIdParam) {
        return res
          .status(400)
          .json({ error: "Customer ID and Address ID are required" });
      }
      const customerId = parseInt(idParam, 10);
      const addressId = parseInt(addressIdParam, 10);
      if (isNaN(customerId) || isNaN(addressId)) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      const user = (req as any).user;
      if (user.role === "user" && Number(user.id) !== customerId) {
        return res.status(403).json({ error: "Không có quyền truy cập" });
      }
      const { address_line, ward, district, city, postal_code } = req.body;
      const updateData: any = {};
      if (address_line) updateData.address_line = address_line;
      if (ward) updateData.ward = ward;
      if (district) updateData.district = district;
      if (city) updateData.city = city;
      if (postal_code !== undefined)
        updateData.postal_code = postal_code || null;
      const { data, error } = await supabase
        .from("address")
        .update(updateData)
        .eq("address_id", addressId)
        .eq("customer_id", customerId)
        .select()
        .single();
      if (error) {
        throw error;
      }
      if (!data) {
        return res.status(404).json({ error: "Không tìm thấy địa chỉ" });
      }
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Lỗi server" });
    }
  });
}
