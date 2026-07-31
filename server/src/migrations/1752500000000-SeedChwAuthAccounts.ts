import { MigrationInterface, QueryRunner } from 'typeorm';

import { hashPassword } from '@/lib/auth/crypto';

const DEFAULT_CHW_PASSWORD = 'chw123';

const CHW_AUTH_ACCOUNTS = [
  {
    fullName: 'Chidi Okonkwo',
    email: 'samniz.350@gmail.com',
  },
  {
    fullName: 'Blessing Adeyemi',
    email: 'scamil350@gmail.com',
  },
  {
    fullName: 'Michael Eze',
    email: 's.nizeyiman@alustudent.com',
  },
] as const;

export class SeedChwAuthAccounts1752500000000 implements MigrationInterface {
  name = 'SeedChwAuthAccounts1752500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const passwordHash = await hashPassword(DEFAULT_CHW_PASSWORD);

    for (const account of CHW_AUTH_ACCOUNTS) {
      const chws = await queryRunner.query(
        `SELECT id, auth_user_id FROM chw_users WHERE full_name = $1 LIMIT 1`,
        [account.fullName],
      );

      if (chws.length === 0) {
        throw new Error(
          `CHW "${account.fullName}" not found. Run seed data before this migration.`,
        );
      }

      const chw = chws[0] as { id: string; auth_user_id: string | null };
      if (chw.auth_user_id) {
        continue;
      }

      const existingUsers = await queryRunner.query(
        `SELECT id FROM auth_users WHERE email = $1 LIMIT 1`,
        [account.email],
      );

      let authUserId: string;

      if (existingUsers.length === 0) {
        const insertedUsers = await queryRunner.query(
          `
            INSERT INTO auth_users (email, name, email_verified_at)
            VALUES ($1, $2, now())
            RETURNING id
          `,
          [account.email, account.fullName],
        );
        authUserId = insertedUsers[0].id as string;

        await queryRunner.query(
          `
            INSERT INTO auth_accounts (user_id, password_hash)
            VALUES ($1, $2)
          `,
          [authUserId, passwordHash],
        );
      } else {
        authUserId = existingUsers[0].id as string;

        const existingAccounts = await queryRunner.query(
          `SELECT id FROM auth_accounts WHERE user_id = $1 LIMIT 1`,
          [authUserId],
        );

        if (existingAccounts.length === 0) {
          await queryRunner.query(
            `
              INSERT INTO auth_accounts (user_id, password_hash)
              VALUES ($1, $2)
            `,
            [authUserId, passwordHash],
          );
        }
      }

      await queryRunner.query(
        `UPDATE chw_users SET auth_user_id = $1 WHERE id = $2`,
        [authUserId, chw.id],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const account of CHW_AUTH_ACCOUNTS) {
      const users = await queryRunner.query(
        `SELECT id FROM auth_users WHERE email = $1 LIMIT 1`,
        [account.email],
      );

      if (users.length === 0) {
        continue;
      }

      const authUserId = users[0].id as string;

      await queryRunner.query(
        `UPDATE chw_users SET auth_user_id = NULL WHERE auth_user_id = $1`,
        [authUserId],
      );
      await queryRunner.query(
        `DELETE FROM auth_sessions WHERE user_id = $1`,
        [authUserId],
      );
      await queryRunner.query(
        `DELETE FROM auth_accounts WHERE user_id = $1`,
        [authUserId],
      );
      await queryRunner.query(`DELETE FROM auth_users WHERE id = $1`, [
        authUserId,
      ]);
    }
  }
}
