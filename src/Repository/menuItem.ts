import pool from '../database';
import { MenuItem } from '../Interface/MenuItem';

export class MenuItemRepository {
    
    async createMenuItem(item: MenuItem): Promise<number> {
        const connection = await pool.getConnection();
        try {
            const [result] = await connection.query<any>(
                'INSERT INTO MenuItem (name, price, mealType, lastPrepared, timesPrepared, availability, sentimentScore) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [item.name,item.mealType,item.price, null, 0, item.availability, null]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async getTopMenuItems(amount: number): Promise<MenuItem[]> {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query<any>(
                `SELECT mi.id, mi.name, mi.sentimentScore,  mi.mealType,
                        IFNULL(AVG(f.rating), 0) AS averageRating
                 FROM MenuItem mi
                 LEFT JOIN Feedback f ON mi.id = f.itemId
                 GROUP BY mi.id, mi.name
                 ORDER BY mi.sentimentScore DESC
                 LIMIT ?`,
                [amount]
            );
            return rows;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }   

    async getAllMenuItems(): Promise<MenuItem[]> {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query<any>(
                'SELECT mi.id, mi.name, mt.type AS mealtype, mi.price, mi.availability, mi.sentimentScore, AVG(fb.rating) AS avgRating FROM MenuItem mi LEFT JOIN Feedback fb ON mi.id = fb.itemId JOIN mealType mt ON mi.mealtype = mt.id WHERE availability = 1 GROUP BY mi.id, mi.name, mt.type, mi.price, mi.availability, mi.sentimentScore ORDER BY mt.type, mi.sentimentScore DESC, avgRating DESC'
            );
            return rows;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async findByMealType(mealType: number): Promise<MenuItem[]> {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query<any>(
                'SELECT * FROM MenuItem WHERE mealType = ?',
                [mealType]
            );
            return rows;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async getMenuItemById(id: number): Promise<MenuItem> {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query<any>(
                'SELECT * FROM MenuItem WHERE id = ?',
                [id]
            );
            return rows[0];
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async updatePrice(price: number, name: string): Promise<void> {
        const connection = await pool.getConnection();
        try {
            await connection.query<any>(
                'UPDATE MenuItem SET price = ? WHERE name = ?',
                [price, name]
            );
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async updateAvailability(availability: number, name: string): Promise<void> {
        const connection = await pool.getConnection();
        try {
            await connection.query<any>(
                'UPDATE MenuItem SET availability = ? WHERE name = ?',
                [availability, name]
            );
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async updateSentimentScore(score: number, itemId: number): Promise<void> {
        const connection = await pool.getConnection();
        try {
            await connection.query<any>(
                'UPDATE MenuItem SET sentimentScore = ? WHERE id = ?',
                [score, itemId]
            );
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }
}