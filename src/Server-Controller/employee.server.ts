import { DailyRecommendationRolloutService } from "../Services/dailyRecommendationRollout";
import { FeedbackService } from "../Services/feedback";

class EmployeeController {

    private dailyRecommendation: DailyRecommendationRolloutService;
    private feedback: FeedbackService;

    constructor() {
        this.dailyRecommendation = new DailyRecommendationRolloutService();
        this.feedback = new FeedbackService();
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
            case 102:
                return await this.submitFeedback(payload.user.id,args.arg1, args.arg2, args.arg3);
            default:
                return 'Invalid option';
        }

    }


    private async viewTodaysRollout(): Promise<any> {
        const recommendedItems = await this.dailyRecommendation.getTodays();
        if(!recommendedItems.length) {
            throw new Error('No recommendations added for today');
        }
        return {data: recommendedItems, dataType: 'table', event: 'viewRollout'};
    }

    private async viewYesterdayRollout(): Promise<any> {
        const selectedMenu = await this.dailyRecommendation.getSelectedMenuYesterdays();
        return {data: selectedMenu, dataType: 'table', event: 'secondInteration'};
    }

    private async submitFeedback(user_id: number, item_id: string, ratings: string, comments: string): Promise<any> {
        const result = await this.feedback.addFeedback(user_id,parseInt(item_id), parseFloat(ratings), comments);
        return {data: result, dataType: 'message', event: 'feedbackSubmitted'};
    }

    private async voteMeal(user_id, breakfastId: string, lunchId: string, dinnerId: string) {
        const result = await this.dailyRecommendation.voteMeal(user_id, parseInt(breakfastId), parseInt(lunchId), parseInt(dinnerId));
        return {data: result, dataType: 'message', event: 'mealVoted'};
    }

}

export default EmployeeController;

