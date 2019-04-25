import { ICCYear } from "./year";

export interface ICCCollection {
    years: ICCYear[];
}

export class CCCollection implements ICCCollection {
    years: ICCYear[];
}
