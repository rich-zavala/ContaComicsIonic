import * as moment from "moment";
import { DATE_FORMAT } from "src/constants/formats";

export interface ICCRecord {
    id?: string;
    title: string;
    volume: number;
    price: number;
    variant?: string;
    checked?: boolean;
    publishDate: number;
    checkedDate?: number;
    recordDate?: number;
}

export class CCRecord implements ICCRecord {
    id: string;
    title: string;
    volume: number;
    price: number;
    variant: string;
    checked: boolean;
    publishDate: number;
    checkedDate: number;
    recordDate: number;

    private publishDateMoment: moment.Moment;

    constructor(data: ICCRecord) {
        this.title = data.title;
        this.volume = data.volume;
        this.price = data.price;
        this.variant = data.variant;
        this.checked = data.checked || false;
        this.publishDate = data.publishDate;
        this.checkedDate = data.checkedDate;
        this.recordDate = data.recordDate || Date.now();

        this.id = [data.title, data.volume, data.variant]
            .filter(d => d)
            .join("_")
            .replace(/[^a-zA-Z0-9]/g, "");

        this.publishDateMoment = moment(this.publishDate);
    }

    public check() {
        this.checked = true;
        this.checkedDate = Date.now();
    }

    public uncheck() {
        this.checked = false;
        this.checkedDate = undefined;
    }

    public getPublishYear() {
        return this.publishDateMoment.year();
    }

    public getPublishDate() {
        return this.publishDateMoment.format(DATE_FORMAT);
    }

    public insertable() {
        return JSON.parse(JSON.stringify(this));
    }
}
