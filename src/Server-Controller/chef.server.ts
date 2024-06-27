import { MenuItemService } from "../Services/menuItem";
import { DailyRecommendationRolloutService } from "../Services/dailyRecommendationRollout";

class ChefController {

    private menuItemService: MenuItemService;
    private dailyRecommendationService: DailyRecommendationRolloutService;

    constructor() {
        this.menuItemService = new MenuItemService();
        this.dailyRecommendationService = new DailyRecommendationRolloutService();
    }
    
    async handleRequest(payload) {
        const args = payload.data;
        switch(payload.selectedOption) {
            case 1:
                return await this.viewTopMenuItems();
            case 2:
                return await this.rolloutDailyRecommendations(args.arg1, args.arg2, args.arg3);
            case 3: 
                return await this.viewAllMenuItems();
            default:
                return 'Invalid option';
        }

    }


    private async viewTopMenuItems(): Promise<any> {
        const recommendedItems = await this.menuItemService.getTopMenuItems();
        return {data: recommendedItems, dataType: 'table', event: 'viewTopMenuItems'};
    }

    private async rolloutDailyRecommendations(breakfastItems: string[], lunch: string[], dinner: string[]): Promise<any> {
        const result = await this.dailyRecommendationService.add(breakfastItems, lunch, dinner);
        return {data: result, dataType: 'message', event: 'rolloutDailyRecommendations'};
    }

    private async viewAllMenuItems(): Promise<any> {
        const menuItems = await this.menuItemService.getAll();
        return {data: menuItems, dataType: 'table', event: 'viewMenuItems'};
    }

}

export default ChefController;

