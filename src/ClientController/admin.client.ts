import { ResponseInterface } from "../Interface/Response";
import PromptUtils from "../utils/PromptUtils";

class AdminClient {

  private singleIterationOptions: {
    options: string[];
    questions: {
      [key: number]: string[];
    };
  };
  private noQuestionsOptions: number[];

  constructor() {
    this.singleIterationOptions = {
      options: [
        "Add Employee",
        "Add Menu Item",
        "View Menu Items",
        "Update Menu Item Price",
        "Update Menu Item Availability",
      ],
      questions: {
        1: [
          "Enter Employee Name: ",
          "Enter Employee Email: ",
          "Enter Employee Password: ",
          "Enter Employee Role: ",
        ],
        2: [
          "Enter Menu Item Name: ",
          "Enter Menu Item Price: ",
          "Enter Menu Item MealType: ",
          "Enter Item Availability:",
        ],
        4: ["Enter Menu Item Name: ", "Enter New Price: "],
        5: ["Enter Menu Item Name: ", "Enter New Availability: "],
      },
    };
    this.noQuestionsOptions = [3];
  }

  async requestHandler(user)  {
      const selectedOption = await this.showOptions();
      const reqPayload = await this.optionsHandler(selectedOption);
      return reqPayload;
  }

  async responseHandler(response: ResponseInterface) {

    if(response.dataType === 'table') {
        console.table(response.data);
    }
    console.log(response.data);
  }

  async showOptions() {
    console.log("Please select an option: ");
    const options = this.singleIterationOptions.options;
    options.map((option: string, index: number) => {
      console.log(`${index + 1}. ${option}`);
    });
    const selectedOption = await PromptUtils.promptMessage("Enter your choice: ");
    return parseInt(selectedOption);
  }

  async optionsHandler(selectedOption) {
    if (this.noQuestionsOptions.includes(selectedOption)) {
      return { selectedOption: selectedOption, data: null };
    }

    const prompts = this.singleIterationOptions.questions[selectedOption];
    const answers: { [key: string]: string } = {};
    for (let i = 0; i < prompts.length; i++) {
      const question = prompts[i];
      const answer = await PromptUtils.promptMessage(question);
      answers[`arg${i + 1}`] = answer;
    }

    return { selectedOption: selectedOption, data: answers };
  }
}

export default AdminClient;
