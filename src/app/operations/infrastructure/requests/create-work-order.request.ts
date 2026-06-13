export interface CreateWorkOrderRequest {
  appointmentId: string;
  branchId: string;
  vehicleId: string;
  customerId: string;
  internalNumber: number;
  diagnosticSummary: string;
  mileageIn: number;
}