import { MenuItem } from "../Interface/MenuItem";
import pool from "../database";

export class DiscardItemRepository {

    async suggestDiscardedItems(): Promise<MenuItem[]> {
        const connection = await pool.getConnection();
        try {
          const [rows] = await connection.query<any>(
            `SELECT mi.id, mi.name, mi.sentimentScore,
            IFNULL(AVG(f.rating), 0) AS averageRating
            FROM MenuItem mi
            LEFT JOIN Feedback f ON mi.id = f.itemId
            GROUP BY mi.id, mi.name, mi.sentimentScore
            HAVING mi.sentimentScore < 50 AND averageRating < 2
            ORDER BY mi.sentimentScore DESC`
          );
          return rows;
        } catch (error) {
          throw error;
        } finally {
          connection.release();
        }
    }

    async addDiscardedItem(itemId: number): Promise<void> {
        const connection = await pool.getConnection();
        const date = new Date().toISOString().split('T')[0]
        try {
            await connection.query<any>(
            "INSERT INTO discardedItems (itemId, date) VALUES (?, ?)",
            [itemId, date]
            );
        } catch (error) {
            throw new Error("Item not present in the menu");
        } finally {
            connection.release();
        }
    }

    async viewAllDiscardedItems(): Promise<MenuItem[]> {
        const connection  = await pool.getConnection();
        try {
            const [rows] = await connection.query<any>(
                `SELECT id, itemId, date FROM discardedItems`
            );
            return rows;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async viewThisMonthsDiscardedItems(): Promise<MenuItem[]> {
        const connection = await pool.getConnection();
        const currentMonth = new Date().getMonth() + 1
        const currentYear = new Date().getFullYear();
        try {
            const [rows] = await connection.query<any>(
                `SELECT di.itemId, di.date, mi.name as itemName FROM discardedItems di
                JOIN MenuItem mi ON di.itemId = mi.id`,
                [currentMonth, currentYear]
            );
            return rows;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }
  }
  
