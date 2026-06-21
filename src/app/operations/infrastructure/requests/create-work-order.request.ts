export interface CreateWorkOrderRequest {
  appointmentId: string;
  branchId: string;
  vehicleId: string;
  customerId: string;
  diagnosticSummary: string;
  mileageIn: number;
}