import * as v from "valibot";
import { createSubjects } from "@openauthjs/openauth/subject";

const SubjectShapeSchema = v.object({
  id: v.pipe(v.string(), v.trim(), v.minLength(1)),
  tokenVersion: v.pipe(v.number(), v.minValue(0)),
});

export const subjects = createSubjects({
  user: SubjectShapeSchema,
});

export type SubjectShapeSchema = v.InferOutput<typeof SubjectShapeSchema>;
