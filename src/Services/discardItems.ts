import { MenuItem } from "../Interface/MenuItem";
import { NotificationService } from "./notification";
import { DiscardedItemsFeedbackRepository } from "../Repository/discardedItemsFeedback";
import { MenuItemService } from "./menuItem";
import { DiscardItemRepository } from "../Repository/discardItem";
import { NotFoundError } from "../Exceptions/notFound-exception";

export class DiscardItemsService {
  private discardedItemsFeedbackRepository = new DiscardedItemsFeedbackRepository();
  private discardedItemsRepository = new DiscardItemRepository();
  private NotificationService = new NotificationService();
  private menuItemService = new MenuItemService();

  async getSuggestedDiscardItems(): Promise<MenuItem[]> {
    if(await this.checkIfItemDiscardedThisMonth()){
      throw new Error('[Warning] Item already discarded this month, please wait for next month to discard again');
    }
    const items = await this.discardedItemsRepository.suggestDiscardedItems();
    if(!items.length) throw new NotFoundError('No suggestions for discard items found !');
    return items;
  }

  async addDiscardItem(itemId: number): Promise<string> {
      await this.discardedItemsRepository.addDiscardedItem(itemId);
      await this.menuItemService.updateAvailability(0, itemId);
      await this.NotificationService.addNotification(`Item with id: ${itemId} added to discard list, please give your valuable feedback for it`, 'Employee');
      return 'Item added to discard list successfully!';
  }

  async viewAllDiscardedItems(): Promise<any> {
    const discardItems = await this.discardedItemsRepository.viewAllDiscardedItems();
    return discardItems;
  }

  async viewThisMonthsDiscardedItems(): Promise<any> {
    const discardItems = await this.discardedItemsRepository.viewThisMonthsDiscardedItems();
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
    await this.discardedItemsFeedbackRepository.addDiscardedItemFeedback(userId, thisMonthDiscardedItem[0].itemId, didNotLike, toImprove, momsRecipe);
    return "Feedback added successfully!";
  }

  async checkUserFeedbackThisMonth(userId: number): Promise<boolean> {
    const feedbacks = await this.discardedItemsFeedbackRepository.getDiscardedItemFeedback();
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
