declare module "lunar-javascript" {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    static fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number,
    ): Solar;
    static fromDate(date: Date): Solar;
    getLunar(): Lunar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getWeek(): number;
    getFestivals(): string[];
    getXingZuo(): string;
    toYmd(): string;
    toString(): string;
    toFullString(): string;
    nextDay(n: number): Solar;
    nextMonth(n: number): Solar;
    nextYear(n: number): Solar;
  }

  export class Lunar {
    static fromYmd(year: number, month: number, day: number): Lunar;
    static fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number,
    ): Lunar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getSolar(): Solar;
    getYearShengXiao(): string;
    getYearInGanZhi(): string;
    getMonthInGanZhi(): string;
    getDayInGanZhi(): string;
    getFestivals(): string[];
    getOtherFestivals(): string[];
    getDayJiShen(): { toString(): string };
    getDayXiongSha(): { toString(): string };
    getDayPositionTai(): string;
    getDayPositionFuDesc(): string;
    getDayLu(): string;
    getMonthInChinese(): string;
    toString(): string;
    toFullString(): string;
  }

  export class LunarYear {
    static fromYear(year: number): LunarYear;
    getMonth(month: number): any;
  }

  export class SolarUtil {
    static isLeapYear(year: number): boolean;
  }

  export class HolidayUtil {
    static getHoliday(
      day: string | number,
      month?: number,
      dayOfMonth?: number,
    ): { getName(): string; getTarget(): string; toString(): string } | null;
    static fix(...args: any[]): void;
    static NAMES: string[];
  }

  export class Foto {
    static fromLunar(lunar: Lunar): Foto;
    getXiu(): string;
    getZheng(): string;
    getAnimal(): string;
    getGong(): string;
    getShou(): string;
    getOtherFestivals(): string[];
    toFullString(): string;
  }

  export class I18n {
    static setLanguage(lang: "chs" | "en"): void;
  }
}
