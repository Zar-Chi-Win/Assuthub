export type UserRole = 'Admin' | 'Employee';

export type AssetStatus =
  | 'Available'
  | 'Assigned'
  | 'Under Maintenance'
  | 'Retired';

export type AssetCondition =
  | 'New'
  | 'Excellent'
  | 'Good'
  | 'Fair'
  | 'Poor';

export type RequestPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type RequestStatus = 'Pending' | 'Approved' | 'Rejected';

export type MaintenanceType = 'Routine' | 'Repair' | 'Upgrade' | 'Safety Check';

export type MaintenanceStatus = 'Open' | 'In Progress' | 'Completed' | 'Deferred';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  department?: string;
  createdAt?: string;
}

export interface Asset {
  assetId: string;
  name: string;
  category: string;
  status: AssetStatus;
  condition: AssetCondition;
  serialNumber?: string;
  currentUserId?: string;
  assignmentDate?: string;
  lastMaintenance?: string;
  purchaseCost?: number;
  tags?: string[];
}

export interface AssignmentHistoryEntry {
  historyId: string;
  assetId: string;
  assignedToUserId: string;
  assignedByUserId: string;
  assignmentDate: string;
  unassignmentDate?: string;
}

export interface AssetRequest {
  requestId: string;
  requestedByUserId: string;
  assetType: string;
  reason: string;
  priority: RequestPriority;
  status: RequestStatus;
  adminComment?: string;
  linkedAssetId?: string;
  createdAt: string;
}

export interface MaintenanceTicket {
  ticketId: string;
  assetId: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  technicianUserId?: string;
  technicianName?: string;
  cost?: number;
  resolutionNotes?: string;
  openedAt: string;
  closedAt?: string;
}

export interface ProvisioningQueueEntry {
  email: string;
  name: string;
  role: UserRole;
  department?: string;
}
