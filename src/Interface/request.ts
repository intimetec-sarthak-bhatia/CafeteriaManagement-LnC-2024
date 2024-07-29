export interface RequestInterface {
    event?: string;
    user?: {id: number, role: string},
    selectedOption?: number,
    data?: any 
}