import { Socket } from "socket.io-client";
import PromptUtils from "./PromptUtils";

class GetOptions {

    private roleOptions: { [key: string]: { options: string[], questions: { [key: number]: string[] } } };
    private socket: Socket;

    constructor(socket: Socket) {
        this.socket = socket;
        this.roleOptions = {
            'Admin': {
                options: ['Add Employee', 'Add Menu Item', 'View Menu Items', 'Update Menu Item Price', 'Update Menu Item Availability'],
                questions: {
                    1: ['Enter Employee Name: ', 'Enter Employee Email: ', 'Enter Employee Password: ', 'Enter Employee Role: '],
                    2: ['Enter Menu Item Name: ', 'Enter Menu Item Price: ', 'Enter Menu Item MealType: ', 'Enter Item Availability:'],
                    4: ['Enter Menu Item Name: ', 'Enter New Price: '],
                    5: ['Enter Menu Item Name: ', 'Enter New Availability: ']
                }
            },
            'Chef': {
                options: ['View Top 5 Recommended Items', 'Rollout Menu'],
                questions: {
                    2: ['Enter Breakfast Option Ids: ', 'Enter Lunch Option Ids: ', 'Enter Dinner Option Ids: ']
                }
            },
            'employee': {
                options: ['Give FeedBack: ', 'Vote for meals'],
                questions: {
                    2: ['']
                }
            }
        };
    }

    private async promptMessageByOption(option: number, role: string): Promise<{ [key: string]: string }> {
       
            const prompts = this.roleOptions[role].questions[option];
            const answers: { [key: string]: string } = {};
            for (let i = 0; i < prompts.length; i++) {
                const question = prompts[i];
                const answer = await PromptUtils.promptMessage(question);
                answers[`arg${i + 1}`] = answer;
            }
            return answers;
        
    }

    public async getOptionsByRole(role: string): Promise<{ selectedOption: number, answers: { [key: string]: string } | null }> {
        const roleOptionData = this.roleOptions[role];
        if (!roleOptionData) {
            console.log('Invalid role.');
            return;
        }

        const options = roleOptionData.options;
        options.map((option, index) => {
            console.log(`${index + 1}. ${option}`);
        });

        const selectedOption = parseInt(await PromptUtils.promptMessage('Enter your choice: '));

        if (isNaN(selectedOption) || selectedOption < 1 || selectedOption > options.length) {
            console.log('Invalid choice.');
            return;
        }

        const nonPromptingOptions: { [key: string]: number[] } = {
            'Admin': [3], 
            'Chef': [1], 
            'employee': []
        };

        if (nonPromptingOptions[role] && nonPromptingOptions[role].includes(selectedOption)) {
            return { selectedOption: selectedOption, answers: null };
        }

        if(role==='employee' && selectedOption===1) {
            this.socket.emit('feedback/getRolledoutItems', '');
            this.socket.on('feedback/rolledoutItems', (items: any) => {
                console.log('Rolled out items:', items);
            });
        }
        const answers = await this.promptMessageByOption(selectedOption, role);
        return { selectedOption: selectedOption, answers };
    }
}

export default GetOptions;
