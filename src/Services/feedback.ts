import { FeedBackRepository } from "../Repository/feedback";
import SentimentAnalyzer from "../utils/sentimentAnalyzer";
import { MenuItemService } from "./menuItem";

export class FeedbackService {
  private feedbackRepository = new FeedBackRepository();
  private menuItemService = new MenuItemService();
  private sentimentAnalyzer = new SentimentAnalyzer();

  
  async addFeedback(user_id: number, itemId: number, rating: number, comment: string): Promise<string> {

    try {
      const checkFeedbackExists = await this.checkFeedbackExists(itemId, user_id);
      if(checkFeedbackExists) {
        throw new Error('[WARNING!]Feedback for this item already exists for this user!');
      }
      const date = new Date();
      const formattedDate = date.toISOString().split('T')[0]
      const result = await this.feedbackRepository.addFeedback(user_id, itemId, rating, comment,formattedDate );
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
      const item = await this.menuItemService.getMenuItemById(itemId);
      const avgSentimentScore = item.sentiment_score;
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
        const feedbackExists = result.find((feedback) => feedback.user_id === userId);
        return feedbackExists ? true : false;
      }
      return false;
    } catch (error) {
      throw error;
    }
  }
}
