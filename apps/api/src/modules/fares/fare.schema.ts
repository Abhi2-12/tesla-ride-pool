import { z } from "zod";

const jsonPrimitiveSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

const jsonValueSchema: z.ZodType<
  string | number | boolean | null | unknown[] | Record<string, unknown>
> = z.lazy(() =>
  z.union([
    jsonPrimitiveSchema,
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
);

export const createFareSchema = z.object({
  poolId: z.string().min(1),
  userId: z.string().min(1),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  calculationData: jsonValueSchema,
});

export const updateFareSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  calculationData: jsonValueSchema.optional(),
});

export const fareIdSchema = z.object({
  id: z.string().min(1),
});