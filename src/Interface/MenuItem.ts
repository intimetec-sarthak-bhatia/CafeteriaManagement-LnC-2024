export interface MenuItem {
    id?: number;
    name: string;
    mealType: number;
    price: number;
    last_prepared?: Date | null; 
    times_prepared?: number; 
    availability: number;
    sentiment_score?: number | null; 
    category?: string;
}
