import { DailyRecommendationRollout } from '../Interface/DailyRecommendationRollout';
import pool from '../database';

export class FeedBackRepository {

  async getByItemId(itemId: number): Promise<string> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query<any>(
        'SELECT * FROM Feedback WHERE item_id = ?',
        [itemId]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
}

    async getDailyRecommendationRolloutByDate(date: Date): Promise<DailyRecommendationRollout[]> {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query<any>(
                'SELECT * FROM DailyRecommendationRollout WHERE date = ?',
                [date]
            );
            return rows;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }
}
