import { DailyRecommendationRollout } from "../Interface/DailyRecommendationRollout";
import { DailyRecommendationRolloutRepository } from "../Repository/dailyRecommendationRollout";
import { UserVotesRepository } from "../Repository/userVotes";
import { NotificationService } from "./notification";

export class DailyRecommendationRolloutService {
  private dailyRecommendationRolloutRepository = new DailyRecommendationRolloutRepository();
  private userVotesRepository = new UserVotesRepository();
  private notficatonService = new NotificationService();

    async add(
        breakfastItems: string[],
        lunchItems: string[],
        dinnerItems: string[]
      ): Promise<string> {
          const todaysRecommendations = await this.getTodays();

          if(todaysRecommendations.length) {
            return '[ Warning !! ] Daily Recommendations already added for today!';
          }
          const itemSplits = [
            { items: breakfastItems, categoryId: 1 },
            { items: lunchItems, categoryId: 2 },
            { items: dinnerItems, categoryId: 3 },
          ];
      
          for (const { items, categoryId } of itemSplits) {
            for (const item_id of items) {
              const item: DailyRecommendationRollout = {
                item_id: parseInt(item_id.trim()),
                category_id: categoryId,
                date: new Date().toISOString().split('T')[0],
              };
      
              await this.dailyRecommendationRolloutRepository.create(item);
              await this.notficatonService.addNotification(`Today's Recommended Menu Has Been Rolled Out \n You can vote for the items !`, 'employee')
            }
          }
      
          return 'Daily Recommendations added successfully!';
      }

    async getTodays(): Promise<any[]> {
        const date = new Date();
        const formattedDate = date.toISOString().split('T')[0];
        const result =  await this.dailyRecommendationRolloutRepository.getDailyRecommendationRolloutByDate(formattedDate);
        return result;
    }

    async getSelectedMenuYesterdays(): Promise<any[]> {
        const yesterdayDate = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]
        return this.dailyRecommendationRolloutRepository.getSelectedMenuItems(yesterdayDate);
    }

    async voteMeal(userID: number, breakfastId: number, lunchId: number, dinnerId: number) {
        try {
          const date = new Date().toISOString().split('T')[0];
        const rolledOutMenu = await this.dailyRecommendationRolloutRepository.getDailyRecommendationRolloutByDate(date);
        const itemIds = rolledOutMenu.map((item) => item.item_id);
        if(!itemIds.includes(breakfastId) || !itemIds.includes(lunchId) || !itemIds.includes(dinnerId)) {
            throw new Error('[WARNING !] Item provided doesn\'t exist in today\'s recommended rollout');
        }
        rolledOutMenu.forEach(async (item) => {
            if((item.item_id === breakfastId && item.Category != 'breakfast' ) || (item.item_id === lunchId && item.Category != 'lunch' ) || (item.item_id === dinnerId && item.Category != 'dinner' )) {
                throw new Error(`[WARNING !] Item Id ${item.item_id} belongs to ${item.Category} category`);
            }
        });
        const userVotesToday = await this.userVotesRepository.getVotesByDate(userID, date);
        if(userVotesToday.length === 3){
            throw new Error('[WARNING !] You have already voted menu for today');
        }
        const votedRollOutMenu: number[] = [];
        rolledOutMenu.forEach(async (item) => {
          if(item.item_id === breakfastId || item.item_id === lunchId || item.item_id === dinnerId) {
            votedRollOutMenu.push(item.id);
            await this.dailyRecommendationRolloutRepository.incrementVoteCount(item.item_id);

          }
        });
        const result = await this.userVotesRepository.addUserVote(userID, votedRollOutMenu, date);
        return result;
        } catch (error) {
          throw error;
        }
        

    }

    async finalizeMenu(breakfast: string, lunch: string, dinner: string): Promise<string> {
        const date = new Date().toISOString().split('T')[0];
        const selectedMenu = await this.dailyRecommendationRolloutRepository.getSelectedMenuItems(date);
        if(selectedMenu.length) {
          throw new Error('[ Warning !! ] Menu already finalized for today!');
        }
        const lunchItems = lunch.split(',');
        const dinnerItems = dinner.split(',');
        const itemsExistsInMenu = await this.checkItemsExistsInMenu([breakfast, ...lunchItems, ...dinnerItems]);
        if(!itemsExistsInMenu) {
          throw new Error('[ Warning !! ] Item provided doesn\'t exist in today\'s recommended rollout');
        }
        const itemIds = [parseInt(breakfast), ...lunchItems.map(item => parseInt(item)), ...dinnerItems.map(item => parseInt(item))];
        await this.dailyRecommendationRolloutRepository.updateSelectedMenuItems(date, itemIds);
        await this.notficatonService.addNotification(`Today's Menu Has Been Finalized \n You can view the menu items !`, 'employee');
        return 'Menu Finalized Successfully!';
    }

    async checkItemsExistsInMenu(itemIds: string[]): Promise<boolean> {
        const menuItems = await this.getTodays();
        const itemIdsInMenu = menuItems.map(item => item.item_id);
        return itemIds.every(item => itemIdsInMenu.includes(parseInt(item)));
    }


}
