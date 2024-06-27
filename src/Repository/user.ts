import pool from '../database';
import { User } from '../Interface/User';

export class UserRepository {
  async createUser(user: User): Promise<number> {
    console.log("InRepo:", user);
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query<any>(
        'INSERT INTO user (name, email, password, roleId) VALUES (?, ?, ?, ?)',
        [user.name, user.email, user.password, user.roleId]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  async getUsers(): Promise<User[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query<any>(
        'SELECT user.id, user.email, user.name, user.password, user.roleId FROM user'
      );
      return rows;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  async getUserByEmail(email: string): Promise<User> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query<any>(
        'SELECT user.id, user.email, user.name, user.password, user_role.roleName as role FROM user JOIN user_role ON user.roleId = user_role.id WHERE user.email = ?',
        [email]
      );
      return rows[0];
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }
}
