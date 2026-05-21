export type BackupType =
  | 'RAW_PHOTOS'
  | 'RAW_VIDEOS'
  | 'EDITED_PHOTOS'
  | 'FINAL_VIDEO'
  | 'ALBUM_FILES'
  | 'FINAL_DELIVERY'
  | 'PROJECT_ARCHIVE';

export type BackupLocationType =
  | 'LOCAL_NAS'
  | 'CLOUD_S3'
  | 'EXTERNAL_HARD_DRIVE';

export type BackupStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'NEEDS_ATTENTION';

export interface BackupRecord {
  id: string;
  projectId: string;
  deliverableId?: string;
  backupType: BackupType;
  locationType: BackupLocationType;
  destinationPath: string;
  status: BackupStatus;
  notes?: string;
  verifiedAt?: string; // Instant represented as ISO string
  createdAt: string;
  updatedAt: string;
}

export interface BackupRecordCreateRequest {
  projectId: string;
  deliverableId?: string;
  backupType: BackupType;
  locationType: BackupLocationType;
  destinationPath: string;
  status: BackupStatus;
  notes?: string;
  verifiedAt?: string; // ISO String
}

export interface BackupRecordUpdateRequest {
  backupType: BackupType;
  locationType: BackupLocationType;
  destinationPath: string;
  status: BackupStatus;
  notes?: string;
  verifiedAt?: string; // ISO String
}
