export type ApiProduct = {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  description: string | null;
};

export type ApiSlot = {
  id: number | null;
  slot_number: number;
  stock_quantity: number;
  product: ApiProduct | null;
};

export type MachineSlotsResponse = {
  machine: {
    machine_uuid: string;
    name: string;
    location: string;
    status: string;
    is_online: boolean;
    registration_status?: "REGISTERED" | "UNREGISTERED";
  };
  slots: ApiSlot[];
};

export type KioskProduct = {
  id: number;
  slotNumber: number;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  ingredients: string;
  storage: string;
  freshness: string;
  available: boolean;
  stockQuantity: number;
};

export type CheckoutResult = {
  transaction_id: number;
  session_id?: string;
  expires_at?: string;
  payment_intent_id?: string;
  client_secret?: string;
  amount: number;
  currency: string;
  payment_status: string;
  qr_url?: string;
  mobile_session?: {
    session_id: string;
    kiosk_id: number;
    transaction_id: number;
    secret: string;
    expires_at: string;
    completed_at: string | null;
    invalidated_at: string | null;
  };
  promptpay: {
    image_url_png: string | null;
    image_url_svg: string | null;
    data: string | null;
  } | null;
  product: {
    id: number;
    name: string;
    price: number;
    image_url: string | null;
  };
};

export type RegistrationRequestResult = {
  id: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  machine_uuid: string;
  registration_status?: "REGISTERED" | "UNREGISTERED";
  kiosk_secret?: string | null;
};

export type KioskLoginResult = {
  machine: {
    machine_uuid: string;
    name: string;
    registration_status: "REGISTERED" | "UNREGISTERED";
  };
};

export type MachineRegistrationCandidate = {
  machine_uuid: string;
  machineUuid?: string;
  name: string;
  location: string;
  service_status?: string;
  serviceStatus?: string;
  connection_status?: string;
  connectionStatus?: string;
  registration_status?: "REGISTERED" | "UNREGISTERED";
  registrationStatus?: "REGISTERED" | "UNREGISTERED";
};

export type MachinesListResponse = {
  machines?: MachineRegistrationCandidate[];
  data?: MachineRegistrationCandidate[];
};
