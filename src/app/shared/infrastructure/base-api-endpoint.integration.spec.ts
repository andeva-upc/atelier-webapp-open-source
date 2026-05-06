import { describe, it, expect, beforeAll } from 'vitest';

/**
 * Real Integration Test Suite for the Fake API (json-server).
 * 
 * Unlike Unit Tests, this test suite connects to the REAL physical server running
 * on http://localhost:3000 and modifies the 'db.json' file on disk.
 * 
 * @important
 * The Fake API server MUST be running before running this test.
 * Run 'npm run dev:api' or 'npm run backend' in another terminal window first.
 */
describe('Fake API (json-server) Integration Test', () => {
  const API_URL = 'http://localhost:3000/api/v1/wm_workshops';

  // Pre-check: Ensure the server is online before running the integration suite
  beforeAll(async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error();
      }
    } catch (error) {
      throw new Error(
        '\n\n' +
        '=========================================================================================\n' +
        '⚠️  ERROR DE INTEGRACIÓN: El servidor Fake API (json-server) NO está encendido.\n' +
        '-----------------------------------------------------------------------------------------\n' +
        'Para ejecutar este test de integración real, debes encender el backend simulado:\n' +
        '1. Abre una nueva terminal externa.\n' +
        '2. Corre el comando: npm run dev:api\n' +
        '3. Una vez encendido el servidor, vuelve a lanzar este test.\n' +
        '=========================================================================================\n'
      );
    }
  });

  it('should retrieve real workshops from server/db.json', async () => {
    const response = await fetch(API_URL);
    expect(response.status).toBe(200);

    const workshops = await response.json();
    expect(Array.isArray(workshops)).toBe(true);
    expect(workshops.length).toBeGreaterThan(0);
    
    // Verificamos propiedades reales de la base de datos simulada
    expect(workshops[0]).toHaveProperty('id');
    expect(workshops[0]).toHaveProperty('name');
    expect(workshops[0]).toHaveProperty('tax_id');
  });

  it('should physically CREATE, READ, and DELETE a workshop in server/db.json', async () => {
    const tempWorkshop = {
      name: 'Taller de Pruebas de Integración',
      tax_id: 'RUC20999999999',
      address: 'Calle de Integración Real 456',
      phone: '+51 900000000'
    };

    // 1. CREATE (POST) - Inserta físicamente en db.json
    const createResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tempWorkshop)
    });
    expect(createResponse.status).toBe(201); // 201 Created

    const created = await createResponse.json();
    expect(created.id).toBeDefined();
    expect(created.name).toBe(tempWorkshop.name);

    // 2. READ (GET by ID) - Lee el registro recién insertado
    const getResponse = await fetch(`${API_URL}/${created.id}`);
    expect(getResponse.status).toBe(200);
    
    const fetched = await getResponse.json();
    expect(fetched.name).toBe(tempWorkshop.name);
    expect(fetched.tax_id).toBe(tempWorkshop.tax_id);

    // 3. DELETE (DELETE) - Remueve físicamente el registro de db.json
    const deleteResponse = await fetch(`${API_URL}/${created.id}`, {
      method: 'DELETE'
    });
    expect(deleteResponse.status).toBe(200); // JSON Server retorna 200 en DELETE exitoso

    // 4. VERIFY DELETED (GET by ID) - Asegura que ya no existe (404 Not Found)
    const verifyResponse = await fetch(`${API_URL}/${created.id}`);
    expect(verifyResponse.status).toBe(404);
  });
});
