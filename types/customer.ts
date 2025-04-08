export interface Customer {
  customerId: number;
  ownerId?: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  username?: string;
  isActive: boolean;
  cars?: string[];
  feedbacks: string[];
  owner?: string;
}

// PUT /api/Customer/Update
export interface UpdateCustomerPayload {
  customerId: number;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive?: boolean | null;
}

// POST /api/Customer/Register
export interface RegisterCustomerPayload {
  ownerId: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  username: string;
  password?: string;
  isActive: boolean;
}

// POST /api/Customer/SearchCustomer
export interface SearchCustomerPayload {
  keyword?: string | null;
}

// GET /api/Car/GetCarOfCustomer
export interface GetCarOfCustomerPayload {
  customerId: number;
}
