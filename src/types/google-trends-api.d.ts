declare module "google-trends-api" {
  interface TrendsOptions {
    keyword: string | string[];
    startTime?: Date;
    endTime?: Date;
    geo?: string | string[];
    hl?: string;
    timezone?: number;
    category?: number;
    property?: "images" | "news" | "youtube" | "froogle" | "";
    resolution?: "COUNTRY" | "REGION" | "CITY" | "DMA";
    granularTimeResolution?: boolean;
  }

  function autoComplete(
    options: TrendsOptions,
    cb?: (err: Error | null, results: string) => void
  ): Promise<string>;

  function dailyTrends(
    options: TrendsOptions & { trendDate?: Date; ns?: number },
    cb?: (err: Error | null, results: string) => void
  ): Promise<string>;

  function interestOverTime(
    options: TrendsOptions,
    cb?: (err: Error | null, results: string) => void
  ): Promise<string>;

  function interestByRegion(
    options: TrendsOptions,
    cb?: (err: Error | null, results: string) => void
  ): Promise<string>;

  function realTimeTrends(
    options: TrendsOptions,
    cb?: (err: Error | null, results: string) => void
  ): Promise<string>;

  function relatedQueries(
    options: TrendsOptions,
    cb?: (err: Error | null, results: string) => void
  ): Promise<string>;

  function relatedTopics(
    options: TrendsOptions,
    cb?: (err: Error | null, results: string) => void
  ): Promise<string>;
}
