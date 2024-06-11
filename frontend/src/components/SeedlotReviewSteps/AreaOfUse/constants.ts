export const MIN_ELEVATION_LIMIT = 0;

export const MAX_ELEVATION_LIMIT = 10000;

export const ELEVATION_OUT_OF_RANGE_ERR_MSG = `Must be between ${MIN_ELEVATION_LIMIT} and ${MAX_ELEVATION_LIMIT}`;

export const MIN_MAX_ERR_MSG = 'Min value should be <= Max value';

export const MIN_LAT_DEG_LIMIT = -90;

export const MAX_LAT_DEG_LIMIT = 90;

export const LAT_DEG_OUT_OF_RANGE_ERR_MSG = `Must be between ${MIN_LAT_DEG_LIMIT} and ${MAX_LAT_DEG_LIMIT}`;

export const MIN_LONG_DEG_LIMIT = -180;

export const MAX_LONG_DEG_LIMIT = 180;

export const LONG_DEG_OUT_OF_RANGE_ERR_MSG = `Must be between ${MIN_LONG_DEG_LIMIT} and ${MAX_LONG_DEG_LIMIT}`;

export const MIN_MINUTE_AND_SECOND_LIMIT = 0;

export const MAX_MINUTE_AND_SECOND_LIMIT = 59;

export const MINUTE_AND_SECOND_OUT_OF_RANGE_ERR_MSG = `Must be between ${MIN_MINUTE_AND_SECOND_LIMIT} and ${MAX_MINUTE_AND_SECOND_LIMIT}`;

export const MAX_COMMENT_LENGTH = 400;

export const COMMENT_ERR_MSG = `Must be fewer or equal to ${MAX_COMMENT_LENGTH} characters`;
