export enum SupervisorRole {
  ADMIN = 'admin',
  CLINIC_SUPERVISOR = 'clinic_supervisor',
  STATE_COORDINATOR = 'state_coordinator',
}

export enum ChwStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum PatientRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum PatientStatus {
  ACTIVE = 'active',
  DELIVERED = 'delivered',
  TRANSFERRED = 'transferred',
  LOST_TO_FOLLOWUP = 'lost_to_followup',
  CLOSED = 'closed',
}

export enum VisitStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  MISSED = 'missed',
  CANCELLED = 'cancelled',
}

export enum FlagType {
  HIGH_BP = 'high_bp',
  BLEEDING = 'bleeding',
  SEVERE_HEADACHE = 'severe_headache',
  REDUCED_FETAL_MOVEMENT = 'reduced_fetal_movement',
  SWELLING = 'swelling',
  FEVER = 'fever',
  NO_FETAL_HEARTBEAT = 'no_fetal_heartbeat',
  MISSED_VISIT = 'missed_visit',
  OTHER = 'other',
}

export enum FlagSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum FlagStatus {
  OPEN = 'open',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
}

export enum SmsMessageType {
  APPOINTMENT_REMINDER = 'appointment_reminder',
  RISK_ALERT = 'risk_alert',
  VISIT_CONFIRMATION = 'visit_confirmation',
  GENERAL = 'general',
  FOLLOWUP = 'followup',
}

export enum SmsDeliveryStatus {
  QUEUED = 'queued',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  UNDELIVERED = 'undelivered',
}

export enum CheckInPeriod {
  MORNING = 'morning',
  EVENING = 'evening',
}

export enum CheckInMood {
  GREAT = 'great',
  OKAY = 'okay',
  UNWELL = 'unwell',
  CONCERNING = 'concerning',
}

export enum RiskReporterType {
  CHW = 'chw',
  PATIENT = 'patient',
}

export enum PatientReminderType {
  CHECK_IN_MORNING = 'check_in_morning',
  CHECK_IN_EVENING = 'check_in_evening',
}
