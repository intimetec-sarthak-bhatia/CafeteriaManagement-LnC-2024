import { MenuItem } from "../Interface/MenuItem";
import { FeedBackRepository } from "../Repository/feedback";
import SentimentAnalyzer from "../utils/sentimentAnalyzer";
import { DailyRecommendationRolloutService } from "./dailyRecommendationRollout";
import { MenuItemService } from "./menuItem";

export class FeedbackService {
  private feedbackRepository = new FeedBackRepository();
  private menuItemService = new MenuItemService();
  private sentimentAnalyzer = new SentimentAnalyzer();
  private dailyRecommendationRolloutService = new DailyRecommendationRolloutService();

  
  async addFeedback(userId: number, itemId: number, rating: number, comment: string): Promise<string> {

    try {
      const isPresentInSelectedMenu = await this.isItemPresentInSelectedMenu(itemId);
      if(!isPresentInSelectedMenu) {
        throw new Error('[WARNING!]Entered item was not present in yesterday\'s menu');
      }
      const feedbackExists = await this.checkFeedbackExists(itemId, userId);
      if(feedbackExists) {
        throw new Error('[WARNING!]Feedback for this item already exists for this user!');
      }
      const date = new Date();
      const formattedDate = date.toISOString().split('T')[0]
      const result = await this.feedbackRepository.addFeedback(userId, itemId, rating, comment,formattedDate );
      if(result) {
        await this.updateSentimentScore(itemId, comment);
      }
      await this.updateSentimentScore(itemId, comment);
      return 'Feedback added successfully!';
    } catch (error) {
      throw error;
    }
  }

  async updateSentimentScore(itemId: number, comment: string): Promise<void> {
    try {
      const item: MenuItem = await this.menuItemService.getMenuItemById(itemId);
      const avgSentimentScore = item.sentimentScore;
      const feedbackSentimentScore = await this.sentimentAnalyzer.analyzeSentiment(comment);
      const updatedSentimentScore = !avgSentimentScore ? feedbackSentimentScore : (avgSentimentScore + feedbackSentimentScore) / 2;
      await this.menuItemService.updateSentimentScore(updatedSentimentScore, itemId);
    } catch (error) {
      throw error;
    }
  }

  async checkFeedbackExists(itemId: number, userId: number): Promise<boolean> {
    try {
      const result = await this.feedbackRepository.getByItemId(itemId);
      if(result.length) {
        const feedbackExists = result.find((feedback) => feedback.userId === userId);
        return feedbackExists ? true : false;
      }
      return false;
    } catch (error) {
      throw error;
    }
  }

  async isItemPresentInSelectedMenu(itemId: number): Promise<boolean> {
    try {
      const selectedMenu = await this.dailyRecommendationRolloutService.getSelectedMenuYesterdays();
      const itemExists = selectedMenu.find((item) => item.itemId === itemId);
      return itemExists ? true : false;
    } catch (error) {
      throw error;
    }
  }
}
