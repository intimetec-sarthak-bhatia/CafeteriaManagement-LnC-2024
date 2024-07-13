import { NO_QUESTIONS_OPTIONS, QUESTIONS, USER_OPTIONS } from "../Enums/userOptions.enum";
import { ResponseInterface } from "../Interface/Response";
import PromptUtils from "../utils/PromptUtils";

class ChefClient {
  private options: string[];
  private questions: { [key: number]: string[] };
  private noQuestionsOptions: number[];

  constructor(role: string) {
    this.options = USER_OPTIONS[role];
    this.questions = QUESTIONS[role];
    this.noQuestionsOptions = NO_QUESTIONS_OPTIONS[role];
  }

  async requestHandler(event?: string, preSelectedOption?: number) {
    const selectedOption =
      preSelectedOption && event ? preSelectedOption : await this.showOptions();
    if (selectedOption === 7)
      return { selectedOption: selectedOption, data: "logout" };
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

  async showOptions() {
    console.log("Please select an option:");
    this.options.forEach((option, index) => {
      console.log(`${index + 1}. ${option}`);
    });
    const selectedOption = await PromptUtils.promptMessage(
      "Enter your choice: "
    );
    await this.verifySelectedOption(selectedOption, this.options);
    return parseInt(selectedOption);
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

  private async collectAnswers(prompts: string[], selectedOption: number): Promise<{ [key: string]: number}> {
    const answers: { [key: string]: number } = {};
    for (let i = 0; i < prompts.length; i++) {
      const question = prompts[i];
      const answer = await this.getValidAnswer(question, selectedOption, answers);
      answers[`arg${i + 1}`] = answer;
    }
    return answers;
  }

  private async getValidAnswer(question: string, selectedOption: number, answers: { [key: string]: number}): Promise<number> {
    let answer: string;

    while (true) {
      answer = await PromptUtils.promptMessage(question);
      if (!(/^\d+$/.test(answer))) {
        console.log('\n[Warning] Please enter a valid number\n');
        continue;
      }
      if (selectedOption === 2 && Object.values(answers).includes(parseInt(answer))) {
        console.log("\n[Warning] Item already added, please enter a different item\n");
        continue;
      }
      break;
    }

    return parseInt(answer);
  }

  private joinRolloutOptions(rollOutItems: { [key: string]: number}): { [key: string]: number[] } {
    return {
      arg1: [rollOutItems.arg1, rollOutItems.arg2, rollOutItems.arg3],
      arg2: [rollOutItems.arg4, rollOutItems.arg5, rollOutItems.arg6],
      arg3: [rollOutItems.arg7, rollOutItems.arg8, rollOutItems.arg9]
    };
  }

  async verifySelectedOption(selectedOption: string, options?: string[]) {
    if (isNaN(parseInt(selectedOption))) {
      console.log("\n[Warning] Please enter correct data type:number\n");
      await this.showOptions();
      return;
    }
    if (
      options &&
      (parseInt(selectedOption) > options.length ||
        parseInt(selectedOption) < 1)
    ) {
      console.log("\n[Warning] Please enter correct option\n");
      await this.showOptions();
      return;
    }
  }
}

export default ChefClient;
