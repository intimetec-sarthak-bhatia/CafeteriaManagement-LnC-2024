import { MenuItemRepository } from "../Repository/menuItem";
import { MenuItem } from "../entity/MenuItem";

export class MenuItemService {
  private menuRepository = new MenuItemRepository();

  async addMenuItem(
    name: string,
    mealType: number,
    price: number,
    availability: number,
  ): Promise<string> {
    const item: MenuItem = {
      name,
      mealType,
      price,
      availability,
    };
    await this.menuRepository.createMenuItem(item);
    return 'Item added successfully!';
  }

  async getAll(): Promise<MenuItem[]> {
   const result = await this.menuRepository.getAllMenuItems();
   return result;
  }

    // async getByMealType(mealType: string): Promise<MenuItem[]> {

    //     const result = await this.menuRepository.findByMealType(mealType);
    //     return result;
    // }

  async updatePrice(price: number, name: string): Promise<string> {
    try {
        await this.menuRepository.updatePrice(price, name);
        return 'Price updated successfully!';
        
    } catch (error) {
        throw error;
    }
  }

  async updateAvailability(availability: number, name: string): Promise<string> {
    try {
        await this.menuRepository.updateAvailability(availability, name);
        return 'Availability updated successfully!';
    } catch (error) {
        throw error;
    }
  }



}

