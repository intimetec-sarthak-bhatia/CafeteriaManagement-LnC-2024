import pool from "../database";

export class UserVotesRepository {


  async addUserVote(user_id: number, menuRollOutId: number[], date: string): Promise<string> {
    const connection = await pool.getConnection();
    try {
        menuRollOutId.forEach(async (id) => {
            await connection.query(
                'INSERT INTO UserVotes (userId, menuRollOutId, date) VALUES (?, ?, ?)',
                [user_id, id, date]
            );
        });
        return 'Votes added successfully!';

    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  async getVotesByDate(userId: number, date: string): Promise<any> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT * FROM UserVotes WHERE userId = ? AND date = ?',
        [userId, date]
      );
      return rows;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
    
  }
}