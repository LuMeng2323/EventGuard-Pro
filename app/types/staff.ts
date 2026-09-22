export interface StaffItem {
  id: number;
  staffNo: string;
  name: string;
  gender: "Male" | "Female";
  status: "Available" | "Leave";
  phone: string;
  idNumber: string;
  idAddress: string;
  securityCertificateNo: string;
  positionId: number;
  hireDate: number;
}

export interface PositionItem {
  id: number;
  name: string;
  monthlySalary: number;
  overtimeRate: number;
}
