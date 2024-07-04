export interface MenuItem {
    id?: number;
    name: string;
    mealType: number;
    price: number;
    lastPrepared?: Date | null; 
    timesPrepared?: number; 
    availability: number;
    sentimentScore?: number | null; 
    category?: string;
}
