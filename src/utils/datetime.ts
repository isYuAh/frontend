export class GoodDate {
    date: Date;

    constructor(date?: Date) {
        this.date = date ?? new Date();
    }

    static fromString(date: string): GoodDate {
        return new GoodDate(new Date(date));
    }

    getTime(): number {
        return this.date.getTime();
    }

    getTimezoneOffset(): number {
        return this.date.getTimezoneOffset();
    }

    add(d: number, type: "year" | "month" | "week" | "date"): GoodDate {
        const newDate = new Date(this.date);
        switch (type) {
            case "year":
                newDate.setFullYear(newDate.getFullYear() + d);
                break;
            case "month":
                newDate.setMonth(newDate.getMonth() + d);
                break;
            case "week":
                newDate.setDate(newDate.getDate() + d * 7);
                break;
            case "date":
                newDate.setDate(newDate.getDate() + d);
                break;
        }
        return new GoodDate(newDate);
    }

    startOfWeek(): GoodDate {
        return this.add(0 - this.date.getDay(), 'date');
    }

    weekDays(): GoodDate[] {
        const w = this.startOfWeek();
        return Array.from({length: 7}).map((_, idx) =>
            w.add(idx, 'date')
        );
    }

    format(fmt: string): string {
        return fmt.replace(/YYYY/g, this.date.getFullYear().toString())
            .replace(/YY/g, this.date.getFullYear().toString().slice(-2))
            .replace(/MMM/g, this.date.toLocaleDateString('en-US', {month: 'short'}))
            .replace(/MM/g, (this.date.getMonth() + 1).toString().padStart(2, '0'))
            .replace(/DD/g, this.date.getDate().toString().padStart(2, '0'))
            .replace(/HH/g, this.date.getHours().toString().padStart(2, '0'))
            .replace(/mm/g, this.date.getMinutes().toString().padStart(2, '0'))
            .replace(/ss/g, this.date.getSeconds().toString().padStart(2, '0'));
    }

    toInputDateString ()  {
        // accepted: YYYY-MM-DD
        return this.format("YYYY-MM-DD");
    }

    toISOString() {
        return this.date.toISOString();
    }

    toLocalizedString() {
        return this.date.toLocaleString();
    }

    toLocalizedTimeString() {
        return this.date.toLocaleTimeString();
    }

    toLocalizedDateString() {
        return this.date.toLocaleDateString();
    }

    toISODate() {
        return this.toISOString().split('T')[0];
    }

    toJSON(): string {
        return this.toISOString(); // Use the ISO string representation of the internal Date
    }

    getDaysFromNow() {
        const today = new GoodDate();
        const diffTime = Math.abs(this.getTime() - today.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}