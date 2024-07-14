import { DietType, SpiceLevel } from "../Enums/userPreference.enum";
import { UserPreference } from "../Interface/UserPreference";
import { UserPreferenceRepository } from "../Repository/userPreference";

export class UserPreferenceService {
  private userPreferenceRepository: UserPreferenceRepository;

  constructor() {
    this.userPreferenceRepository = new UserPreferenceRepository();
  }

  public async get(userId: number): Promise<UserPreference> {
    const userPreference =
      await this.userPreferenceRepository.getUserPreference(userId);
    if (!userPreference) {
      throw new Error("[Warning] User preference not found for the user");
    }
    return userPreference;
  }

  public async update(
    userId: number,
    dietType: number,
    spiceLevel: number,
    preferredCuisine: string,
    sweetTooth: number
  ): Promise<string> {
    const getUserPreference = await this.userPreferenceRepository.getUserPreference(userId);
    if (!getUserPreference) {
      throw new Error("[Warning] User preference not found for the user");
    }
    this.validateInputs(dietType, spiceLevel);  

    const userPreference = this.mapUserPreference(
      dietType,
      spiceLevel,
      preferredCuisine,
      sweetTooth
    );
    await this.userPreferenceRepository.updateUserPreference({
      userId,
      ...userPreference,
    });
    return "User preference updated successfully";
  }

  public async add(
    userId: number,
    dietType: number,
    spiceLevel: number,
    preferredCuisine: string,
    sweetTooth: number
  ) {
    const getUserPreference =
      await this.userPreferenceRepository.getUserPreference(userId);
    if (getUserPreference) {
      throw new Error("[Warning] User preference already exists for the user");
    }
    this.validateInputs(dietType, spiceLevel);
    const userPreference = this.mapUserPreference(
      dietType,
      spiceLevel,
      preferredCuisine,
      sweetTooth
    );
    await this.userPreferenceRepository.addUserPreference({
      userId,
      ...userPreference,
    });
    return "User preference added successfully !!";
  }


  private validateInputs(dietType: number, spiceLevel: number): void {
    if (![1, 2, 3].includes(dietType)) {
      throw new Error('Invalid diet type: 1 for Vegetarian, 2 for Non-Vegetarian, 3 for Eggetarian');
    }
    if (![1, 2, 3].includes(spiceLevel)) {
      throw new Error('Invalid spice level: 1 for Low, 2 for Medium, 3 for High');
    }
  }

  private mapUserPreference(dietType: number, spiceLevel: number, preferredCuisine: string, sweetTooth: number): UserPreference {
    const dietTypeEnum = {
        1: DietType.Veg,
        2: DietType.NonVeg,
        3: DietType.Egg,
      };
    
      const spiceLevelEnum = {
        1: SpiceLevel.Low,
        2: SpiceLevel.Medium,
        3: SpiceLevel.High,
      };
    
      return {
        dietType: dietTypeEnum[dietType],
        spiceLevel: spiceLevelEnum[spiceLevel],
        preferredCuisine,
        sweetTooth: sweetTooth === 1,
      };
  }
}
