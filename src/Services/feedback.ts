import { FeedBackRepository } from "../Repository/feedback";

export class FeedbackService {
  private feedbackService = new FeedBackRepository();

  async getByItemId(itemId: number): Promise<string> {
    try {
      const result = await this.feedbackService.getByItemId(itemId);
      return result;
    } catch (error) {
      throw error;
    }
  }
}
