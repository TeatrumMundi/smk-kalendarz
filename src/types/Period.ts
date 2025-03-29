export type Period = {
    start: string;
    end: string;
};
export interface ColoredRange {
    start: string;
    end: string;
    type: string;
    color: string;
    label?: string;
}