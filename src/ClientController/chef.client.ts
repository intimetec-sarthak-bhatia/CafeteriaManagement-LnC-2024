import { ResponseInterface } from "../Interface/Response";
import PromptUtils from "../utils/PromptUtils";

class ChefClient {

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
        'View Top 5 Recommended Items', 'Rollout Menu', 'View Menu', 'Finalize Today\'s Menu', 'View Notifications'
      ],
      questions: {
        2: ['Enter Breakfast Option 1 : ', 'Enter Breakfast Option 2 : ', 'Enter Breakfast Option 3 : ',
            'Enter Lunch Option 1 : ', 'Enter Lunch Option 2 : ', 'Enter Lunch Option 3 : ',
            'Enter Dinner Option 1 : ', 'Enter Dinner Option 2 : ', 'Enter Dinner Option 3 '
        ],
      },
    };

    this.secondIterationOptions = {
      questions: {
        4: ['Enter Selected Item for breakfast: ', 'Enter Selected Items for lunch:', 'Enter Selected Items for dinner: ']
      }
    }
    this.noQuestionsOptions = [1, 3, 4, 5];
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

  async optionsHandler(selectedOption, isPreSelected? : boolean) {

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
    let answers: { [key: string]: string | string[] } = {};
    for (let i = 0; i < prompts.length; i++) {
      const question = prompts[i];
      let answer = await PromptUtils.promptMessage(question);
      if(selectedOption === 2 && Object.values(answers).some(array => array.includes(answer))) {
        console.log("[Warning] Item already Added, Please enter a different item !!");
        answer = await PromptUtils.promptMessage(question);
      }
      answers[`arg${i + 1}`] = answer;
    }

    if(isPreSelected) {
      return { selectedOption: selectedOption + 100, data: answers };
    }

    if(selectedOption === 2) {
      answers = this.joinRolloutOptions(answers);
    }

    return { selectedOption: selectedOption, data: answers };
  }

  joinRolloutOptions(rollOutItems) {
    const answers = {
      arg1: [],
      arg2: [],
      arg3: []
    };
    for(let i = 0,j=3,k=6;k<9; i++,j++,k++){
      answers.arg1.push(rollOutItems[`arg${i + 1}`]);
      answers.arg2.push(rollOutItems[`arg${j + 1}`]);
      answers.arg3.push(rollOutItems[`arg${k + 1}`]);
    }
    return answers;
  }
}

export default ChefClient;
