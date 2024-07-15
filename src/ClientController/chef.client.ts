import { NO_QUESTIONS_OPTIONS, NUM_TYPE_QUESTIONS, QUESTIONS, USER_OPTIONS } from "../Enums/userOptions.enum";
import { ResponseInterface } from "../Interface/Response";
import PromptUtils from "../utils/PromptUtils";

class ChefClient {
  private options: string[];
  private questions: { [key: number]: string[] };
  private noQuestionsOptions: number[];
  private numTypeQuestions: {[selectedOption: number] : number[]};

  constructor(role: string) {
    this.options = USER_OPTIONS[role];
    this.questions = QUESTIONS[role];
    this.noQuestionsOptions = NO_QUESTIONS_OPTIONS[role];
    this.numTypeQuestions = NUM_TYPE_QUESTIONS[role];
  }

  async requestHandler(event?: string, preSelectedOption?: number) {
    const selectedOption = preSelectedOption && event ? preSelectedOption : await this.showOptions();
    if (selectedOption === this.options.length) return { selectedOption, data: "logout" };
    const reqPayload = await this.optionsHandler(selectedOption, !!event);
    return reqPayload;
  }

  async responseHandler(response: ResponseInterface) {
    if (response.dataType === "table") {
      console.table(response.data);
    } else {
      console.log("\n", response.data, "\n");
    }
  }

  async showOptions() {
    console.log("Please select an option:");
    this.options.forEach((option, index) => {
      console.log(`${index + 1}. ${option}`);
    });

    const selectedOption = await PromptUtils.promptMessage("Enter your choice: ");
    const verifiedOption = await this.verifySelectedOption(selectedOption);
    return verifiedOption;
  }

  async optionsHandler(selectedOption, isPreSelected?: boolean) {
    if (this.noQuestionsOptions.includes(selectedOption) && !isPreSelected) {
      return { selectedOption: selectedOption, data: null };
    }

    const prompts = this.questions[selectedOption];
    const answers = await this.collectAnswers(prompts, selectedOption);

    return {
      selectedOption: isPreSelected ? selectedOption + 100 : selectedOption,
      data: selectedOption === 2 ? this.joinRolloutOptions(answers) : answers
    };
  }

  private async collectAnswers(prompts: string[], selectedOption: number): Promise<{ [key: string]: number | string}> {
    const answers: { [key: string]: number | string } = {};
    for (let i = 0; i < prompts.length; i++) {
      const question = prompts[i];
      const answer = await this.getValidAnswer(question, selectedOption, answers, i);
      answers[`arg${i + 1}`] = answer;
    }
    return answers;
  }

  private async getValidAnswer(question: string, selectedOption: number, answers: { [key: string]: number | string}, iteration: number): Promise<number | string> {
    let answer: string;

    while (true) {
      answer = await PromptUtils.promptMessage(question);
      if (this.numTypeQuestions[selectedOption]?.includes(iteration+1) && !(/^[0-9,.]*$/.test(answer))) {
        console.log('\n[Warning] Please enter a valid number\n');
        continue;
      }
      if (selectedOption === 2 && Object.values(answers).includes(parseInt(answer))) {
        console.log("\n[Warning] Item already added, please enter a different item\n");
        continue;
      }
      break;
    }

    return this.numTypeQuestions[selectedOption]?.includes(iteration+1) ? parseInt(answer): answer;
  }

  private joinRolloutOptions(rollOutItems: { [key: string]: number | string}): { [key: string]: (string | number)[] } {
    return {
      arg1: [rollOutItems.arg1, rollOutItems.arg2, rollOutItems.arg3],
      arg2: [rollOutItems.arg4, rollOutItems.arg5, rollOutItems.arg6],
      arg3: [rollOutItems.arg7, rollOutItems.arg8, rollOutItems.arg9]
    };
  }

  async verifySelectedOption(selectedOption: string) {
    if (isNaN(parseInt(selectedOption))) {
      console.log("\n[Warning] Please enter correct data type:number\n");
      return await this.showOptions();
    }
    if (parseInt(selectedOption) > this.options.length ||
        parseInt(selectedOption) < 1){
      console.log("\n[Warning] Please enter correct option\n");
      return await this.showOptions();
    }
    return parseInt(selectedOption);
  }
}

export default ChefClient;
