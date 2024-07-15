import { UserRole } from "./userRoles.enum";

export const USER_OPTIONS = {
  [UserRole.Admin]: [
    "Add Employee",
    "Add Menu Item",
    "View Menu Items",
    "Update Menu Item Price",
    "Update Menu Item Availability",
    "Logout"
  ],
  [UserRole.Chef]: [
    "View Top 10 Recommended Items",
    "Rollout Menu",
    "View Menu",
    "Finalize Today's Menu",
    "View Notifications",
    "View Discard Menu Item List",
    "Logout"
  ],
  [UserRole.Employee]: [
    "View Rolled Out Menu",
    "Give Feedback",
    "Vote for meals",
    "View Notifications",
    "Give feedback for discarded items",
    "View User Preferences",
    "Add User Preferences",
    "Update User Preferences",
    "Logout"
  ]
};

export const QUESTIONS = {
  [UserRole.Admin]: {
    1: ["Enter Employee Name: ", "Enter Employee Email: ", "Enter Employee Password: ", "Enter Employee Role: "],
    2: ["Enter Menu Item Name: ", "Enter Menu Item Price: ", "Enter Menu Item MealType: ", "Enter Item Availability (0/1): "],
    4: ["Enter Menu Item Name: ", "Enter New Price: "],
    5: ["Enter Menu Item Name: ", "Enter New Availability(0/1): "]
  },
  [UserRole.Chef]: {
    2: [
      "Enter Breakfast Option 1: ", "Enter Breakfast Option 2: ", "Enter Breakfast Option 3: ",
      "Enter Lunch Option 1: ", "Enter Lunch Option 2: ", "Enter Lunch Option 3: ",
      "Enter Dinner Option 1: ", "Enter Dinner Option 2: ", "Enter Dinner Option 3: "
    ],
    4: ["Enter Selected Item for breakfast: ", "Enter Selected Items for lunch: ", "Enter Selected Items for dinner: "],
    6: ["Enter Item Id to be discarded from Menu List: "]
  },
  [UserRole.Employee]: {
    3: ["Enter item id for breakfast: ", "Enter item id for lunch: ", "Enter item id for dinner: "],
    2: ["Enter Item id to give feedback: ", "Enter ratings: ", "Enter comments: "],
    5: ["What you did not like about the item: ", "How would you like the food to be improved: ", "Share your mom's recipe: "],
    7: ["Enter your diet type (1: Vegetarian, 2: Non-Vegetarian, 3: Eggetarian): ", "Enter your spice level(1:Low , 2: Medium, 3: High):", "Enter your cuisine preference eg.(North-Indian, South-Indian, Mexican, etc.): ",
      "Are you a sweet tooth person? (1: Yes, 2: No): "],
    8: ["Enter your diet type (1: Vegetarian, 2: Non-Vegetarian, 3: Eggetarian): ", "Enter your spice level(1:Low , 2: Medium, 3: High):", "Enter your cuisine preference eg.(North-Indian, South-Indian, Mexican, etc.): ",
      "Are you a sweet tooth person? (1: Yes, 2: No): "]
  }
};

export const NO_QUESTIONS_OPTIONS = {
  [UserRole.Admin]: [3, 6],
  [UserRole.Chef]: [1, 3, 4, 5, 6, 7],
  [UserRole.Employee]: [1, 2, 4, 5, 6]
};

export const NUM_TYPE_QUESTIONS = {
  [UserRole.Admin]: {
    1: [4],
    2: [2,3,4],
    4: [2],
    5: [2]
  },
  [UserRole.Chef]: {
    2: [1,2,3,4,5,6,7,8,9],
    4: [1,2,3],
    6: [1]
  },
  [UserRole.Employee]: {
    3: [1,2,3],
    2: [1,2],
    7: [1,2,4],
    8: [1,2,4]
  }
};

