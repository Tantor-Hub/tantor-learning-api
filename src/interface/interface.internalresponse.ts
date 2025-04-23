export interface IInternalResponse {
    code: number;
    message: string;
    data: string | { heures: number; minutes: number; totalMinutes: number };
};