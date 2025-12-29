import * as core from "@actions/core";

type GetStringOptions =
  | { name: string; required: true }
  | { name: string; required: false; defaultValue: string };

export function getString(options: GetStringOptions): string {
  const { name, required } = options;

  if (required) {
    return core.getInput(name, { required });
  } else {
    return core.getInput(name, { required }) || options.defaultValue;
  }
}

type GetBooleanOptions =
  | { name: string; required: true }
  | { name: string; required: false; defaultValue: boolean };

export function getBoolean(options: GetBooleanOptions): boolean {
  const { name, required } = options;

  if (required) {
    return core.getBooleanInput(name, { required });
  } else {
    try {
      return core.getBooleanInput(name, { required });
    } catch (error) {
      return options.defaultValue;
    }
  }
}

type GetMultilineOptions =
  | { name: string; required: true }
  | { name: string; required: false; defaultValue: string[] };

export function getMultiline(options: GetMultilineOptions): string[] {
  const { name, required } = options;

  if (required) {
    return core.getMultilineInput(name, { required });
  } else {
    const value = core.getMultilineInput(name, { required });

    if (value.length === 0) {
      return options.defaultValue;
    } else {
      return value;
    }
  }
}

type GetCacheControlOptions = {
  name: string;
  required: false;
  defaultValue: CacheControlRule[];
};

export function getCacheControl(
  options: GetCacheControlOptions
): CacheControlRule[] {
  const { name, defaultValue } = options;
  const value = core.getMultilineInput(name, { required: false });

  if (value.length === 0) {
    return defaultValue;
  }

  const rules: CacheControlRule[] = [];

  for (const line of value) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Parse format: "cache-control-value: ['pattern1', 'pattern2']"
    const colonIndex = trimmedLine.indexOf(":");
    if (colonIndex === -1) {
      throw new Error(
        `Invalid cache-control format: "${line}". Expected format: "cache-control-value: ['pattern1', 'pattern2']"`
      );
    }

    const cacheControl = trimmedLine.substring(0, colonIndex).trim();
    const patternsStr = trimmedLine.substring(colonIndex + 1).trim();

    // Parse patterns array
    let patterns: string[] = [];
    try {
      const parsed = JSON.parse(patternsStr);
      if (!Array.isArray(parsed)) {
        throw new Error("Patterns must be an array");
      }
      patterns = parsed;
    } catch (error) {
      throw new Error(
        `Invalid patterns format in "${line}". Expected JSON array, got: "${patternsStr}"`
      );
    }

    rules.push({ cacheControl, patterns });
  }

  return rules;
}
