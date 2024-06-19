import pool from '../database';
import { UserRole } from '../Entity/UserRole';

export class UserRoleRepository {
  async createUserRole(roleName: string): Promise<number> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query<any>(
        'INSERT INTO user_role (roleName) VALUES (?)',
        [roleName]
      );
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async getUserRoles(): Promise<UserRole[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query<any>(
        'SELECT id, roleName FROM user_role'
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  async getRoleById(id: number): Promise<UserRole> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query<any>(
        'SELECT id, roleName FROM user_role WHERE id = ?',
        [id]
      );
      return rows[0];
    } finally {
      connection.release();
    }
  }
}
