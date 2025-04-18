export interface Staff {
  staffId: number;
  ownerId?: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  username?: string;
  isActive: boolean;
  assignedTask?: string[];
}

// POST /api/Staff/SearchStaff
export interface SearchStaffPayload {
  keyword?: string | null;
}

// POST /api/Staff/Register
export interface AddStaffPayload {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  username: string;
  password?: string;
  isActive: boolean;
}

// PUT /api/Staff/Update
export interface UpdateStaffPayload {
  staffId: number;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive?: boolean | null;
}
