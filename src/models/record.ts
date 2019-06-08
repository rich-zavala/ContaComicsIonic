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
    checkedDate: number;
    publishDate: string;
    recordDate: number;

    // New data
    format: RECORD_FORMAT_TYPE;
    lang: string;
    read: boolean;
    readDate: string;
    provider: string;
    comments: string;
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
    readDate: string;
    provider: string;
    comments: string;
    checked: boolean;
    checkedDate: number;
    publishDate: string;
    recordDate: number;

    private publishDateMoment: moment.Moment;
    priceCurrency: string;
    detailDates = {
        published: "",
        registry: "",
        checked: "",
        read: ""
    };

    constructor(data: ICCRecord) {
        this.title = data.title;
        this.volumen = data.volumen;
        this.price = data.price;
        this.variant = data.variant || "";
        this.format = data.format || RECORD_FORMAT_TYPE.Staples;
        this.lang = data.lang || "esp";
        this.provider = data.provider || "";
        this.comments = data.comments || "";

        this.checked = data.checked || false;
        this.checkedDate = data.checkedDate;
        this.readDate = data.readDate;
        this.recordDate = data.recordDate;
        this.publishDate = data.publishDate;

        this.id = [data.title, data.volumen, data.variant]
            .filter(d => d)
            .join("_")
            .replace(/[^a-zA-Z0-9]/g, "_");

        if (!this.checked) {
            this.unRead();
        } else {
            this.read = data.read === false ? false : true;
            this.readDate = data.readDate;
        }

        this.init();
    }

    init() {
        this.publishDateMoment = moment(this.publishDate);
        this.priceCurrency = dynCurrency(this.price);

        this.detailDates = {
            published: this.publishDateMoment.format(DATE_FORMAT_READ),
            registry: moment(this.recordDate).format(DATE_FORMAT_READ_TIME),
            checked: moment(this.checkedDate).format(DATE_FORMAT_READ),
            read: this.readDate ? moment(this.readDate).format(DATE_FORMAT_READ) : "Unknown"
        };
    }

    check() {
        if (!this.checked || !this.checkedDate) {
            this.checked = true;
            this.checkedDate = Date.now();
        }
    }

    uncheck() {
        this.checked = false;
        this.checkedDate = undefined;
    }

    doRead() {
        if (!this.read || !this.readDate) {
            this.read = true;
            this.readDate = moment(Date.now()).format(DATE_FORMAT);
        }
    }

    unRead() {
        this.read = false;
        this.readDate = undefined;
    }

    getPublishYear() {
        return this.publishDateMoment.year();
    }

    insertable(): ICCRecord {
        return JSON.parse(JSON.stringify(this));
    }
}
