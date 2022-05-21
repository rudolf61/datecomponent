export enum DateFormat {
    EU  = "EU",
    US  = "US",
    ISO = "ISO",
}

export enum DateElement {
    DD = "DD",
    MM = "MM",
    YY = "YY",
    DATE = "DATE"
}


export interface InputError {
    element: DateElement
    error: string
}
