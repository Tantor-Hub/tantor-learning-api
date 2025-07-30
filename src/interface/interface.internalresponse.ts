export interface IInternalResponse {
    code: number;
    message?: string;
    data?: any | string | { heures: number; minutes: number; totalMinutes: number };
};