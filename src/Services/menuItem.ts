import { MealTypeRepository } from "../Repository/mealType";
import { MenuItemRepository } from "../Repository/menuItem";
import { MenuItem } from "../Interface/MenuItem";
import { NotificationService } from "./notification";
import { UserRole } from "../Enums/userRoles.enum";

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

  async getTopMenuItems(amount: number = 10): Promise<any> {
    const menuItems = await this.menuRepository.getTopMenuItems(amount);
    const menuItemsByCategory = await this.groupByCategory(menuItems);
    const sortedMenuItems = await this.sortMenuItemsByCategory(menuItemsByCategory);
    return sortedMenuItems;
  }

  async updatePrice(price: number, name: string): Promise<string> {
      await this.menuRepository.updatePrice(price, name);
      await this.NotificationService.addNotification(`Price updated for ${name}, Updated Price: ${price}`, UserRole.Chef)
      return "Price updated successfully!";
  }

  async updateAvailability(
    availability: number,
    id: number
  ): Promise<string> {
      await this.menuRepository.updateAvailability(availability, id);
      await this.NotificationService.addNotification(`Availability updated for ${id}, Updated Availability: ${availability}`, 'Chef')
      return "Availability updated successfully!";
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

  async groupByCategory(menuItems): Promise<any> {
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

  async sortMenuItemsByCategory(menuItems) {
    menuItems.sort((a, b) => {
      if (a.category === "breakfast" && b.category !== "breakfast") {
        return -1;
      } else if (a.category !== "breakfast" && b.category === "breakfast") {
        return 1;
      } else {
        return 0;
      }
    });
    return menuItems;
  }

}
