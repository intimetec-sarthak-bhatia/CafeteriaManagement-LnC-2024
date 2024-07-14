import { DietType, SpiceLevel } from "../Enums/userPreference.enum";

export interface UserPreference {
    id?: number;
    userId?: number;
    dietType: DietType;
    spiceLevel: SpiceLevel;
    preferredCuisine: string;
    sweetTooth: boolean;
}