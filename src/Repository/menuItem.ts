import pool from '../database';
import { MenuItem } from '../entity/MenuItem';

export class MenuItemRepository {
    
    async createMenuItem(item: MenuItem): Promise<number> {
        const connection = await pool.getConnection();
        try {
            const [result] = await connection.query<any>(
                'INSERT INTO MenuItem (name, price, mealType, last_prepared, times_prepared, availability, sentiment_score) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [item.name,item.mealType,item.price, null, 0, item.availability, null]
            );
            return result.insertId;
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
                'SELECT id, name, mealtype, price, availability, sentiment_score FROM MenuItem'
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
}
