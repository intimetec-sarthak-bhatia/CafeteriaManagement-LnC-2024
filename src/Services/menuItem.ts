import { MealTypeRepository } from "../Repository/mealType";
import { MenuItemRepository } from "../Repository/menuItem";
import { MenuItem } from "../Interface/MenuItem";

export class MenuItemService {
  private menuRepository = new MenuItemRepository();
  private mealTypeRepository = new MealTypeRepository();

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
  

  async getTopMenuItems(amount: number = 5): Promise<any> {
    const menuItems = await this.menuRepository.getTopMenuItems(amount);
    const groupedItems = {
      breakfast: [],
      'lunch/dinner': []
    };

    for (const item of menuItems) {
      const mealType = await this.mealTypeRepository.getMealTypeById(item.mealType);
      
      if (mealType === 'breakfast') {
        groupedItems.breakfast.push(item);
      } else {
        groupedItems['lunch/dinner'].push(item);
      }
    }

    return groupedItems;
  }


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

