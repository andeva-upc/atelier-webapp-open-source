import { describe, it, expect } from 'vitest';
import { CustomerAssembler } from './customer.assembler';
import { CustomerDto } from '../dto/customer.dto';
import { Customer } from '../../domain/models/customer.entity';

describe('CustomerAssembler', () => {
  const assembler = new CustomerAssembler();

  const mockDto: CustomerDto = {
    id: 'c1a938be-23ef-4f1b-a9f8-be31faee01bc',
    workshop_id: 'e26b1580-b3b0-466d-8c10-ca7f62d1c9ef',
    document_number: '45678912',
    document_type: 'DNI',
    full_name: 'Aldo Mendoza Riva',
    email: 'aldo.mendoza@outlook.com',
    phone: '+51999888777',
    version: 1
  };

  it('should map from DTO to Entity with default fallbacks correctly', () => {
    const entity = assembler.toEntityFromResource(mockDto);

    expect(entity.id).toBe(mockDto.id);
    expect(entity.workshopId).toBe(mockDto.workshop_id);
    expect(entity.fullName).toBe(mockDto.full_name);
    expect(entity.servicesCount).toBe(0);
    expect(entity.vehiclesSummary).toBe('Sin vehículos registrados');
    expect(entity.lastVisitDate).toBe('Sin visitas registradas');
    expect(entity.version).toBe(mockDto.version);
    expect(entity.getAvatarInitial()).toBe('A');
  });

  it('should map from Entity to DTO correctly', () => {
    const entity = new Customer(
      'c1a938be-23ef-4f1b-a9f8-be31faee01bc',
      'e26b1580-b3b0-466d-8c10-ca7f62d1c9ef',
      '45678912',
      'DNI',
      'Aldo Mendoza Riva',
      'aldo.mendoza@outlook.com',
      '+51999888777',
      3,
      'Toyota Corolla ABC-123',
      '2026-05-10',
      1
    );

    const dto = assembler.toResourceFromEntity(entity);

    expect(dto.id).toBe(entity.id);
    expect(dto.workshop_id).toBe(entity.workshopId);
    expect(dto.full_name).toBe(entity.fullName);
    expect(dto.services_count).toBe(entity.servicesCount);
    expect(dto.vehicles_summary).toBe(entity.vehiclesSummary);
    expect(dto.last_visit_date).toBe(entity.lastVisitDate);
    expect(dto.version).toBe(entity.version);
  });

  it('should resolve family member car correctly for Maria Fe Torres Ugarte ID', () => {
    const mariaDto: CustomerDto = {
      id: 'c3c047ca-51ff-4c22-b9cf-ae08fbff34dd',
      workshop_id: 'e26b1580-b3b0-466d-8c10-ca7f62d1c9ef',
      document_number: '09876543',
      document_type: 'DNI',
      full_name: 'Maria Fe Torres Ugarte',
      email: 'mariafe@gmail.com',
      phone: '+51955666777',
      version: 0
    };

    const entity = assembler.toEntityFromResource(mariaDto);

    expect(entity.fullName).toBe('Maria Fe Torres Ugarte');
    expect(entity.vehiclesSummary).toBe('Toyota Corolla ABC-123 (Familiar)');
    expect(entity.getAvatarInitial()).toBe('M');
  });

  it('should dynamically aggregate embedded vehicles list correctly', () => {
    const dtoListWithVehicles: CustomerDto = {
      ...mockDto,
      vehicles: [
        { id: 'v1', plate_number: 'ABC-123', brand: 'Toyota', model: 'Corolla', year: 2022 },
        { id: 'v2', plate_number: 'DEF-456', brand: 'Nissan', model: 'Sentra', year: 2024 }
      ]
    };

    const entity = assembler.toEntityFromResource(dtoListWithVehicles);

    expect(entity.vehiclesSummary).toBe('Toyota Corolla ABC-123, Nissan Sentra DEF-456');
  });

  it('should dynamically sort and aggregate embedded appointments list correctly', () => {
    const dtoListWithAppointments: CustomerDto = {
      ...mockDto,
      appointments: [
        { id: 'a1', appointment_date: '2026-05-01T10:00:00Z', status: 'COMPLETED' },
        { id: 'a2', appointment_date: '2026-05-10T12:00:00Z', status: 'SCHEDULED' },
        { id: 'a3', appointment_date: '2026-05-05T09:00:00Z', status: 'COMPLETED' }
      ]
    };

    const entity = assembler.toEntityFromResource(dtoListWithAppointments);

    expect(entity.servicesCount).toBe(3);
    expect(entity.lastVisitDate).toBe('2026-05-10'); /** Must select the latest appointment date */
  });

  it('should map array from response correctly', () => {
    const listResponse = [mockDto];
    const entities = assembler.toEntitiesFromResponse(listResponse);

    expect(entities.length).toBe(1);
    expect(entities[0].fullName).toBe('Aldo Mendoza Riva');
  });
});
