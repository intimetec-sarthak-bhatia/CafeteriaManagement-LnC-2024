import { DatabaseError } from "../Exceptions/database-exception";
import pool from "../utils/database";

export class DiscardedItemsFeedbackRepository {

    async addDiscardedItemFeedback(userId: number, itemId: number, didNotLike: string, toImprove: string, momsRecipe: string): Promise<any> {
        const connection = await pool.getConnection();
        const date = new Date().toISOString().split('T')[0];
        try {
            const [rows] = await connection.query<any>(
                "INSERT INTO discardedItemsFeedback (userId, itemId, didNotLike, toImprove, momsRecipe, date) VALUES (?, ?, ?, ?, ?, ?)",
                [userId, itemId, didNotLike, toImprove, momsRecipe, date]
            );
            return rows[0];
        } catch (error) {
            throw new DatabaseError('Error adding discarded Item Feedback', error);
        } finally {
            connection.release();
        }
    }

    async getDiscardedItemFeedback(): Promise<any> {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query<any>(
                `SELECT * FROM discardedItemsFeedback`
            );
            return rows;
        } catch (error) {
            throw new DatabaseError('Error fetching Discarded Items Feedback', error);
        } finally {
            connection.release();
        }
    }
  }
  
