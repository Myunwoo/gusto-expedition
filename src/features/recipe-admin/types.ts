/**
 * Recipe Admin Feature 타입 정의
 */

// 기본정보 데이터
export interface CreateBaseInfoData {
  title: string;
  source: string;
}

// 다국어 + 별칭 정보 데이터
export interface CreateI18nAliasInfoData {
  locales: Record<string, CreateI18nAliasInfoLocaleData>;
}

// Locale별 다국어 + 별칭 정보 데이터
export interface CreateI18nAliasInfoLocaleData {
  description: string;
  instructions: string;
  aliases: string[];
}

