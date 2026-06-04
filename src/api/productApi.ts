import axiosClient from "@/shared/api/axiosClient";

// Định nghĩa Interface chuẩn theo các trường dữ liệu hiển thị trên Swagger của bạn
export interface Product {
  id: string;
  slug: string;
  name: string;
  name_en: string;
  base_price_vnd: number;
  vat_rate_bps: number;
  status: string;
  created_at: string;
}

export interface ProductResponse {
  data: Product[];
  total: number;
}

const productApi = {
  // Hàm lấy danh sách sản phẩm, mặc định lấy 20 item như Swagger
  getProducts: async (limit: number = 20): Promise<ProductResponse> => {
    const response = await axiosClient.get("/v1/products", {
      params: { limit },
    });
    return response.data;
  },
};

export default productApi;
