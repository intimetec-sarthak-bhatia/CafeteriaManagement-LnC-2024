import { DailyRecommendationRollout } from '../Interface/DailyRecommendationRollout';
import pool from '../database';

export class DailyRecommendationRolloutRepository {

  async create(DailyRecommendationRollout: DailyRecommendationRollout): Promise<string> {
    const connection = await pool.getConnection();
    const { item_id, date, category_id } = DailyRecommendationRollout;
    try {
      const [rows] = await connection.query(
        'INSERT INTO DailyRecommendationRollout (item_id, date, category_id) VALUES (?, ?, ?)',
        [item_id, date, category_id]
      );
      return rows[0]?.type || null;
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
