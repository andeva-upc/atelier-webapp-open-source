import { BaseEndpoint, Endpoints } from './src/app/shared/infrastructure/base-endpoint.js';

async function runAdvancedTest() {
    console.log('🔥 Starting Advanced API Infrastructure Test...\n');

    // --- 1. FULL CRUD CYCLE (Inventory - US012) ---
    console.log('--- [Test 1: Inventory CRUD] ---');
    const partService = new BaseEndpoint(Endpoints.INVENTORY.PARTS);
    try {
        // Create
        const newPart = await partService.create({ name: 'Turbo Charger', sku: 'TRB-001' });
        console.log(`✅ Create: Part "${newPart.name}" added with ID: ${newPart.id}`);

        // Update
        const updated = await partService.update(newPart.id, { name: 'Turbo Charger v2', sku: 'TRB-002' });
        console.log(`✅ Update: SKU changed to ${updated.sku}`);

        // Delete
        await partService.delete(newPart.id);
        console.log(`✅ Delete: Temporary part removed.`);
    } catch (e) {
        console.error('❌ Inventory Test Failed:', e.message);
    }

    // --- 2. RELATIONAL INTEGRITY (Vehicles - US015/016) ---
    console.log('\n--- [Test 2: Relational Check] ---');
    const vehicleService = new BaseEndpoint(Endpoints.VEHICLE.MAIN);
    try {
        const myVehicle = await vehicleService.create({
            user_id: 1, // Admin
            vin: 'TEST-VIN-999999',
            plate: 'TEST-001',
            brand: 'Tesla',
            model: 'Model S'
        });
        console.log(`✅ Success: Linked new ${myVehicle.brand} to User ID ${myVehicle.user_id}`);
        
        // Verify with find
        const found = await vehicleService.find({ vin: 'TEST-VIN-999999' });
        console.log(`✅ Success: Verified VIN ${found[0].vin} in database.`);
        
        // Clean up
        await vehicleService.delete(myVehicle.id);
    } catch (e) {
        console.error('❌ Relational Test Failed:', e.message);
    }

    // --- 3. SIMULATED LOGIN (Identity - US003) ---
    console.log('\n--- [Test 3: Simulated Login] ---');
    const identityService = new BaseEndpoint(Endpoints.IDENTITY);
    
    try {
        // Scenario A: Correct Credentials
        const validCreds = {
            email: 'admin@atelier.com',
            password_hash: '$2b$10$xyz...' // Exact hash from db.json
        };
        
        console.log(`⏳ [Scenario A] Login with correct credentials for: ${validCreds.email}...`);
        const users = await identityService.find(validCreds);

        if (users.length > 0) {
            console.log(`✅ Success: User authenticated! Welcome, ${users[0].username}.`);
        } else {
            console.error('❌ Error: User not found with these credentials.');
        }

        // Scenario B: Wrong Credentials
        const invalidCreds = {
            email: 'admin@atelier.com',
            password_hash: 'wrong_password_123'
        };
        
        console.log(`\n⏳ [Scenario B] Login with WRONG credentials for: ${invalidCreds.email}...`);
        const failedUsers = await identityService.find(invalidCreds);

        if (failedUsers.length === 0) {
            console.log(`✅ Success: System correctly denied access for invalid credentials.`);
        } else {
            console.error('❌ Error: System allowed access with wrong password!');
        }
    } catch (e) {
        console.error('❌ Login Test Failed:', e.message);
    }

    // --- 4. ERROR HANDLING ---
    console.log('\n--- [Test 4: Error Handling] ---');
    try {
        console.log('⏳ Attempting to get non-existent user...');
        await new BaseEndpoint(Endpoints.IDENTITY).getById(9999);
    } catch (e) {
        console.log(`✅ Success: Correctly caught error: "${e.message}"`);
    }

    console.log('\n🏁 Advanced Test finished.');
}

runAdvancedTest();
