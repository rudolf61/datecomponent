export enum DateFormat {
    EU  = "DD-MM-YYYY",
    US  = "MM-DD-YYYY",
    ISO = "YYYY-MM-DD",
}

export enum DateElement {
    DD,
    MM,
    YY,
    DATE
}


export interface InputError {
    element: DateElement
    error: string
}