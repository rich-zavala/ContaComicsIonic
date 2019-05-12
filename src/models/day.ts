import { CCRecord } from "./record";

export interface ICCDay {
    date: string;
    total: number;
    records: CCRecord[];
}
