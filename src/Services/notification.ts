import { NotFoundError } from "../Exceptions/notFound-exception";
import { Notification } from "../Interface/Notification";
import { NotificationRepository } from "../Repository/notification";

export class NotificationService {
  private notificationRepository = new NotificationRepository();

  async addNotification(notification: string, role: string): Promise<string> {
    const date = new Date().toISOString().slice(0, 19).replace("T", " ");
    const result = await this.notificationRepository.addByRole(
      notification,
      role,
      date
    );
    if (!result) throw new Error("Error adding notification");
    return "Notification added successfully!";
  }

  async viewNotifications(role: string): Promise<Notification[]> {
    const date = new Date().toISOString().slice(0, 19).replace("T", " ");
    const result = await this.notificationRepository.viewByRole(date, role);
    if (result.length === 0) throw new NotFoundError("No new notifications for today!");
    return result;
  }
}
