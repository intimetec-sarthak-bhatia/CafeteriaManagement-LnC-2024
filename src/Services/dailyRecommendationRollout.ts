import { DailyRecommendationRollout } from "../Interface/DailyRecommendationRollout";
import { DailyRecommendationRolloutRepository } from "../Repository/dailyRecommendationRollout";

export class DailyRecommendationRolloutService {
  private dailyRecommendationRolloutRepository =
    new DailyRecommendationRolloutRepository();

    async addDailyRecommendation(
        breakfastItems: string,
        lunchItems: string,
        dinnerItems: string
      ): Promise<string> {
        try {
          const itemSplits = [
            { items: breakfastItems.split(','), categoryId: 1 },
            { items: lunchItems.split(','), categoryId: 2 },
            { items: dinnerItems.split(','), categoryId: 3 },
          ];
      
          for (const { items, categoryId } of itemSplits) {
            for (const item_id of items) {
              const item: DailyRecommendationRollout = {
                item_id: parseInt(item_id.trim()),
                category_id: categoryId,
                date: new Date(),
              };
      
              await this.dailyRecommendationRolloutRepository.create(item);
            }
          }
      
          return 'Daily Recommendations added successfully!';
        } catch (error) {
          throw error;
        }
      }
}
