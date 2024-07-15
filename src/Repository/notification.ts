import { DatabaseError } from '../Exceptions/database-exception';
import { Notification } from '../Interface/Notification';
import pool from '../utils/database';


export class NotificationRepository {
    
    async addByRole(notification: string, role: string, date: string): Promise<number> {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query<any>( `INSERT INTO notification (roleId, notification, date)
                SELECT ur.id, ?, ?
                FROM userRole ur
                WHERE ur.roleName = ?`,
               [notification, date, role]);
            return rows.insertId;
        } catch (error) {
            throw new DatabaseError('Error adding notification, please enter correct role', error);
        } finally {
            connection.release();
        }
    }

    async viewByRole(date: string, role: string): Promise<Notification[]> {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query<any>( `SELECT n.notification, n.date 
                FROM notification n
                JOIN userRole ur ON n.roleId = ur.id
                WHERE DATE(n.date) = DATE(?) AND ur.roleName = ?
                ORDER BY n.date DESC`, [date, role]);
            return rows;
        } catch (error) {
            throw new DatabaseError('Error fetching notifications', error);
        } finally {
            connection.release();
        }
    }
}
