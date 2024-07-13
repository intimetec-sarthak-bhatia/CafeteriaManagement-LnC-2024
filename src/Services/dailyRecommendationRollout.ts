import { DailyRecommendationRollout } from "../Interface/DailyRecommendationRollout";
import { DailyRecommendationRolloutRepository } from "../Repository/dailyRecommendationRollout";
import { UserVotesRepository } from "../Repository/userVotes";
import { MealCategory } from "../Enums/mealCategory.enum";
import { NotificationService } from "./notification";

export class DailyRecommendationRolloutService {
  private dailyRecommendationRolloutRepository =
    new DailyRecommendationRolloutRepository();
  private userVotesRepository = new UserVotesRepository();
  private notficatonService = new NotificationService();

  async add(
    breakfastItems: number[],
    lunchItems: number[],
    dinnerItems: number[]
  ): Promise<string> {
    const todaysRecommendations = await this.getTodays();

    if (todaysRecommendations.length) {
      throw new Error("[ Warning !! ] Daily Recommendations already added for today!");
    }
    const itemSplits = [
      { items: breakfastItems, categoryId: 1 },
      { items: lunchItems, categoryId: 2 },
      { items: dinnerItems, categoryId: 3 },
    ];

    for (const { items, categoryId } of itemSplits) {
      for (const itemId of items) {
        const item: DailyRecommendationRollout = {
          itemId: itemId,
          categoryId: categoryId,
          date: new Date().toISOString().split("T")[0],
        };

        await this.dailyRecommendationRolloutRepository.create(item);
        await this.notficatonService.addNotification(
          `Today's Recommended Menu Has Been Rolled Out \n You can vote for the items !`,
          "employee"
        );
      }
    }

    return "Daily Recommendations added successfully!";
  }

  async getTodays(): Promise<any[]> {
    const date = new Date();
    const formattedDate = date.toISOString().split("T")[0];
    const result =
      await this.dailyRecommendationRolloutRepository.getDailyRecommendationRolloutByDate(
        formattedDate
      );
    return result;
  }

  async getSelectedMenuYesterdays(): Promise<any[]> {
    const yesterdayDate = new Date(new Date().setDate(new Date().getDate() - 1))
      .toISOString()
      .split("T")[0];
    return this.dailyRecommendationRolloutRepository.getSelectedMenuItems(
      yesterdayDate
    );
  }

  async voteMeal(
    userId: number,
    breakfastId: number,
    lunchId: number,
    dinnerId: number
  ) {
    try {
      const date = new Date().toISOString().split("T")[0];
      const rolledOutMenu =
        await this.dailyRecommendationRolloutRepository.getDailyRecommendationRolloutByDate(
          date
        );
      if(rolledOutMenu.length === 0) {
        throw new Error("[WARNING !] No menu items rolled out for today");
      }
      const itemIds = rolledOutMenu.map((item) => item.itemId);
      if (
        !itemIds.includes(breakfastId) ||
        !itemIds.includes(lunchId) ||
        !itemIds.includes(dinnerId)
      ) {
        throw new Error(
          "[WARNING !] Item provided doesn't exist in today's recommended rollout"
        );
      }
      this.checkItemCategory(rolledOutMenu, breakfastId, lunchId, dinnerId); 
      const userVotesToday = await this.userVotesRepository.getVotesByDate(
        userId,
        date
      );
      if (userVotesToday.length === 3) {
        throw new Error("[WARNING !] You have already voted menu for today");
      }
      
      const votedRollOutMenuIds: number[] = await this.incrementVoteCount(rolledOutMenu, breakfastId, lunchId, dinnerId);;
      
      const result = await this.userVotesRepository.addUserVote(
        userId,
        votedRollOutMenuIds,
        date
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  async finalizeMenu(
    breakfast: number,
    lunch: number[],
    dinner: number[]
  ): Promise<string> {
    const date = new Date().toISOString().split("T")[0];
    const selectedMenu =
      await this.dailyRecommendationRolloutRepository.getSelectedMenuItems(
        date
      );
    if (selectedMenu.length) {
      throw new Error("[ Warning !! ] Menu already finalized for today!");
    }
    // const lunchItems = lunch.split(",");
    // const dinnerItems = dinner.split(",");
    const itemsExistsInMenu = await this.checkItemsExistsInMenu([
      breakfast,
      ...lunch,
      ...dinner,
    ]);
    if (!itemsExistsInMenu) {
      throw new Error(
        "[ Warning !! ] Item provided doesn't exist in today's recommended rollout"
      );
    }
    await this.dailyRecommendationRolloutRepository.updateSelectedMenuItems(
      date,
      [breakfast, ...lunch, ...dinner]
    );
    await this.notficatonService.addNotification(
      `Today's Menu Has Been Finalized \n You can view the menu items !`,
      "employee"
    );
    return "Menu Finalized Successfully!";
  }

  async checkItemsExistsInMenu(itemIds: number[]): Promise<boolean> {
    const menuItems = await this.getTodays();
    const itemIdsInMenu = menuItems.map((item) => item.itemId);
    return itemIds.every((item) => itemIdsInMenu.includes(item));
  }

  async checkItemCategory(rolledOutMenu, breakfastId, lunchId, dinnerId) {
    rolledOutMenu.forEach(async (item) => {
      if (
        (item.itemId === breakfastId &&
          item.Category != MealCategory.Breakfast) ||
        (item.itemId === lunchId && item.Category != MealCategory.Lunch) ||
        (item.itemId === dinnerId && item.Category != MealCategory.Dinner)
      ) {
        throw new Error(
          `[WARNING !] Item Id ${item.itemId} belongs to ${item.Category} category`
        );
      }
    });

  }

  async incrementVoteCount(rolledOutMenu, breakfastId, lunchId, dinnerId) {
    const votedRollOutMenuIds: number[] = [];
    rolledOutMenu.forEach(async (item) => {
      if (
        item.itemId === breakfastId ||
        item.itemId === lunchId ||
        item.itemId === dinnerId
      ) {
        votedRollOutMenuIds.push(item.id);
        await this.dailyRecommendationRolloutRepository.incrementVoteCount(
          item.itemId
        );
      }
    });
    return votedRollOutMenuIds;
  }
}
