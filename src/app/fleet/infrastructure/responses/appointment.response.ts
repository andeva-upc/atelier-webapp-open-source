export interface AppointmentResource {
  id: string;
  branchId: string;
  customerId: string;
  vehicleId: string;
  status: string;
  scheduledStart: string; // ISO timestamp
  scheduledEnd: string; // ISO timestamp
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  createdBy?: string;
  updatedBy?: string | null;
  version?: number;
}
