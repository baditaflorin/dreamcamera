import { z } from "zod";

export const turboManifestSchema = z.object({
  schemaVersion: z.literal(1),
  kind: z.enum(["sd-turbo-img2img", "image-stylizer"]),
  name: z.string().min(1),
  description: z.string().optional(),
  input: z.object({
    width: z.number().int().min(64).max(1024),
    height: z.number().int().min(64).max(1024),
    channels: z.literal(3),
    format: z.literal("float32-nchw"),
    range: z.tuple([z.number(), z.number()]),
  }),
  models: z.record(z.string().min(1), z.string().min(1)),
  notes: z.string().optional(),
});

export type TurboManifest = z.infer<typeof turboManifestSchema>;

export function parseTurboManifest(value: unknown): TurboManifest {
  return turboManifestSchema.parse(value);
}
