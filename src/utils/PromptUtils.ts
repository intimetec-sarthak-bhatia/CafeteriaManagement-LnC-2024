import { readLine } from "./readline";

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
