import { injectable } from "tsyringe";
import { supabase } from "../config/supabase";
import { PurchaseOrder, PurchaseOrderDetail } from "../models/PurchaseOrder";

@injectable()
export class PurchaseOrderRepository {
  /**
   * Lấy tất cả purchase orders - OPTIMIZED
   */
  async findAll(): Promise<PurchaseOrder[]> {
    const { data, error } = await supabase
      .from("purchaseorders")
      .select("purchaseorder_id, supplier_id, employee_id, purchaseorder_date")
      .order("purchaseorder_id", { ascending: false });
    
    if (error) throw error;
    return data ?? [];
  }

  /**
   * Lấy purchase order theo ID
   */
  async findById(purchaseOrderId: number): Promise<PurchaseOrder | null> {
    const { data, error } = await supabase
      .from("purchaseorders")
      .select("purchaseorder_id, supplier_id, employee_id, purchaseorder_date")
      .eq("purchaseorder_id", purchaseOrderId)
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * Lấy suppliers theo IDs - OPTIMIZED (batch query)
   */
  async getSuppliersByIds(supplierIds: number[]): Promise<Map<number, any>> {
    if (supplierIds.length === 0) return new Map();

    const { data, error } = await supabase
      .from("suppliers")
      .select("supplier_id, supplier_name")
      .in("supplier_id", supplierIds);
    
    if (error) throw error;

    const supplierMap = new Map<number, any>();
    (data ?? []).forEach((s: any) => {
      supplierMap.set(s.supplier_id, s);
    });
    return supplierMap;
  }

  /**
   * Lấy employees theo IDs - OPTIMIZED (batch query)
   */
  async getEmployeesByIds(employeeIds: number[]): Promise<Map<number, any>> {
    if (employeeIds.length === 0) return new Map();

    const { data, error } = await supabase
      .from("employees")
      .select("employ_id, name")
      .in("employ_id", employeeIds);
    
    if (error) throw error;

    const employeeMap = new Map<number, any>();
    (data ?? []).forEach((e: any) => {
      employeeMap.set(e.employ_id, {
        ...e,
        employee_id: e.employ_id, // Map for frontend compatibility
      });
    });
    return employeeMap;
  }

  /**
   * Lấy purchase order details theo purchase order ID
   */
  async getPurchaseOrderDetailsByPurchaseOrderId(
    purchaseOrderId: number
  ): Promise<PurchaseOrderDetail[]> {
    const { data, error } = await supabase
      .from("purchaseorderdetail")
      .select("purchaseorderdetail_id, product_id, price, quantity")
      .eq("purchaseorder_id", purchaseOrderId);
    
    if (error) throw error;
    return data ?? [];
  }

  /**
   * Lấy products với images - OPTIMIZED (single query với join)
   */
  async getProductsWithImages(productIds: number[]): Promise<Map<number, any>> {
    if (productIds.length === 0) return new Map();

    const { data, error } = await supabase
      .from("product")
      .select(`
        product_id,
        product_name,
        category_id,
        description,
        warranty_period,
        product_item!inner (
          product_id,
          product_image (
            image_filename
          )
        )
      `)
      .in("product_id", productIds);
    
    if (error) throw error;

    const productMap = new Map<number, any>();
    (data ?? []).forEach((p: any) => {
      // Lấy thumbnail từ product_item đầu tiên
      const firstItem = p.product_item?.[0];
      const firstImage = firstItem?.product_image?.[0]?.image_filename;
      
      if (firstImage) {
        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(firstImage);
        p.thumbnail = publicUrl;
      } else {
        p.thumbnail = null;
      }
      
      productMap.set(p.product_id, p);
    });

    return productMap;
  }

  /**
   * Lấy max purchase order ID
   */
  async getMaxPurchaseOrderId(): Promise<number> {
    const { data, error } = await supabase
      .from("purchaseorders")
      .select("purchaseorder_id")
      .order("purchaseorder_id", { ascending: false })
      .limit(1)
      .single();
    
    if (error) return 0;
    return data?.purchaseorder_id || 0;
  }

  /**
   * Tạo purchase order
   */
  async create(
    purchaseOrderId: number,
    supplierId: number,
    employeeId: number
  ): Promise<PurchaseOrder> {
    const { data, error } = await supabase
      .from("purchaseorders")
      .insert([
        {
          purchaseorder_id: purchaseOrderId,
          supplier_id: supplierId,
          employee_id: employeeId,
          purchaseorder_date: new Date().toISOString(),
        },
      ])
      .select()
      .single();
    
    if (error) throw error;
    if (!data) {
      throw new Error("Không thể tạo purchase order");
    }
    return data;
  }

  /**
   * Lấy max purchase order detail ID
   */
  async getMaxPurchaseOrderDetailId(): Promise<number> {
    const { data, error } = await supabase
      .from("purchaseorderdetail")
      .select("purchaseorderdetail_id")
      .order("purchaseorderdetail_id", { ascending: false })
      .limit(1)
      .single();
    
    if (error) return 0;
    return data?.purchaseorderdetail_id || 0;
  }

  /**
   * Tạo purchase order details
   */
  async createPurchaseOrderDetails(
    details: Array<{
      purchaseorderdetail_id: number;
      purchaseorder_id: number;
      product_id: number;
      price: number;
      quantity: number;
    }>
  ): Promise<void> {
    if (details.length === 0) return;

    const { error } = await supabase
      .from("purchaseorderdetail")
      .insert(details);
    
    if (error) throw error;
  }

  /**
   * Kiểm tra product có tồn tại
   */
  async findProductById(productId: number): Promise<any | null> {
    const { data, error } = await supabase
      .from("product")
      .select("*")
      .eq("product_id", productId)
      .single();
    
    if (error) return null;
    return data;
  }

  /**
   * Tạo product mới
   */
  async createProduct(productData: {
    product_name: string;
    category_id: number;
    supplier_id?: number;
    price: number;
    price_purchase: number;
    description?: string;
    warranty_period?: number;
  }): Promise<any> {
    const { data, error } = await supabase
      .from("product")
      .insert([productData])
      .select()
      .single();
    
    if (error) throw error;
    if (!data || !data.product_id) {
      throw new Error("Không thể tạo sản phẩm: Không nhận được product_id");
    }
    return data;
  }

  /**
   * Cập nhật product
   */
  async updateProduct(
    productId: number,
    updateData: { price_purchase?: number; supplier_id?: number }
  ): Promise<void> {
    const { error } = await supabase
      .from("product")
      .update(updateData)
      .eq("product_id", productId);
    
    if (error) throw error;
  }

  /**
   * Lấy product item theo product ID
   */
  async getProductItemByProductId(productId: number): Promise<any | null> {
    const { data, error } = await supabase
      .from("product_item")
      .select("product_item_id, quantity")
      .eq("product_id", productId)
      .limit(1)
      .maybeSingle();
    
    if (error) return null;
    return data;
  }

  /**
   * Cập nhật product item quantity
   */
  async updateProductItemQuantity(
    productItemId: number,
    newQuantity: number
  ): Promise<void> {
    const { error } = await supabase
      .from("product_item")
      .update({ quantity: newQuantity })
      .eq("product_item_id", productItemId);
    
    if (error) throw error;
  }

  /**
   * Tạo product item mới
   */
  async createProductItem(productId: number, quantity: number): Promise<void> {
    const { error } = await supabase
      .from("product_item")
      .insert([{ product_id: productId, quantity }]);
    
    if (error) throw error;
  }
}

