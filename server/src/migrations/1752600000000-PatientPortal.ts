import { MigrationInterface, QueryRunner } from 'typeorm';

export class PatientPortal1752600000000 implements MigrationInterface {
  name = 'PatientPortal1752600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "patient_check_ins_period_enum" AS ENUM ('morning', 'evening')
    `);
    await queryRunner.query(`
      CREATE TYPE "patient_check_ins_mood_enum" AS ENUM ('great', 'okay', 'unwell', 'concerning')
    `);
    await queryRunner.query(`
      CREATE TYPE "risk_flags_reporter_type_enum" AS ENUM ('chw', 'patient')
    `);
    await queryRunner.query(`
      CREATE TYPE "patient_reminder_logs_type_enum" AS ENUM ('check_in_morning', 'check_in_evening')
    `);

    await queryRunner.query(`
      ALTER TABLE "patients"
      ADD COLUMN "auth_user_id" uuid,
      ADD COLUMN "email" text,
      ADD COLUMN "check_in_reminders_enabled" boolean NOT NULL DEFAULT true,
      ADD CONSTRAINT "UQ_patients_auth_user" UNIQUE ("auth_user_id"),
      ADD CONSTRAINT "FK_patients_auth_user" FOREIGN KEY ("auth_user_id")
        REFERENCES "auth_users"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_patients_auth_user" ON "patients" ("auth_user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_patients_email" ON "patients" ("email")
    `);

    await queryRunner.query(`
      ALTER TABLE "risk_flags"
      ADD COLUMN "reporter_type" "risk_flags_reporter_type_enum" NOT NULL DEFAULT 'chw'
    `);
    await queryRunner.query(`
      ALTER TABLE "risk_flags" ALTER COLUMN "reported_by" DROP NOT NULL
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_risk_flags_reporter_type" ON "risk_flags" ("reporter_type")
    `);

    await queryRunner.query(`
      CREATE TABLE "patient_check_ins" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "patient_id" uuid NOT NULL,
        "check_in_date" date NOT NULL,
        "period" "patient_check_ins_period_enum" NOT NULL,
        "mood" "patient_check_ins_mood_enum" NOT NULL,
        "notes" text,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_patient_check_ins" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_patient_check_in_day_period" UNIQUE ("patient_id", "check_in_date", "period"),
        CONSTRAINT "FK_patient_check_ins_patient" FOREIGN KEY ("patient_id")
          REFERENCES "patients"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_patient_check_ins_patient" ON "patient_check_ins" ("patient_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_patient_check_ins_date" ON "patient_check_ins" ("check_in_date")
    `);

    await queryRunner.query(`
      CREATE TABLE "patient_reminder_logs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "patient_id" uuid NOT NULL,
        "reminder_type" "patient_reminder_logs_type_enum" NOT NULL,
        "email" text NOT NULL,
        "sent_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_patient_reminder_logs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_patient_reminder_logs_patient" FOREIGN KEY ("patient_id")
          REFERENCES "patients"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_patient_reminder_logs_patient" ON "patient_reminder_logs" ("patient_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_patient_reminder_logs_sent_at" ON "patient_reminder_logs" ("sent_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "patient_reminder_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "patient_check_ins"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_risk_flags_reporter_type"`);
    await queryRunner.query(`
      DELETE FROM "risk_flags" WHERE "reported_by" IS NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "risk_flags" DROP COLUMN IF EXISTS "reporter_type"
    `);
    await queryRunner.query(`
      ALTER TABLE "risk_flags" ALTER COLUMN "reported_by" SET NOT NULL
    `);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_patients_email"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_patients_auth_user"`);
    await queryRunner.query(`
      ALTER TABLE "patients"
      DROP CONSTRAINT IF EXISTS "FK_patients_auth_user",
      DROP CONSTRAINT IF EXISTS "UQ_patients_auth_user",
      DROP COLUMN IF EXISTS "check_in_reminders_enabled",
      DROP COLUMN IF EXISTS "email",
      DROP COLUMN IF EXISTS "auth_user_id"
    `);
    await queryRunner.query(`DROP TYPE IF EXISTS "patient_reminder_logs_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "risk_flags_reporter_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "patient_check_ins_mood_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "patient_check_ins_period_enum"`);
  }
}
