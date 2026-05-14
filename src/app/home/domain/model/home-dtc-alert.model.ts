export interface HomeDtcAlert {
  id: string;
  dtcCode: string;
  plateNumber: string;
  description: string;
  time: string;
  severity: 'CRITICAL' | 'MEDIUM';
}
