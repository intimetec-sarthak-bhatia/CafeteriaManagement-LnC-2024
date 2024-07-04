import { MealTypeRepository } from "../Repository/mealType";
import { MenuItemRepository } from "../Repository/menuItem";
import { MenuItem } from "../Interface/MenuItem";
import { NotificationService } from "./notification";
import { UserRole } from "../enums/userRoles.enum";

export class MenuItemService {
  private menuRepository = new MenuItemRepository();
  private mealTypeRepository = new MealTypeRepository();
  private NotificationService = new NotificationService();

  async addMenuItem(
    name: string,
    mealType: number,
    price: number,
    availability: number
  ): Promise<string> {
    const item: MenuItem = {
      name,
      mealType,
      price,
      availability,
    };
    await this.menuRepository.createMenuItem(item);
    await this.NotificationService.addNotification(
      `New item added: ${item.name}, Price: ${item.price}`,
      "Chef"
    );
    return "Item added successfully!";
  }

  async getAll(): Promise<MenuItem[]> {
    const result = await this.menuRepository.getAllMenuItems();
    return result;
  }

  async getTopMenuItems(amount: number = 5): Promise<any> {
    const menuItems = await this.menuRepository.getTopMenuItems(amount);
    console.log('menuItems', menuItems);

    for (const item of menuItems) {
      const mealType = await this.mealTypeRepository.getMealTypeById(
        item.mealType
      );
      delete item.mealType;
      if (mealType === "breakfast") {
        item.category = "breakfast";
      } else {
        item.category = "lunch/dinner";
      }
    }

    return menuItems;
  }

  async updatePrice(price: number, name: string): Promise<string> {
    try {
      await this.menuRepository.updatePrice(price, name);
      await this.NotificationService.addNotification(`Price updated for ${name}, Updated Price: ${price}`, UserRole.Chef)
      return "Price updated successfully!";
    } catch (error) {
      throw error;
    }
  }

  async updateAvailability(
    availability: number,
    name: string
  ): Promise<string> {
    try {
      await this.menuRepository.updateAvailability(availability, name);
      await this.NotificationService.addNotification(`Availability updated for ${name}, Updated Availability: ${availability}`, 'Chef')
      return "Availability updated successfully!";
    } catch (error) {
      throw error;
    }
  }

  async updateSentimentScore(score: number, id: number): Promise<string> {
    try {
      await this.menuRepository.updateSentimentScore(score, id);
      return "Sentiment score updated successfully!";
    } catch (error) {
      throw error;
    }
  }

  async getMenuItemById(id: number): Promise<MenuItem> {
    const result = await this.menuRepository.getMenuItemById(id);
    return result;
  }
}
