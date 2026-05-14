import { AppointmentAssembler } from './appointments-assembler';

describe('AppointmentAssembler', () => {
  it('should map appointment response to entity', () => {
    const assembler = new AppointmentAssembler();

    const entity = assembler.toEntityFromResource({
      id: 'a1',
      workshop_id: 'w1',
      branch_id: 'b1',
      appointment_date: '2026-05-14T09:00:00Z',
      status: 'SCHEDULED',
      version: 0,
      deleted_at: null,
      pre_registered_full_name: 'Ana Torres',
      pre_registered_phone: '932-100-876',
      pre_registered_vehicle_brand_model: 'Chevrolet Spark JKL-012',
    });

    expect(entity.customerName).toBe('Ana Torres');
    expect(entity.vehicleSummary).toBe('Chevrolet Spark JKL-012');
  });
});
