class GetOptions {

    private options: { [key: string]: string[] };

    constructor() {
        this.options = {
            'Admin': ['Add Employee', 'Add Menu', 'View Orders', 'Logout'],
            'Chef': ['View Orders', 'Logout'],
            'Employee': ['View Orders', 'Logout']
        };
    }

    public getOptionsByRole(role: any) {
        return this.options[role] || [];
    }

}

export default GetOptions;
