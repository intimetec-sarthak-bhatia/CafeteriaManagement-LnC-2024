import { USER_OPTIONS, QUESTIONS, NO_QUESTIONS_OPTIONS, NUM_TYPE_QUESTIONS } from "../Enums/userOptions.enum";
import { ResponseInterface } from "../Interface/Response";
import PromptUtils from "../utils/PromptUtils";

class AdminClient {
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
    const verifiedOption = await this.verifySelectedOption(selectedOption);
    return verifiedOption;
  }

  async optionsHandler(selectedOption) {
    if (this.noQuestionsOptions.includes(selectedOption)) {
      return { selectedOption: selectedOption, data: null };
    }
    const prompts = this.questions[selectedOption];
    const answers = await this.collectAnswers(prompts, selectedOption);
    return { selectedOption: selectedOption, data: answers };
  }

  private async collectAnswers(prompts: string[], selectedOption: number): Promise<{ [key: string]: number| string }> {
    const answers: { [key: string]: number | string } = {};
    for (let i = 0; i < prompts.length; i++) {
      const question = prompts[i];
      const answer = await this.getValidAnswer(question, selectedOption, i);
      answers[`arg${i + 1}`] = answer;
    }
    return answers;
  }

  private async getValidAnswer(question: string, selectedOption: number, iteration: number): Promise<number | string> {
    let answer: string;

    while (true) {
      answer = await PromptUtils.promptMessage(question);
      if (this.numTypeQuestions[selectedOption]?.includes(iteration+1) && !(/^[0-9,.]*$/.test(answer))) {
        console.log('\n[Warning] Please enter a valid number\n');
        continue;
      }
      break;
    }

    return this.numTypeQuestions[selectedOption]?.includes(iteration+1) ? parseInt(answer): answer;
  }

  async verifySelectedOption(selectedOption: string) {
    if (isNaN(parseInt(selectedOption)) || parseInt(selectedOption) < 1) {
      console.log("\n[Warning] Please enter correct data type:number\n");
      return await this.showOptions();
    }
    if (parseInt(selectedOption) > this.options.length) {
      console.log("\n[Warning] Please enter correct option\n");
      return await this.showOptions(); 
    }

    return parseInt(selectedOption);
  }
}

export default AdminClient;
