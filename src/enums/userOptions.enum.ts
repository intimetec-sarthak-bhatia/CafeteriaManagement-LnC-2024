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
    "View Top 5 Recommended Items",
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
    "Logout"
  ]
};

export const QUESTIONS = {
  [UserRole.Admin]: {
    1: ["Enter Employee Name: ", "Enter Employee Email: ", "Enter Employee Password: ", "Enter Employee Role: "],
    2: ["Enter Menu Item Name: ", "Enter Menu Item Price: ", "Enter Menu Item MealType: ", "Enter Item Availability: "],
    4: ["Enter Menu Item Name: ", "Enter New Price: "],
    5: ["Enter Menu Item Name: ", "Enter New Availability: "]
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
    5: ["What you did not like about the item: ", "How would you like the food to be improved: ", "Share your mom's recipe: "]
  }
};

export const NO_QUESTIONS_OPTIONS = {
  [UserRole.Admin]: [3, 6],
  [UserRole.Chef]: [1, 3, 4, 5, 7],
  [UserRole.Employee]: [1, 2, 4, 5]
};