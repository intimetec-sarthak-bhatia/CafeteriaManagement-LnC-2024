import { DailyRecommendationRolloutService } from "../Services/dailyRecommendationRollout";
import { DiscardItemsService } from "../Services/discardItems";
import { FeedbackService } from "../Services/feedback";
import { MenuItemService } from "../Services/menuItem";
import { NotificationService } from "../Services/notification";
import { UserPreferenceService } from "../Services/userPreference";

class EmployeeController {

    private dailyRecommendationService: DailyRecommendationRolloutService;
    private feedbackService: FeedbackService;
    private notificationService: NotificationService;
    private discardItemService: DiscardItemsService;
    private userPreferenceService: UserPreferenceService;

    constructor() {
        this.dailyRecommendationService = new DailyRecommendationRolloutService();
        this.feedbackService = new FeedbackService();
        this.notificationService = new NotificationService();
        this.discardItemService = new DiscardItemsService();
        this.userPreferenceService = new UserPreferenceService();
    }
    
    async handleRequest(payload) {
        const args = payload.data;
        switch(payload.selectedOption) {
            case 1:
                return await this.viewTodaysRollout();
            case 2:
                return await this.viewYesterdayRollout();
            case 3:
                return await this.voteMeal(payload.user.id, args.arg1, args.arg2, args.arg3);
            case 4: 
                return await this.viewNotifications();
            case 5:
                return await this.viewDiscardedItems();
            case 6:
                return await this.getUserPreference(payload.user.id);
            case 7:
                return await this.addUserPreference(payload.user.id, args.arg1, args.arg2, args.arg3, args.arg4);
            case 8:
                return await this.updateUserPreference(payload.user.id, args.arg1, args.arg2, args.arg3, args.arg4);
            case 102:
                return await this.submitFeedback(payload.user.id,args.arg1, args.arg2, args.arg3);
            case 105: 
                return await this.submitDiscardedItemFeedback(payload.user.id, args.arg1, args.arg2, args.arg3);
            default:
                return 'Invalid option';
        }

    }


    private async viewTodaysRollout(): Promise<any> {
        const recommendedItems = await this.dailyRecommendationService.getTodays();
        if(!recommendedItems.length) {
            throw new Error('No recommendations added for today');
        }
        recommendedItems.map((item) => {
            delete item['votes'];
        });
        return {data: recommendedItems, dataType: 'table', event: 'viewRollout'};
    }

    private async viewYesterdayRollout(): Promise<any> {
        const selectedMenu = await this.dailyRecommendationService.getSelectedMenuYesterdays();
        return {data: selectedMenu, dataType: 'table', event: 'secondInteration'};
    }

    private async submitFeedback(userId: number, itemId: string, ratings: string, comments: string): Promise<any> {
        const result = await this.feedbackService.addFeedback(userId,parseInt(itemId), parseFloat(ratings), comments);
        return {data: result, dataType: 'message', event: 'feedbackSubmitted'};
    }

    private async voteMeal(userId: number, breakfastId: string, lunchId: string, dinnerId: string) {
        const result = await this.dailyRecommendationService.voteMeal(userId, parseInt(breakfastId), parseInt(lunchId), parseInt(dinnerId));
        return {data: result, dataType: 'message', event: 'mealVoted'};
    }

    private async viewNotifications() {
        const notifications = await this.notificationService.viewNotifications('employee');
        return {data: notifications, dataType: 'table', event: 'viewNotifications'};
    }

    private async viewDiscardedItems() {
        const discardedItems = await this.discardItemService.viewThisMonthsDiscardedItems();
        return {data: discardedItems, dataType: 'table', event: 'secondInteration'};
    }

    private async submitDiscardedItemFeedback(userId: number, didNotLike: string, toImprove: string, momsRecipe: string) {
        const result = await this.discardItemService.addDiscardedItemFeedback(userId, didNotLike, toImprove, momsRecipe);
        return {data: result, dataType: 'message', event: 'feedbackSubmitted'};
    }

    private async addUserPreference(userId: number, dietType, spiceLevel, preferredCuisine, sweetTooth) {
        const result = await this.userPreferenceService.add(userId, dietType, spiceLevel, preferredCuisine, sweetTooth);
        return {data: result, dataType: 'message', event: 'preferenceAdded'};
    }

    private async updateUserPreference(userId: number, dietType, spiceLevel, preferredCuisine, sweetTooth) {
        const result = await this.userPreferenceService.update(userId, dietType, spiceLevel, preferredCuisine, sweetTooth);
        return {data: result, dataType: 'message', event: 'preferenceUpdated'};
    }

    private async getUserPreference(userId: number) {
        const result = await this.userPreferenceService.get(userId);
        return {data: result, dataType: 'table', event: 'viewPreference'};
    }

}

export default EmployeeController;

