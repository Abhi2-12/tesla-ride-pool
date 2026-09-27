import { z } from "zod";

export function validate<T extends z.ZodType>(
  schema: T,
  value: unknown,
): z.output<T> {
  return schema.parse(value);
}
