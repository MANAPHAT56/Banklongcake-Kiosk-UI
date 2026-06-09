export type ApiProduct = {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  description: string | null;
  sales_count?: number;
  total_revenue?: number;
};

export type ApiTransaction = {
  transaction_id: number;
  machine_uuid: string | null;
  slot_number: number;
  amount: number;
  payment_status: string;
  product_id: number;
  product_name: string;
  product_image_url: string | null;
  unit_price: number;
  quantity: number;
  created_at: string;
  updated_at: string;
};

export type ApiSlot = {
  id: number | null;
  slot_number: number;
  stock_quantity: number;
  product: ApiProduct | null;
};

export type ProductsListResponse = {
  data: ApiProduct[];
  meta: {
    total: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
};

export type Machine = {
  machine_uuid: string;
  machineUuid?: string;
  name: string;
  location: string;
  service_status: string;
  serviceStatus?: string;
  connection_status: string;
  connectionStatus?: string;
  operational_state: string;
  operationalState?: string;
  last_seen_at: string | null;
  lastSeenAt?: string | null;
  telemetry?: {
    province?: string | null;
    firmware_version?: string | null;
    carrier?: string | null;
    [key: string]: unknown;
  };
  sales_count?: number;
  salesCount?: number;
  total_revenue?: number;
  totalRevenue?: number;
};

export type MachinesListResponse = {
  data?: Machine[];
  machines: Machine[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type MachineSlotsMachine = {
  machine_uuid: string;
  name: string;
  location: string;
  status: string;
  is_online: boolean;
};

export type MachineSlotsResponse = {
  machine: MachineSlotsMachine;
  slots: ApiSlot[];
};
