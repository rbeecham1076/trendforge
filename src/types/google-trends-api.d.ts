declare module "google-trends-api" {
  export function autoComplete(options: {
    keyword: string;
  }): Promise<{
    default?: {
      topics?: Array<{ title: string; type: string; mid: string }>;
    };
    [key: string]: unknown;
  }>;

  export function interestOverTime(options: {
    keyword: string;
    startTime?: Date;
    endTime?: Date;
    geo?: string;
    hl?: string;
    timezone?: number;
    category?: number;
    property?: string;
    resolution?: string;
  }): Promise<string>;

  export function interestByRegion(options: {
    keyword: string;
    startTime?: Date;
    endTime?: Date;
    geo?: string;
    hl?: string;
    timezone?: number;
    category?: number;
    property?: string;
    resolution?: string;
  }): Promise<string>;

  export function relatedQueries(options: {
    keyword: string;
    startTime?: Date;
    endTime?: Date;
    geo?: string;
    hl?: string;
    timezone?: number;
    category?: number;
    property?: string;
  }): Promise<{
    default?: {
      rankedKeyword?: Array<{
        query: string;
        value: number;
        formattedValue: string;
        link: string;
        hasData: boolean;
      }>;
      risingKeyword?: Array<{
        query: string;
        value: number;
        formattedValue: string;
        link: string;
        hasData: boolean;
      }>;
    };
    [key: string]: unknown;
  }>;

  export function relatedTopics(options: {
    keyword: string;
    startTime?: Date;
    endTime?: Date;
    geo?: string;
    hl?: string;
    timezone?: number;
    category?: number;
    property?: string;
  }): Promise<object>;
}
