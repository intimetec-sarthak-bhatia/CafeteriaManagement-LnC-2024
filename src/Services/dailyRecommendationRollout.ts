import { DailyRecommendationRollout } from "../Interface/DailyRecommendationRollout";
import { DailyRecommendationRolloutRepository } from "../Repository/dailyRecommendationRollout";
import { UserVotesRepository } from "../Repository/userVotes";
import { NotificationService } from "./notification";
import { UserPreference } from "../Interface/UserPreference";
import { UserPreferenceRepository } from "../Repository/userPreference";
import { NotFoundError } from "../Exceptions/notFound-exception";
import { MealCategory } from "../Enums/mealCategory.enum";

export class DailyRecommendationRolloutService {
  private dailyRecommendationRolloutRepository =
    new DailyRecommendationRolloutRepository();
  private userVotesRepository = new UserVotesRepository();
  private notficatonService = new NotificationService();
  private userPreferenceRepository = new UserPreferenceRepository();

  async add(
    breakfastItems: number[],
    lunchItems: number[],
    dinnerItems: number[]
  ): Promise<string> {
    const todaysRecommendations = await this.getTodays();

    if (todaysRecommendations.length) {
      throw new Error(
        "[ Warning !! ] Daily Recommendations already added for today!"
      );
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
      }
    }
    await this.notficatonService.addNotification(
      `Today's Recommended Menu Has Been Rolled Out \n You can vote for the items !`,
      "employee"
    );

    return "Daily Recommendations added successfully!";
  }

  async getTodays(): Promise<any> {
    const date = new Date();
    const formattedDate = date.toISOString().split("T")[0];
    const result =
      await this.dailyRecommendationRolloutRepository.getDailyRecommendationRolloutByDate(
        formattedDate
      );

    return this.deleteUnwantedColumns(result);
  }

  async getTodaysByUser(userId: number): Promise<any> {
    const date = new Date();
    const formattedDate = date.toISOString().split("T")[0];
    const result =
      await this.dailyRecommendationRolloutRepository.getDailyRecommendationRolloutByDate(
        formattedDate
      );

    const userPreference =
      await this.userPreferenceRepository.getUserPreference(userId);
    if (!userPreference) {
      return this.deleteUnwantedColumns(result);
    }
    const sortedItemsByPreference = this.sortItemsByPreference(
      result,
      userPreference
    );

    return this.deleteUnwantedColumns(sortedItemsByPreference);
  }

  sortItemsByPreference(items, userPreference: UserPreference) {
    items.sort((menuItem1, menuItem2) => {
      const item1MatchesUserPreferences = this.isPreferenceFullMatch(
        menuItem1,
        userPreference
      );
      const item2MatchesUserPreferences = this.isPreferenceFullMatch(
        menuItem2,
        userPreference
      );

      if (item1MatchesUserPreferences && !item2MatchesUserPreferences) {
        return -1;
      }
      if (!item1MatchesUserPreferences && item2MatchesUserPreferences) {
        return 1;
      }

      const aPartialMatchScore = this.getPartialPreferenceMatchScore(
        menuItem1,
        userPreference
      );
      const bPartialMatchScore = this.getPartialPreferenceMatchScore(
        menuItem2,
        userPreference
      );

      if (aPartialMatchScore !== bPartialMatchScore) {
        return bPartialMatchScore - aPartialMatchScore;
      }

      return 0;
    });
    return items;
  }

  isPreferenceFullMatch(item: any, userPreference: UserPreference): boolean {
    const userDietType = userPreference.dietType;
    const userPreferredCuisine = userPreference.preferredCuisine;
    const userSpiceLevel = userPreference.spiceLevel;

    return (
      item.dietType === userDietType &&
      item.cuisine === userPreferredCuisine &&
      item.spiceLevel === userSpiceLevel
    );
  }

  getPartialPreferenceMatchScore(item, userPreference: UserPreference): number {
    const userDietType = userPreference.dietType.toLowerCase();
    const userPreferredCuisine = userPreference.preferredCuisine.toLowerCase();
    const userSpiceLevel = userPreference.spiceLevel;

    let score = 0;
    if (item.dietType.toLowerCase() === userDietType) score += 3;
    if (item.spiceLevel === userSpiceLevel) score += 2;
    if (item.cuisine.toLowerCase() === userPreferredCuisine) score += 1;
    return score;
  }

  async getSelectedMenuYesterdays(): Promise<any[]> {
    const yesterdayDate = new Date(new Date().setDate(new Date().getDate() - 1))
      .toISOString()
      .split("T")[0];
    const result =
      await this.dailyRecommendationRolloutRepository.getSelectedMenuItems(
        yesterdayDate
      );
    if (!result.length) {
      throw new NotFoundError("[WARNING !] No menu items rolled out for yesterday");
    }
    return result;
  }

  async deleteUnwantedColumns(items) {
    items.forEach((item) => {
      delete item.dietType;
      delete item.spiceLevel;
      delete item.cuisine;
    });
    return items;
  }

  async voteMeal(
    userId: number,
    breakfastId: number,
    lunchId: number,
    dinnerId: number
  ) {
    const date = new Date().toISOString().split("T")[0];
    const rolledOutMenu =
      await this.dailyRecommendationRolloutRepository.getDailyRecommendationRolloutByDate(
        date
      );
    if (!rolledOutMenu.length) {
      throw new NotFoundError("[WARNING !] No menu items rolled out for today");
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

    const votedRollOutMenuIds: number[] = await this.incrementVoteCount(
      rolledOutMenu,
      breakfastId,
      lunchId,
      dinnerId
    );

    const result = await this.userVotesRepository.addUserVote(
      userId,
      votedRollOutMenuIds,
      date
    );
    return result;
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
    const itemsExistsInMenu = await this.checkItemsExistsInMenu([
      breakfast,
      ...lunch,
      ...dinner,
    ]);
    if (!itemsExistsInMenu) {
      throw new NotFoundError(
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
