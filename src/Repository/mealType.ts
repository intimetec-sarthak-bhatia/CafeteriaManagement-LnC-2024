import { DatabaseError } from '../Exceptions/database-exception';
import pool from '../../Config/database';

export class MealTypeRepository {
  async getMealTypeById(id: number): Promise<string> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query<any>(
        'SELECT type FROM MealType WHERE id = ?',
        [id]
      );
      return rows[0]?.type || null;
    } catch (error) {
      throw new DatabaseError('Error fetching mealType', error);
    } finally {
      connection.release();
    }
  }
}
