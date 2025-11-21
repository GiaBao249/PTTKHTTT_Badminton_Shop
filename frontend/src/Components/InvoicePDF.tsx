import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import BeVietnamRegular from "../assets/fonts/Be_Vietnam_Pro/BeVietnamPro-Regular.ttf?url";
import BeVietnamSemiBold from "../assets/fonts/Be_Vietnam_Pro/BeVietnamPro-SemiBold.ttf?url";
import BeVietnamBold from "../assets/fonts/Be_Vietnam_Pro/BeVietnamPro-Bold.ttf?url";

Font.register({
  family: "BeVietnamPro",
  fonts: [
    { src: BeVietnamRegular, fontWeight: "normal" },
    { src: BeVietnamSemiBold, fontWeight: 600 },
    { src: BeVietnamBold, fontWeight: 700 },
  ],
});

interface Invoice {
  order_id: number;
  customer_id: number;
  status: string;
  total_amount: number;
  order_date: string;
  delivery_date?: string | null;
  address_id?: number;
  customer?: {
    customer_id: number;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
  };
  orderdetail?: Array<{
    order_id: number;
    product_item_id: number;
    quantity: number;
    amount: number;
    product_item?: {
      product_item_id: number;
      product_id: number;
      product?: {
        product_id: number;
        product_name: string;
        price: number;
        thumbnail?: string | null;
        category?: {
          category_id: number;
          category_name: string;
        };
      };
    };
  }>;
}

const pdfStyles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 12,
    fontFamily: "BeVietnamPro",
    color: "#111827",
  },
  section: {
    marginBottom: 16,
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#6366F1",
    borderBottomStyle: "solid",
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
    fontWeight: 700,
    color: "#6366F1",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    fontWeight: 600,
    color: "#6B7280",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    borderBottomStyle: "solid",
    paddingVertical: 8,
    fontWeight: 600,
    backgroundColor: "#F9FAFB",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    borderBottomStyle: "solid",
    paddingVertical: 8,
  },
  cell: {
    flex: 1,
    paddingRight: 6,
  },
  summaryBox: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#EEF2FF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#6366F1",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#6366F1",
    borderTopStyle: "solid",
  },
});

const formatVND = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (date: string | number) => {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : new Date(date * 1000);
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};

export const InvoicePDFDocument = ({ invoice }: { invoice: Invoice }) => {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>HÓA ĐƠN BÁN HÀNG</Text>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>Số hóa đơn:</Text>
            <Text>#{invoice.order_id}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text style={pdfStyles.label}>Ngày đặt:</Text>
            <Text>{formatDate(invoice.order_date)}</Text>
          </View>
          {invoice.delivery_date && (
            <View style={pdfStyles.row}>
              <Text style={pdfStyles.label}>Ngày giao:</Text>
              <Text>{formatDate(invoice.delivery_date)}</Text>
            </View>
          )}
        </View>

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.label}>Thông tin khách hàng</Text>
          <View style={pdfStyles.row}>
            <Text>Họ tên:</Text>
            <Text>{invoice.customer?.customer_name || "-"}</Text>
          </View>
          <View style={pdfStyles.row}>
            <Text>Số điện thoại:</Text>
            <Text>{invoice.customer?.customer_phone || "-"}</Text>
          </View>
          {invoice.customer?.customer_email && (
            <View style={pdfStyles.row}>
              <Text>Email:</Text>
              <Text>{invoice.customer.customer_email}</Text>
            </View>
          )}
        </View>

        <View style={pdfStyles.section}>
          <Text style={[pdfStyles.label, { marginBottom: 8 }]}>
            Chi tiết sản phẩm
          </Text>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.cell, { flex: 0.3 }]}>STT</Text>
            <Text style={[pdfStyles.cell, { flex: 2 }]}>Sản phẩm</Text>
            <Text style={[pdfStyles.cell, { flex: 0.8, textAlign: "right" }]}>
              Đơn giá
            </Text>
            <Text style={[pdfStyles.cell, { flex: 0.5, textAlign: "right" }]}>
              SL
            </Text>
            <Text style={[pdfStyles.cell, { flex: 1, textAlign: "right" }]}>
              Thành tiền
            </Text>
          </View>
          {invoice.orderdetail && invoice.orderdetail.length > 0 ? (
            invoice.orderdetail.map((item, index) => {
              const total =
                item.amount ||
                (item.product_item?.product?.price || 0) * (item.quantity || 0);
              return (
                <View
                  style={pdfStyles.tableRow}
                  key={`${item.order_id}-${item.product_item_id}-${index}`}
                >
                  <Text style={[pdfStyles.cell, { flex: 0.3 }]}>
                    {index + 1}
                  </Text>
                  <Text style={[pdfStyles.cell, { flex: 2 }]}>
                    {item.product_item?.product?.product_name ||
                      `SP #${item.product_item_id || "N/A"}`}
                  </Text>
                  <Text
                    style={[pdfStyles.cell, { flex: 0.8, textAlign: "right" }]}
                  >
                    {formatVND(
                      item.product_item?.product?.price ||
                        item.amount / (item.quantity || 1) ||
                        0
                    )}
                  </Text>
                  <Text
                    style={[pdfStyles.cell, { flex: 0.5, textAlign: "right" }]}
                  >
                    {item.quantity || 0}
                  </Text>
                  <Text
                    style={[pdfStyles.cell, { flex: 1, textAlign: "right" }]}
                  >
                    {formatVND(total)}
                  </Text>
                </View>
              );
            })
          ) : (
            <View style={pdfStyles.tableRow}>
              <Text style={[pdfStyles.cell, { flex: 2 }]}>
                Không có sản phẩm
              </Text>
            </View>
          )}
        </View>

        <View style={pdfStyles.summaryBox}>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.label}>Tổng số lượng:</Text>
            <Text>
              {invoice.orderdetail?.reduce(
                (sum, item) => sum + (item.quantity || 0),
                0
              ) || 0}{" "}
              sản phẩm
            </Text>
          </View>
          <View style={pdfStyles.totalRow}>
            <Text style={[pdfStyles.label, { fontSize: 14, fontWeight: 700 }]}>
              Tổng tiền:
            </Text>
            <Text style={{ fontSize: 14, fontWeight: 700 }}>
              {formatVND(invoice.total_amount || 0)}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
