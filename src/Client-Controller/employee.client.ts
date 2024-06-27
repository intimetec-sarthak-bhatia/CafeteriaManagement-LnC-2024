import { ResponseInterface } from "../Interface/response";
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
        'View Rolled Out Menu', 'Give Feedback', 'Vote for meals'
      ],
      questions: {
        3: ['Enter item id for breakfast: ', 'Enter item id for lunch: ', 'Enter item id for dinner: '],
      },
    };
    this.noQuestionsOptions = [1,2];

    this.secondIterationOptions = {
      questions: {
        2: ['Enter Item id to give feedback: ', 'Enter ratings:', 'Enter comments: ']
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

}

export default EmployeeClient;
