import { DailyRecommendationRolloutService } from "../Services/dailyRecommendationRollout";
import { FeedbackService } from "../Services/feedback";
import { NotificationService } from "../Services/notification";

class EmployeeController {

    private dailyRecommendationService: DailyRecommendationRolloutService;
    private feedbackService: FeedbackService;
    private notificationService: NotificationService;

    constructor() {
        this.dailyRecommendationService = new DailyRecommendationRolloutService();
        this.feedbackService = new FeedbackService();
        this.notificationService = new NotificationService();
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
            case 102:
                return await this.submitFeedback(payload.user.id,args.arg1, args.arg2, args.arg3);
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

}

export default EmployeeController;

