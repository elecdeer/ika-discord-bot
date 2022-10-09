import { setHours, startOfHour } from "date-fns";

import type { FetchSchedule } from "./fetchSchedule";
import type { RuleSchedule } from "./schema";

export const createScheduleStore = (
  fetchSchedule: FetchSchedule
): {
  getRegular: (date: Date) => Promise<RuleSchedule>;
  getBankaraChallenge: (date: Date) => Promise<RuleSchedule>;
  getBankaraOpen: (date: Date) => Promise<RuleSchedule>;
} => {
  const regularScheduleCache = new Map<string, RuleSchedule>();
  const bankaraChallengeScheduleCache = new Map<string, RuleSchedule>();
  const bankaraOpenScheduleCache = new Map<string, RuleSchedule>();

  const fetchWithCacheSchedule = async () => {
    const schedule = await fetchSchedule();

    schedule.result.regular.forEach((schedule) => {
      regularScheduleCache.set(
        getScheduleItemKey(schedule.start_time),
        schedule
      );
    });
    schedule.result.bankara_challenge.forEach((schedule) => {
      bankaraChallengeScheduleCache.set(
        getScheduleItemKey(schedule.start_time),
        schedule
      );
    });
    schedule.result.bankara_open.forEach((schedule) => {
      bankaraOpenScheduleCache.set(
        getScheduleItemKey(schedule.start_time),
        schedule
      );
    });
  };

  const getCacheOrFetch =
    (cache: Map<string, RuleSchedule>) => async (date: Date) => {
      const key = getScheduleItemKey(date);
      const cached = cache.get(key);
      if (cached) {
        return cached;
      } else {
        await fetchWithCacheSchedule();
        const schedule = cache.get(key);
        if (schedule !== undefined) {
          return schedule;
        } else {
          throw new Error("schedule not found");
        }
      }
    };

  return {
    getRegular: getCacheOrFetch(regularScheduleCache),
    getBankaraChallenge: getCacheOrFetch(bankaraChallengeScheduleCache),
    getBankaraOpen: getCacheOrFetch(bankaraOpenScheduleCache),
  };
};

//面倒なのでテーブルを用意
const hourCeilTable: Record<number, number> = {
  0: 23,
  1: 1,
  2: 1,
  3: 3,
  4: 3,
  5: 5,
  6: 5,
  7: 7,
  8: 7,
  9: 9,
  10: 9,
  11: 11,
  12: 11,
  13: 13,
  14: 13,
  15: 15,
  16: 15,
  17: 17,
  18: 17,
  19: 19,
  20: 19,
  21: 21,
  22: 21,
  23: 23,
};

/**
 * 奇数時の始めにDateを丸め、スケジュール取得のキーにする
 * @param date
 */
const getScheduleItemKey = (date: Date) => {
  const startHour = startOfHour(date);
  const ceilHour = hourCeilTable[startHour.getHours()];
  const ceilDate = setHours(startHour, ceilHour);
  return ceilDate.toUTCString();
};
