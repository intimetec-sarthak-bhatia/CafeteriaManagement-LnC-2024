import { USER_OPTIONS, QUESTIONS, NO_QUESTIONS_OPTIONS } from "../Enums/userOptions.enum";
import { ResponseInterface } from "../Interface/Response";
import PromptUtils from "../utils/PromptUtils";

class EmployeeClient {
  private options: string[];
  private questions: { [key: number]: string[] };
  private noQuestionsOptions: number[];

  constructor(role: string) {
    this.options = USER_OPTIONS[role];
    this.questions = QUESTIONS[role];
    this.noQuestionsOptions = NO_QUESTIONS_OPTIONS[role];
  }
  async requestHandler(event?: string, preSelectedOption?: number) {
    const selectedOption = preSelectedOption && event ? preSelectedOption : await this.showOptions();
    if (selectedOption === 6) return { selectedOption, data: "logout" };

    const reqPayload = await this.handleOption(selectedOption, !!event);
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

  async handleOption(selectedOption, isPreSelected?: boolean) {

    if (this.noQuestionsOptions.includes(selectedOption) && !isPreSelected) {
      return { selectedOption: selectedOption, data: null };
    }

    const prompts = this.questions[selectedOption];
    const answers = await this.collectAnswers(prompts);

    return { selectedOption: isPreSelected ? selectedOption + 100 : selectedOption, data: answers };
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

export default EmployeeClient;
