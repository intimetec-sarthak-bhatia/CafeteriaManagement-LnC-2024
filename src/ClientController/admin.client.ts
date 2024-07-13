import { ResponseInterface } from "../Interface/Response";
import PromptUtils from "../utils/PromptUtils";

class AdminClient {
  private options: string[];
  private questions: { [key: number]: string[] };
  private noQuestionsOptions: number[];


  constructor() {
    this.options = [
      "Add Employee",
      "Add Menu Item",
      "View Menu Items",
      "Update Menu Item Price",
      "Update Menu Item Availability",
      "Logout"
    ];

    this.questions = {
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
        "Enter Item Availability: ",
      ],
      4: ["Enter Menu Item Name: ", "Enter New Price: "],
      5: ["Enter Menu Item Name: ", "Enter New Availability: "],
    };

    this.noQuestionsOptions = [3, 6];
  }

  async requestHandler() {
    const selectedOption = await this.showOptions();
    if(selectedOption === 6) return {selectedOption: selectedOption, data: 'logout'};
    const reqPayload = await this.optionsHandler(selectedOption);
    return reqPayload;
  }

  async responseHandler(response: ResponseInterface) {
    if (response.dataType === "table") {
      console.table(response.data);
    } else {
      console.log("\n", response.data, "\n");
    }
  }


  private async showOptions(): Promise<number> {
    console.log("Please select an option:");
    this.options.forEach((option, index) => {
      console.log(`${index + 1}. ${option}`);
    });

    const selectedOption = await PromptUtils.promptMessage("Enter your choice: ");
    await this.verifySelectedOption(selectedOption);
    return parseInt(selectedOption);
  }

  async optionsHandler(selectedOption) {
    if (this.noQuestionsOptions.includes(selectedOption)) {
      return { selectedOption: selectedOption, data: null };
    }
    const prompts = this.questions[selectedOption];
    const answers = await this.collectAnswers(prompts);
    return { selectedOption: selectedOption, data: answers };
  }

  private async collectAnswers(prompts: string[]): Promise<{ [key: string]: string }> {
    const answers: { [key: string]: string } = {};
    for (let i = 0; i < prompts.length; i++) {
      const question = prompts[i];
      const answer = await PromptUtils.promptMessage(question);
      answers[`arg${i + 1}`] = answer;
    }
    return answers;
  }

  async verifySelectedOption(selectedOption: string) {
    if (isNaN(parseInt(selectedOption)) || parseInt(selectedOption) < 1) {
      console.log("\n[Warning] Please enter correct data type:number\n");
      await this.showOptions();
      return;
    }
    if (parseInt(selectedOption) > this.options.length) {
      console.log("\n[Warning] Please enter correct option\n");
      await this.showOptions();
      return;
    }
  }
}

export default AdminClient;
