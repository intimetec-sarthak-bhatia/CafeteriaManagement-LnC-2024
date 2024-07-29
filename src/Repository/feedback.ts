import pool from '../../Config/database.config';
import { DatabaseError } from '../Exceptions/database-exception';

export class FeedBackRepository {

  async getByItemId(itemId: number): Promise<any> {
    const connection = await pool.getConnection();
    const date = new Date().toISOString().split('T')[0];
    try {
      const [rows] = await connection.query<any>(
        'SELECT * FROM Feedback WHERE itemId = ? AND date = ?',
        [itemId, date]
      );
      return rows || null;
    } catch (error) {
      throw new DatabaseError('Error fetching Feedback', error);
    } finally {
      connection.release();
    }
}

  async addFeedback(userId: number, itemId: number, ratings: number, comment: string, date: string): Promise<string> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'INSERT INTO Feedback (userId, itemId, rating, comment, date) VALUES (?, ?, ?,?, ?)',
        [userId, itemId, ratings, comment, date]
      );
      return rows[0] || null;
    } catch (error) {
      throw new DatabaseError('Error adding Feedback', error);
    } finally {
      connection.release();
    }
  }

  
}
