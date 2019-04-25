import * as moment from "moment";
import { ICCRecord } from "./record";

export interface ICCDay {
    date: string;
    total: number;
    records: string[];
}
