import * as moment from "moment";
import { DATE_FORMAT_READ, DATE_FORMAT_READ_TIME, DATE_FORMAT } from "src/constants/formats";
import { dynCurrency } from "src/app/tools/utils";

export function strEnum<T extends string>(o: Array<T>): { [K in T]: K } {
    return o.reduce((res, key) => {
        res[key] = key;
        return res;
    }, Object.create(null));
}

export const RECORD_FORMAT_TYPE = strEnum(["Staples", "TP", "HC", "Monster", "Manga"]);
export type RECORD_FORMAT_TYPE = keyof typeof RECORD_FORMAT_TYPE;

export interface ICCRecord {
    id?: string;
    title: string;
    volumen: number;
    price: number;
    variant: string;
    checked: boolean;
    publishDate: string;
    checkedDate: number;
    recordDate: number;

    // New data
    format: RECORD_FORMAT_TYPE;
    lang: string;
    read: boolean;
    provider: string;
    comments: string;
    readDate: number;
}

export class CCRecord implements ICCRecord {
    id: string;
    title: string;
    volumen: number;
    price: number;
    variant: string;
    format: RECORD_FORMAT_TYPE;
    lang: string;
    read: boolean;
    provider: string;
    comments: string;
    checked: boolean;
    publishDate: string;
    checkedDate: number;
    readDate: number;
    recordDate: number;

    private publishDateMoment: moment.Moment;

    constructor(data: ICCRecord) {
        this.title = data.title;
        this.volumen = data.volumen;
        this.price = data.price;
        this.variant = data.variant;
        this.format = data.format || RECORD_FORMAT_TYPE.Staples;
        this.lang = data.lang || "esp";
        this.read = data.read === true ? true : false;
        this.provider = data.provider;
        this.comments = data.comments;

        this.checked = data.checked || false;
        this.publishDate = data.publishDate;
        this.checkedDate = data.checkedDate;
        this.readDate = data.readDate;
        this.recordDate = data.recordDate || Date.now();

        this.id = [data.title, data.volumen, data.variant]
            .filter(d => d)
            .join("_")
            .replace(/[^a-zA-Z0-9]/g, "");

        this.publishDateMoment = moment(this.publishDate);
    }

    public check() {
        if (!this.checked) {
            this.checked = true;
            this.checkedDate = Date.now();
        }
    }

    public uncheck() {
        this.checked = false;
        this.checkedDate = undefined;
    }

    public doRead() {
        if (!this.read) {
            this.read = true;
            this.readDate = Date.now();
        }
    }

    public unRead() {
        this.read = false;
        this.readDate = undefined;
    }

    public getPublishYear() {
        return this.publishDateMoment.year();
    }

    public insertable() {
        return JSON.parse(JSON.stringify(this));
    }

    public priceCurrency() {
        return dynCurrency(this.price);
    }

    get detailDates() {
        return {
            published: this.publishDateMoment.format(DATE_FORMAT_READ),
            registry: moment(this.recordDate).format(DATE_FORMAT_READ_TIME),
            checked: moment(this.checkedDate).format(DATE_FORMAT_READ),
            read: moment(this.readDate).format(DATE_FORMAT_READ)
        };
    }
}
