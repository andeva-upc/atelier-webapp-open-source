import { BaseResource } from '../../shared/infrastructure/base-response';

/**
 * Data Transfer Object (DTO) representing the raw Customer network model.
 * 
 * Contains optional properties to support side-loaded embedded relations
 * from relational models in the backend database.
 */
export interface CustomerResponse extends BaseResource {
  id: string;
  workshop_id: string;
  document_number: string;
  document_type: 'DNI' | 'RUC' | 'CE' | 'PASSPORT';
  full_name: string;
  email: string;
  phone: string;
  services_count?: number;
  vehicles_summary?: string;
  last_visit_date?: string;
  version: number;
  created_at?: string;
  updated_at?: string;

  /** Embedded vehicle list mapped from backend relational schemas */
  vehicles?: Array<{
    id: string;
    plate_number: string;
    brand: string;
    model: string;
    year: number;
  }>;

  /** Embedded appointments/services list mapped from backend relational schemas */
  appointments?: Array<{
    id: string;
    appointment_date: string;
    status: string;
  }>;
}
