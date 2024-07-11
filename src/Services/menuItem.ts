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

  async getTopMenuItems(amount: number = 5): Promise<any> {
    const menuItems = await this.menuRepository.getTopMenuItems(amount);
    const menuItemsByCategory = await this.groupByCategory(menuItems);
    return menuItemsByCategory;
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

  async getSuggestedDiscardItems(): Promise<MenuItem[]> {
    if(await this.checkIfItemDiscardedThisMonth()){
      throw new Error('Item already discarded this month, please wait for next month to discard again');
    }
    const items = await this.menuRepository.suggestDiscardedItems();
    if(!items.length) throw new Error('No suggestions for discard items found !');
    return items;
  }

  async addDiscardItem(itemId: number): Promise<string> {
      await this.menuRepository.addDiscardedItem(itemId);
      await this.updateAvailability(0, itemId);
      await this.NotificationService.addNotification(`Item with id: ${itemId} added to discard list, please give your valuable feedback for it`, 'Employee');
      return 'Item added to discard list successfully!';
  }

  async viewAllDiscardedItems(): Promise<any> {
    const discardItems = await this.menuRepository.viewAllDiscardedItems();
    return discardItems;
  }

  async viewThisMonthsDiscardedItems(): Promise<any> {
    const discardItems = await this.menuRepository.viewThisMonthsDiscardedItems();
    return discardItems
  }


  async checkIfItemDiscardedThisMonth() {
    const discardedItems = await this.viewAllDiscardedItems();
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear();

    for (const item of discardedItems) {
      const discardDate = new Date(item.date);
      const discardMonth = discardDate.getMonth() + 1; 
      const discardYear = discardDate.getFullYear();
  
      if (discardMonth === currentMonth && discardYear === currentYear) {
        return true;
      }
    }
    return false;
  }

  async addDiscardedItemFeedback(userId: number, didNotLike: string, toImprove: string, momsRecipe: string): Promise<string> {
    const thisMonthDiscardedItem = await this.viewThisMonthsDiscardedItems();
    const userFeedbackThisMonth = await this.checkUserFeedbackThisMonth(userId)
    if(userFeedbackThisMonth === true) throw new Error('User already gave feedback for this month, please wait for next month to give feedback again')
    await this.menuRepository.addDiscardedItemFeedback(userId, thisMonthDiscardedItem[0].itemId, didNotLike, toImprove, momsRecipe);
    return "Feedback added successfully!";
  }

  async checkUserFeedbackThisMonth(userId: number): Promise<boolean> {
    const feedbacks = await this.menuRepository.getDiscardedItemFeedback();
    if (!feedbacks.length) return false;
  
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
  
    for (const feedback of feedbacks) {
      const feedbackDate = new Date(feedback.date);
      const feedbackMonth = feedbackDate.getMonth() + 1;
      const feedbackYear = feedbackDate.getFullYear();
  
      if (feedbackMonth === currentMonth && feedbackYear === currentYear && feedback.userId === userId) {
        return true;
      }
    }
  
    return false;
  }

}
