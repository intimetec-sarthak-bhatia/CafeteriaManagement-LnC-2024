import { ResponseInterface } from "../Interface/Response";
import PromptUtils from "../utils/PromptUtils";

class EmployeeClient {

  private singleIterationOptions: {
    options: string[];
    questions: {
      [key: number]: string[];
    };
  };
  private noQuestionsOptions: number[];
  private secondIterationOptions: {questions: {[key: number]: string[]}};

  constructor() {
    this.singleIterationOptions = {
      options: [
        'View Rolled Out Menu', 'Give Feedback', 'Vote for meals', 'View Notifications', 'Give feedback for discarded items'
      ],
      questions: {
        3: ['Enter item id for breakfast: ', 'Enter item id for lunch: ', 'Enter item id for dinner: ']
      },
    };
    this.noQuestionsOptions = [1,2, 4,5];

    this.secondIterationOptions = {
      questions: {
        2: ['Enter Item id to give feedback: ', 'Enter ratings:', 'Enter comments: '],
        5: ['What you did not like about the item: ', 'How would you like the food to be improved:', 'Share your moms recipe: '],
      }
    }
  }



  async requestHandler(user, event?: string, preSelectedOption?: number)  {
      if(preSelectedOption && event) {
        return await this.optionsHandler(preSelectedOption, true);
      }
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
    await this.verifySelectedOption(selectedOption, options);
    return parseInt(selectedOption);
  }

  async optionsHandler(selectedOption, isPreSelected?: boolean) {

    if(!isPreSelected && this.secondIterationOptions.questions.hasOwnProperty(selectedOption)) {
      return { selectedOption: selectedOption, data: null };
    }

    if (this.noQuestionsOptions.includes(selectedOption) && !isPreSelected) {
      return { selectedOption: selectedOption, data: null };
    }

    let prompts = this.singleIterationOptions.questions[selectedOption];
    if(isPreSelected) {
      prompts = this.secondIterationOptions.questions[selectedOption];
    }
    let answers: { [key: string]: string} = {};
    for (let i = 0; i < prompts.length; i++) {
      const question = prompts[i];
      let answer = await PromptUtils.promptMessage(question);
      answers[`arg${i + 1}`] = answer;
    }

    if(isPreSelected) {
      return { selectedOption: selectedOption + 100, data: answers };
    }

    return { selectedOption: selectedOption, data: answers };
  }

  async verifySelectedOption(selectedOption: string, options: string[]) {
    if (isNaN(parseInt(selectedOption)) || parseInt(selectedOption) < 1){
      console.log("\n[Warning] Please enter correct data type:number\n");
      await this.showOptions();
      return;
    }
    if (parseInt(selectedOption) > options.length) {
      console.log("\n[Warning] Please enter correct option\n");
      await this.showOptions();
      return;
    }
  }

}

export default EmployeeClient;
