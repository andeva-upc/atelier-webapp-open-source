import { BaseApi } from './base-api.js';

/**
 * Generic class to manage specific resource endpoints.
 * Extends {@link BaseApi} to provide CRUD operations.
 * 
 * @public
 */
export class BaseEndpoint extends BaseApi {
    /**
     * @param resourcePath - The path segment for the resource (e.g., 'vh_vehicles').
     */
    constructor(resourcePath) {
        super();
        this.resourcePath = resourcePath;
    }

    /**
     * Retrieves all items from the resource collection.
     * @returns A promise with the array of items.
     */
    getAll() {
        return this.request(`/${this.resourcePath}`);
    }

    /**
     * Retrieves a single item by its unique identifier.
     * @param id - The unique ID of the resource.
     * @returns A promise with the item data.
     */
    getById(id) {
        return this.request(`/${this.resourcePath}/${id}`);
    }

    /**
     * Allows searching and filtering resources using query parameters.
     * Useful for US020 (Inventory filtering) and US016 (Search by plate).
     * 
     * @param params - Object containing filters (e.g., { q: 'search', status: 'OPEN' }).
     * @returns A promise with the filtered array of items.
     */
    find(params = {}) {
        const query = new URLSearchParams(params).toString();
        const path = query ? `/${this.resourcePath}?${query}` : `/${this.resourcePath}`;
        return this.request(path);
    }

    /**
     * Creates a new resource entry.
     * @param data - The data for the new resource.
     * @returns A promise with the created resource data.
     */
    create(data) {
        return this.request(`/${this.resourcePath}`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * Updates an existing resource completely (PUT).
     * @param id - The ID of the resource to update.
     * @param data - The new data for the resource.
     * @returns A promise with the updated resource data.
     */
    update(id, data) {
        return this.request(`/${this.resourcePath}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    /**
     * Performs a partial update on a resource (PATCH).
     * Useful for US018 (Work Order status change).
     * 
     * @param id - The ID of the resource to patch.
     * @param data - The partial data to update.
     * @returns A promise with the updated resource data.
     */
    patch(id, data) {
        return this.request(`/${this.resourcePath}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    /**
     * Deletes a resource by its identifier.
     * @param id - The ID of the resource to delete.
     * @returns A promise that resolves when the deletion is complete.
     */
    delete(id) {
        return this.request(`/${this.resourcePath}/${id}`, {
            method: 'DELETE',
        });
    }
}

/**
 * Mapping of Endpoints based on the database schema (DDL).
 * Organized by Bounded Contexts as per Domain-Driven Design (DDD).
 * 
 * @public
 */
export const Endpoints = {
    IDENTITY: 'id_users',
    WORKSHOP: {
        MAIN: 'wm_workshops',
        EMPLOYEES: 'wm_employees'
    },
    VEHICLE: {
        MAIN: 'vh_vehicles',
        TELEMETRY: 'vh_telemetry_batches',
        ERRORS: 'vh_dtc_errors'
    },
    SERVICE: {
        ORDERS: 'so_work_orders',
        TASKS: 'so_tasks'
    },
    INVENTORY: {
        PARTS: 'iv_parts',
        STOCKS: 'iv_stocks'
    },
    BILLING: {
        INVOICES: 'bl_invoices',
        PAYMENTS: 'bl_payments'
    },
    SYSTEM: {
        OUTBOX: 'sys_outbox'
    }
};
