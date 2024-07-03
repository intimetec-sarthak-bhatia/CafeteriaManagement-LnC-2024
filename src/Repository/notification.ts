import { Notification } from '../Interface/Notification';
import pool from '../database';


export class NotificationRepository {
    
    async addByRole(notification: string, role: string, date: string): Promise<number> {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query<any>( `INSERT INTO notification (role_id, notification, date)
                SELECT ur.id, ?, ?
                FROM user_role ur
                WHERE ur.roleName = ?`,
               [notification, date, role]);
            return rows.insertId;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async viewByRole(date: string, role: string): Promise<Notification[]> {
        console.log('date:', date, 'role:', role);
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query<any>( `SELECT n.notification, n.date 
                FROM notification n
                JOIN user_role ur ON n.role_id = ur.id
                WHERE DATE(n.date) = DATE(?) AND ur.roleName = ?
                ORDER BY n.date DESC`, [date, role]);
            return rows;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }
}
