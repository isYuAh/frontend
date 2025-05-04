import { parse, ParseResult } from 'papaparse';

export async function parseCsv<T = Record<string, unknown>>(file: File): Promise<ParseResult<T>> {
    return new Promise<ParseResult<T>>((resolve, reject) => {
        parse<T>(file, {
            header: false,
            skipEmptyLines: true,
            transform: (value: string): string => {
                return value.trim();
            },
            complete: (results: ParseResult<T>) => {
                return resolve(results);
            },
            error: (error: Error, _) => {
                return reject(error);
            },
        });
    });
}
