import { DailyRecommendationRollout } from '../Interface/DailyRecommendationRollout';
import pool from '../database';

export class DailyRecommendationRolloutRepository {

  async create(DailyRecommendationRollout: DailyRecommendationRollout): Promise<string> {
    const connection = await pool.getConnection();
    const { itemId, date, categoryId } = DailyRecommendationRollout;
    try {
      const [rows] = await connection.query(
        'INSERT INTO DailyRecommendationRollout (itemId, date, categoryId) VALUES (?, ?, ?)',
        [itemId, date, categoryId]
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
                `SELECT dr.itemId,dr.votes, mi.name AS Item, c.category AS Category, mi.sentimentScore AS "Sentiment Score",
                fc.type AS dietType,
                fc.spiceLevel,
                fc.cuisine
                FROM DailyRecommendationRollout dr 
                JOIN MenuItem mi ON dr.itemId = mi.id 
                JOIN Category c ON dr.categoryId = c.id 
                JOIN foodCharacteristics fc ON mi.id = fc.itemId
                WHERE  dr.date = ?`,
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

    async updateSelectedMenuItems(date: string, itemIds: number[]): Promise<string> {
        const connection = await pool.getConnection();
        try {
            for (const itemId of itemIds) {
                await connection.query(
                    'UPDATE DailyRecommendationRollout SET isSelected = 1 WHERE date = ? AND itemId = ?',
                    [date, itemId]
                );
            }
            return 'Selected menu updated successfully!';
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async incrementVoteCount(itemId: number): Promise<string> {
        const connection = await pool.getConnection();
        try {
            const date = new Date().toISOString().split('T')[0];
            await connection.query(
                'UPDATE DailyRecommendationRollout SET votes = votes + 1 WHERE itemId = ? AND date = ?',
                [itemId, date]
            );
            return 'Vote count updated successfully!';
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

}
