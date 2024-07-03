import { MenuItemService } from "../Services/menuItem";
import { DailyRecommendationRolloutService } from "../Services/dailyRecommendationRollout";
import { NotificationService } from "../Services/notification";

class ChefController {

    private menuItemService: MenuItemService;
    private dailyRecommendationService: DailyRecommendationRolloutService;
    private notificationService: NotificationService;

    constructor() {
        this.menuItemService = new MenuItemService();
        this.dailyRecommendationService = new DailyRecommendationRolloutService();
        this.notificationService = new NotificationService();
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
            case 4:
                return await this.viewUserVotes();
            case 5:
                return await this.viewNotifications();
            case 104:
                return await this.finalizeMenu(args.arg1, args.arg2, args.arg3);
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

    private async viewUserVotes(): Promise<any> {
        const userVotes = await this.dailyRecommendationService.getTodays();
        if(userVotes.length === 0) throw new Error('No Recommendation Rollout For Today !');
        return {data: userVotes, dataType: 'table', event: 'secondInteration'};
    }

    private async finalizeMenu(breakfastItems: string, lunch: string, dinner: string): Promise<any> {
        const result = await this.dailyRecommendationService.finalizeMenu(breakfastItems, lunch, dinner);
        return {data: result, dataType: 'message', event: 'menuFinalized'};
    }

    private async viewNotifications() {
        const notifications = await this.notificationService.viewNotifications('Chef');
        return {data: notifications, dataType: 'table', event: 'viewNotifications'};
    }

}

export default ChefController;

