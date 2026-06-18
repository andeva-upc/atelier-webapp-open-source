export const environment = {
  production: true,
  apiBaseUrl: 'https://atelier-platform.onrender.com/api/v1',
  endpoints: {
    iam: {
      signIn: '/authentication/sign-in',
      signUp: '/authentication/sign-up',
      googleSignIn: '/authentication/google-sign-in',
      forgotPassword: '/authentication/forgot-password',
      resetPassword: '/authentication/reset-password',
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
      profiles: '/profiles'
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
