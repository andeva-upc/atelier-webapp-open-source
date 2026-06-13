export interface UpdateWorkOrderTaskDetailsRequest {
  serviceId: string;
  mechanicId: string;
  description: string;
  newLaborPrice: number;
}