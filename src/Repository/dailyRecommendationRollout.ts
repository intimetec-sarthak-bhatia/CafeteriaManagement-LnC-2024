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

    async getDailyRecommendationRolloutByDate(date: string): Promise<any[]> {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query<any>(
                'SELECT dr.id, dr.item_id, mi.name AS Item, c.category AS Category, mi.sentiment_score AS "Sentiment Score" FROM DailyRecommendationRollout dr JOIN MenuItem mi ON dr.item_id = mi.id JOIN Category c ON dr.category_id = c.id WHERE  dr.date = ?',
                [date]
            );
            return rows;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async getSelectedMenuItems(date: string): Promise<DailyRecommendationRollout[]> {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query<any>(
                'SELECT * FROM DailyRecommendationRollout WHERE date = ? and isSelected = 1',
                [date]
            );
            return rows;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async updateSelectedMenuItems(date: string, item_ids: number[]): Promise<string> {
        const connection = await pool.getConnection();
        try {
            for (const item_id of item_ids) {
                await connection.query(
                    'UPDATE DailyRecommendationRollout SET isSelected = 1 WHERE date = ? AND item_id = ?',
                    [date, item_id]
                );
            }
            return 'Selected menu updated successfully!';
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async incrementVoteCount(item_id: number): Promise<string> {
        const connection = await pool.getConnection();
        try {
            const date = new Date().toISOString().split('T')[0];
            await connection.query(
                'UPDATE DailyRecommendationRollout SET votes = votes + 1 WHERE item_id = ? AND date = ?',
                [item_id, date]
            );
            return 'Vote count updated successfully!';
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

}
