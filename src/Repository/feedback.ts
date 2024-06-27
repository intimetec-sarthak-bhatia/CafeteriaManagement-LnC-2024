import pool from '../database';

export class FeedBackRepository {

  async getByItemId(itemId: number): Promise<any> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query<any>(
        'SELECT * FROM Feedback WHERE item_id = ?',
        [itemId]
      );
      return rows || null;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
}

  async addFeedback(userId, itemId: number, ratings: number, comment: string, date: string): Promise<string> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'INSERT INTO Feedback (user_id, item_id, rating, comment, date) VALUES (?, ?, ?,?, ?)',
        [userId, itemId, ratings, comment, date]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  
}
