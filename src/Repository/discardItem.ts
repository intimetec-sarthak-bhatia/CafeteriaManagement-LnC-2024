import pool from "../../Config/database.config";
import { DatabaseError } from "../Exceptions/database-exception";
import { MenuItem } from "../Interface/MenuItem";

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
      throw new DatabaseError(
        "Error fetching suggested discarded items",
        error
      );
    } finally {
      connection.release();
    }
  }

  async addDiscardedItem(itemId: number): Promise<void> {
    const connection = await pool.getConnection();
    const date = new Date().toISOString().split("T")[0];
    try {
      await connection.query<any>(
        "INSERT INTO discardedItems (itemId, date) VALUES (?, ?)",
        [itemId, date]
      );
    } catch (error) {
        throw new DatabaseError('Item not present in menu', error);
    } finally {
      connection.release();
    }
  }

  async viewAllDiscardedItems(): Promise<MenuItem[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query<any>(
        `SELECT id, itemId, date FROM discardedItems`
      );
      return rows;
    } catch (error) {
        throw new DatabaseError('Error fetching all discarded items', error);
    } finally {
      connection.release();
    }
  }

  async viewThisMonthsDiscardedItems(): Promise<MenuItem[]> {
    const connection = await pool.getConnection();
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    try {
      const [rows] = await connection.query<any>(
        `SELECT di.itemId, di.date, mi.name as itemName FROM discardedItems di
                JOIN MenuItem mi ON di.itemId = mi.id`,
        [currentMonth, currentYear]
      );
      return rows;
    } catch (error) {
        throw new DatabaseError('Error fetching this months discarded items', error);
    } finally {
      connection.release();
    }
  }
}
