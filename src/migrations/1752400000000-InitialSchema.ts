import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1752400000000 implements MigrationInterface {
  name = 'InitialSchema1752400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TYPE "supervisors_role_enum" AS ENUM ('admin', 'clinic_supervisor', 'state_coordinator')
    `);
    await queryRunner.query(`
      CREATE TYPE "chw_users_status_enum" AS ENUM ('active', 'inactive', 'suspended')
    `);
    await queryRunner.query(`
      CREATE TYPE "patients_risk_level_enum" AS ENUM ('low', 'medium', 'high')
    `);
    await queryRunner.query(`
      CREATE TYPE "patients_status_enum" AS ENUM ('active', 'delivered', 'transferred', 'lost_to_followup', 'closed')
    `);
    await queryRunner.query(`
      CREATE TYPE "antenatal_visits_status_enum" AS ENUM ('scheduled', 'completed', 'missed', 'cancelled')
    `);
    await queryRunner.query(`
      CREATE TYPE "risk_flags_flag_type_enum" AS ENUM (
        'high_bp', 'bleeding', 'severe_headache', 'reduced_fetal_movement',
        'swelling', 'fever', 'no_fetal_heartbeat', 'missed_visit', 'other'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "risk_flags_severity_enum" AS ENUM ('low', 'medium', 'high', 'critical')
    `);
    await queryRunner.query(`
      CREATE TYPE "risk_flags_status_enum" AS ENUM ('open', 'acknowledged', 'resolved', 'escalated')
    `);
    await queryRunner.query(`
      CREATE TYPE "sms_logs_message_type_enum" AS ENUM (
        'appointment_reminder', 'risk_alert', 'visit_confirmation', 'general', 'followup'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "sms_logs_delivery_status_enum" AS ENUM ('queued', 'sent', 'delivered', 'failed', 'undelivered')
    `);

    await queryRunner.query(`
      CREATE TABLE "auth_users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" text NOT NULL,
        "name" text,
        "email_verified_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_auth_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_auth_users_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "auth_accounts" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "password_hash" text NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_auth_accounts" PRIMARY KEY ("id"),
        CONSTRAINT "FK_auth_accounts_user" FOREIGN KEY ("user_id") REFERENCES "auth_users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "auth_sessions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "token_hash" text NOT NULL,
        "expires_at" TIMESTAMPTZ NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_auth_sessions" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_auth_sessions_token" UNIQUE ("token_hash"),
        CONSTRAINT "FK_auth_sessions_user" FOREIGN KEY ("user_id") REFERENCES "auth_users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "auth_verification_codes" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" text NOT NULL,
        "code" text NOT NULL,
        "expires_at" TIMESTAMPTZ NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_auth_verification_codes" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "clinics" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" text NOT NULL,
        "lga" text,
        "state" text,
        "contact_phone" text,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_clinics" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "supervisors" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "clinic_id" uuid NOT NULL,
        "auth_user_id" uuid NOT NULL,
        "full_name" text NOT NULL,
        "phone" text,
        "email" text,
        "role" "supervisors_role_enum" NOT NULL DEFAULT 'clinic_supervisor',
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_supervisors" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_supervisors_auth_user" UNIQUE ("auth_user_id"),
        CONSTRAINT "UQ_supervisors_email" UNIQUE ("email"),
        CONSTRAINT "FK_supervisors_clinic" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_supervisors_auth_user" FOREIGN KEY ("auth_user_id") REFERENCES "auth_users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "chw_users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "clinic_id" uuid NOT NULL,
        "supervisor_id" uuid,
        "auth_user_id" uuid,
        "full_name" text NOT NULL,
        "phone" text,
        "village_area" text,
        "status" "chw_users_status_enum" NOT NULL DEFAULT 'active',
        "last_sync_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_chw_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_chw_users_auth_user" UNIQUE ("auth_user_id"),
        CONSTRAINT "FK_chw_users_clinic" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_chw_users_supervisor" FOREIGN KEY ("supervisor_id") REFERENCES "supervisors"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_chw_users_auth_user" FOREIGN KEY ("auth_user_id") REFERENCES "auth_users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "patients" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "chw_id" uuid NOT NULL,
        "clinic_id" uuid NOT NULL,
        "full_name" text NOT NULL,
        "phone" text,
        "age" integer,
        "village" text,
        "lmp" date,
        "edd" date,
        "gestational_weeks" integer,
        "gravida" integer,
        "parity" integer,
        "risk_level" "patients_risk_level_enum" NOT NULL DEFAULT 'low',
        "status" "patients_status_enum" NOT NULL DEFAULT 'active',
        "synced" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_patients" PRIMARY KEY ("id"),
        CONSTRAINT "FK_patients_chw" FOREIGN KEY ("chw_id") REFERENCES "chw_users"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_patients_clinic" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "antenatal_visits" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "patient_id" uuid NOT NULL,
        "chw_id" uuid NOT NULL,
        "contact_number" integer,
        "scheduled_date" date,
        "completed_date" date,
        "bp_systolic" integer,
        "bp_diastolic" integer,
        "weight_kg" numeric(5,2),
        "fundal_height_cm" integer,
        "fetal_heart_rate" text,
        "danger_signs_present" boolean NOT NULL DEFAULT false,
        "notes" text,
        "status" "antenatal_visits_status_enum" NOT NULL DEFAULT 'scheduled',
        "synced" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_antenatal_visits" PRIMARY KEY ("id"),
        CONSTRAINT "FK_visits_patient" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_visits_chw" FOREIGN KEY ("chw_id") REFERENCES "chw_users"("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "risk_flags" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "patient_id" uuid NOT NULL,
        "visit_id" uuid,
        "reported_by" uuid NOT NULL,
        "resolved_by" uuid,
        "flag_type" "risk_flags_flag_type_enum" NOT NULL,
        "severity" "risk_flags_severity_enum" NOT NULL DEFAULT 'medium',
        "description" text,
        "status" "risk_flags_status_enum" NOT NULL DEFAULT 'open',
        "flagged_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "resolved_at" TIMESTAMPTZ,
        "resolution_notes" text,
        "synced" boolean NOT NULL DEFAULT false,
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_risk_flags" PRIMARY KEY ("id"),
        CONSTRAINT "FK_risk_flags_patient" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_risk_flags_visit" FOREIGN KEY ("visit_id") REFERENCES "antenatal_visits"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_risk_flags_reported_by" FOREIGN KEY ("reported_by") REFERENCES "chw_users"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_risk_flags_resolved_by" FOREIGN KEY ("resolved_by") REFERENCES "supervisors"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "sms_logs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "patient_id" uuid,
        "visit_id" uuid,
        "recipient_phone" text NOT NULL,
        "message_type" "sms_logs_message_type_enum" NOT NULL DEFAULT 'general',
        "message_body" text NOT NULL,
        "africas_talking_id" text,
        "delivery_status" "sms_logs_delivery_status_enum" NOT NULL DEFAULT 'queued',
        "sent_at" TIMESTAMPTZ,
        "delivered_at" TIMESTAMPTZ,
        CONSTRAINT "PK_sms_logs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sms_logs_patient" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_sms_logs_visit" FOREIGN KEY ("visit_id") REFERENCES "antenatal_visits"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_auth_users_email" ON "auth_users" ("email")`);
    await queryRunner.query(`CREATE INDEX "idx_auth_accounts_user" ON "auth_accounts" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_auth_sessions_token" ON "auth_sessions" ("token_hash")`);
    await queryRunner.query(`CREATE INDEX "idx_auth_sessions_user" ON "auth_sessions" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_auth_verification_email" ON "auth_verification_codes" ("email")`);
    await queryRunner.query(`CREATE INDEX "idx_clinics_state_lga" ON "clinics" ("state", "lga")`);
    await queryRunner.query(`CREATE INDEX "idx_supervisors_clinic" ON "supervisors" ("clinic_id")`);
    await queryRunner.query(`CREATE INDEX "idx_supervisors_auth_user" ON "supervisors" ("auth_user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_chw_clinic" ON "chw_users" ("clinic_id")`);
    await queryRunner.query(`CREATE INDEX "idx_chw_supervisor" ON "chw_users" ("supervisor_id")`);
    await queryRunner.query(`CREATE INDEX "idx_chw_auth_user" ON "chw_users" ("auth_user_id")`);
    await queryRunner.query(`CREATE INDEX "idx_patients_chw" ON "patients" ("chw_id")`);
    await queryRunner.query(`CREATE INDEX "idx_patients_clinic" ON "patients" ("clinic_id")`);
    await queryRunner.query(`CREATE INDEX "idx_patients_risk_level" ON "patients" ("risk_level")`);
    await queryRunner.query(`CREATE INDEX "idx_patients_status" ON "patients" ("status")`);
    await queryRunner.query(`CREATE INDEX "idx_visits_patient" ON "antenatal_visits" ("patient_id")`);
    await queryRunner.query(`CREATE INDEX "idx_visits_chw" ON "antenatal_visits" ("chw_id")`);
    await queryRunner.query(`CREATE INDEX "idx_visits_status" ON "antenatal_visits" ("status")`);
    await queryRunner.query(`CREATE INDEX "idx_visits_scheduled_date" ON "antenatal_visits" ("scheduled_date")`);
    await queryRunner.query(`CREATE INDEX "idx_risk_flags_patient" ON "risk_flags" ("patient_id")`);
    await queryRunner.query(`CREATE INDEX "idx_risk_flags_visit" ON "risk_flags" ("visit_id")`);
    await queryRunner.query(`CREATE INDEX "idx_risk_flags_reported_by" ON "risk_flags" ("reported_by")`);
    await queryRunner.query(`CREATE INDEX "idx_risk_flags_resolved_by" ON "risk_flags" ("resolved_by")`);
    await queryRunner.query(`CREATE INDEX "idx_risk_flags_status" ON "risk_flags" ("status")`);
    await queryRunner.query(`CREATE INDEX "idx_risk_flags_severity" ON "risk_flags" ("severity")`);
    await queryRunner.query(`CREATE INDEX "idx_sms_logs_patient" ON "sms_logs" ("patient_id")`);
    await queryRunner.query(`CREATE INDEX "idx_sms_logs_visit" ON "sms_logs" ("visit_id")`);
    await queryRunner.query(`CREATE INDEX "idx_sms_logs_delivery_status" ON "sms_logs" ("delivery_status")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "sms_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "risk_flags"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "antenatal_visits"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "patients"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "chw_users"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "supervisors"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "clinics"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "auth_verification_codes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "auth_sessions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "auth_accounts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "auth_users"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "sms_logs_delivery_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "sms_logs_message_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "risk_flags_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "risk_flags_severity_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "risk_flags_flag_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "antenatal_visits_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "patients_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "patients_risk_level_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "chw_users_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "supervisors_role_enum"`);
  }
}
