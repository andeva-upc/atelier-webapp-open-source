export const environment = {
  production: true,
  apiBaseUrl: 'https://atelier-platform.onrender.com/api/v1',
  endpoints: {
    iam: {
      signIn: '/authentication/sessions',
      signUp: '/users',
      googleSignIn: '/authentication/sessions/google',
      forgotPassword: '/authentication/password-recoveries',
      resetPassword: '/authentication/password-resets',
      getByUserId: '/users',
      updateUserEmail: '/users',
      updateUserPassword: '/users',
    },
    core: {
      workshops: '/workshops',
      customers: '/customers',
      owners: '/owners',
      employees: '/employees',
      branches: '/branches',
      profiles: '/profiles',
      subscriptions: '/subscriptions'
    },
    operations: {
      services: '/services',
      workOrders: '/work-orders'
    },
    fleet: {
      appointments: '/appointments',
      customerRegistrations: '/customer-registrations',
      employeeRegistrations: '/employee-registrations'
    },
    iot: {
      obd2Devices: '/obd2-devices',
      obd2DeviceRegistrations: '/obd2-device-registrations',
      vehicles: '/vehicles',
      customers: '/customers',
      vhTelemetryBatches: '/vh_telemetry_batches'
    }
  }
};
