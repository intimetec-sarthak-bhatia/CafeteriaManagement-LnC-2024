import { MenuItemService } from "../Services/menuItem";
import { UserService } from "../Services/user";
import { MenuItem } from "../Interface/MenuItem";
import { DailyRecommendationRolloutService } from "../Services/dailyRecommendationRollout";

class ChefController {

    private menuItem: MenuItemService;
    private dailyRecommendation: DailyRecommendationRolloutService;

    constructor() {
        this.menuItem = new MenuItemService();
        this.dailyRecommendation = new DailyRecommendationRolloutService();
    }
    
    async handleRequest(payload) {
        const args = payload.answers;
        switch(payload.selectedOption) {
            case 1:
                return await this.viewTopMenuItems();
            case 2:
                return await this.rolloutDailyRecommendations(args.arg1, args.arg2, args.arg3);
            default:
                return 'Invalid option';
        }

    }


    private async viewTopMenuItems(): Promise<MenuItem[]> {
        const recommendedItems = await this.menuItem.getTopMenuItems();
        return recommendedItems;
    }

    private async rolloutDailyRecommendations(breakfastItems: string, lunch: string, dinner: string): Promise<string> {
        await this.dailyRecommendation.addDailyRecommendation(breakfastItems, lunch, dinner);
        return 'Daily Recommendations added successfully!';
    }

}

export default ChefController;

