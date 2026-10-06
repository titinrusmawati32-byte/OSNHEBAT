declare module 'mammoth' {
  interface MammothResult {
    value: string;
    messages: any[];
  }
  export function extractRawText(input: { arrayBuffer: ArrayBuffer }): Promise<MammothResult>;
  export function convertToHtml(input: { arrayBuffer: ArrayBuffer }): Promise<MammothResult>;
}
