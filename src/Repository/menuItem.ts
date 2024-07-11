import pool from "../database";
import { MenuItem } from "../Interface/MenuItem";

export class MenuItemRepository {
  async createMenuItem(item: MenuItem): Promise<number> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query<any>(
        "INSERT INTO MenuItem (name, price, mealType, lastPrepared, timesPrepared, availability, sentimentScore) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [item.name, item.mealType, item.price, null, 0, item.availability, null]
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
        "SELECT mi.id, mi.name, mt.type AS mealtype, mi.price, mi.availability, mi.sentimentScore, AVG(fb.rating) AS avgRating FROM MenuItem mi LEFT JOIN Feedback fb ON mi.id = fb.itemId JOIN mealType mt ON mi.mealtype = mt.id WHERE availability = 1 GROUP BY mi.id, mi.name, mt.type, mi.price, mi.availability, mi.sentimentScore ORDER BY mt.type, mi.sentimentScore DESC, avgRating DESC"
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
        "SELECT * FROM MenuItem WHERE mealType = ?",
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
        "SELECT * FROM MenuItem WHERE id = ?",
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
      const [rows] = await connection.query<any>(
        "UPDATE MenuItem SET price = ? WHERE name = ?",
        [price, name]
      );
      return rows[0];
    } catch (error) {
      throw new Error('Item not found with this name');
    } finally {
      connection.release();
    }
  }

  async updateAvailability(availability: number, id: number): Promise<any> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query<any>(
        "UPDATE MenuItem SET availability = ? WHERE id = ?",
        [availability, id]
      );
      return rows;
    } catch (error) {
      throw new Error('Item not found with this id');
    } finally {
      connection.release();
    }
  }

  async updateSentimentScore(score: number, itemId: number): Promise<void> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query<any>(
        "UPDATE MenuItem SET sentimentScore = ? WHERE id = ?",
        [score, itemId]
      );
      return rows[0];
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

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
            throw error;
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
            throw error;
        } finally {
            connection.release();
        }
    }
  }
  
