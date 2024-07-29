import pool from '../../Config/database.config';
import { DatabaseError } from '../Exceptions/database-exception';
import { UserPreference } from '../Interface/UserPreference';

export class UserPreferenceRepository {
  async addUserPreference( userPreference: UserPreference): Promise<number> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query<any>(
        'INSERT INTO UserProfile (userId, dietType, spiceLevel, preferredCuisine, sweetTooth) VALUES (?, ?, ?, ?, ?)',
        [userPreference.userId, userPreference.dietType, userPreference.spiceLevel, userPreference.preferredCuisine, userPreference.sweetTooth]
      );
      return result.insertId;
    } catch (error) {
      throw new DatabaseError('Failed to add user preference', error);
    } finally {
      connection.release();
    }
  }

  async updateUserPreference( userPreference: UserPreference): Promise<void> {
    const connection = await pool.getConnection();
    try {
      await connection.query<any>(
        'UPDATE UserProfile SET dietType = ?, spiceLevel = ?, preferredCuisine = ?, sweetTooth = ? WHERE userId = ?',
        [userPreference.userId, userPreference.dietType, userPreference.spiceLevel, userPreference.preferredCuisine, userPreference.sweetTooth]
      );
    } catch (error) {
      throw new DatabaseError('Failed to update user preference', error);
    } finally {
      connection.release();
    }
  }

  async getUserPreference(userId: number): Promise<any> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query<any>('SELECT * FROM UserProfile WHERE userId = ?', [userId]);
      return result[0];
    } catch (error) {
      throw new Error(`Failed to get user preference: ${error.message}`);
    } finally {
      connection.release();
    }
  }
}
