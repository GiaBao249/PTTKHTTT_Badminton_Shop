const API_BASE = import.meta.env.VITE_API_URL;
const requestControllers = new Map<string, AbortController>();

export const cartService = {
  async getCartItems(customerId: number | string, token: string) {
    const res = await fetch(
      `${API_BASE}/api/orders/cart/customer/${customerId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error("Không thể tải giỏ hàng");
    }

    return res.json();
  },
  async updateQuantity(
    productItemId: number,
    quantity: number,
    token: string,
    _customerId?: number | string
  ) {
    const key = `update:${productItemId}`;
    const prev = requestControllers.get(key);
    if (prev) prev.abort();
    const controller = new AbortController();
    requestControllers.set(key, controller);

    const res = await fetch(`${API_BASE}/api/orders/cart/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        product_item_id: productItemId,
        quantity: quantity,
      }),
      signal: controller.signal,
      keepalive: true,
    });

    if (!res.ok) {
      throw new Error("Không thể cập nhật giỏ hàng");
    }

    return res.json();
  },

  async removeItem(productItemId: number, token: string) {
    const key = `remove:${productItemId}`;
    const prev = requestControllers.get(key);
    if (prev) prev.abort();
    const controller = new AbortController();
    requestControllers.set(key, controller);

    const res = await fetch(`${API_BASE}/api/orders/cart/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        product_item_id: productItemId,
      }),
      signal: controller.signal,
      keepalive: true,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Không thể xóa sản phẩm");
    }

    return res.json();
  },

  async addItem(productItemId: number, quantity: number, token: string) {
    const key = `add:${productItemId}`;
    const prev = requestControllers.get(key);
    if (prev) prev.abort();
    const controller = new AbortController();
    requestControllers.set(key, controller);

    const res = await fetch(`${API_BASE}/api/orders/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        product_item_id: productItemId,
        quantity: quantity,
      }),
      signal: controller.signal,
      keepalive: true,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Không thể thêm sản phẩm vào giỏ hàng");
    }

    return res.json();
  },
};
