import * as readline from "readline";

const readLine = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

class PromptUtils {
  promptMessage(message: string): Promise<string> {
    return new Promise((resolve) => {
      readLine.question(message, (ans: string) => {
        resolve(ans.trim());
      });
    });
  }
}

export default new PromptUtils();
