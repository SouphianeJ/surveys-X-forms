import { z } from "zod";

export const IndicatorSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  baseline: z.string().optional().default(""),
  target: z.string().optional().default(""),
  actual: z.string().optional().default(""),
  gap: z.string().optional().default(""),
});

export const StorySchema = z.object({
  asA: z.string().min(1),
  iWant: z.string().min(1),
  soThat: z.string().min(1),
  acceptanceCriteria: z.string().min(1),
  estimate: z.coerce.number().min(0).default(1),
});

export const RiskSchema = z.object({
  risk: z.string().min(1),
  probability: z.enum(["L", "M", "H"]).default("M"),
  impact: z.enum(["L", "M", "H"]).default("M"),
  response: z.string().min(1),
  owner: z.string().min(1),
});

export const RaciSchema = z.object({
  task: z.string().min(1),
  r: z.string().min(1),
  a: z.string().min(1),
  c: z.string().optional().default(""),
  i: z.string().optional().default(""),
});

export const FormSchema = z.object({
  pitch: z.string().min(8, "Un pitch d’au moins 8 caractères"),
  projectClient: z.string().min(1),
  period: z.string().min(1),
  role: z.string().min(1),
  stakeholders: z.string().optional().default(""),
  targetAudience: z.string().min(1),
  scope: z.array(z.string()).min(1, "Sélectionne au moins un périmètre"),
  context: z.string().min(1),
  pains: z.array(z.string()).default([]),
  baseline: z.object({
    timeToCompetency: z.string().optional().default(""),
    completionRate: z.string().optional().default(""),
    csat: z.string().optional().default(""),
    businessKpi: z.string().optional().default(""),
  }),
  constraints: z.array(z.string()).default([]),
  hypotheses: z.array(z.string()).default([]),
  learningObjectives: z.array(z.string()).min(1, "Au moins 1 objectif"),
  kirkpatrick: z.object({
    l1Target: z.string().optional().default(""),
    l2Target: z.string().optional().default(""),
    l3Target: z.string().optional().default(""),
    l4Target: z.string().optional().default(""),
    plan: z.object({
      what: z.string().optional().default(""),
      when: z.string().optional().default(""),
      where: z.string().optional().default(""),
      tool: z.string().optional().default(""),
      owner: z.string().optional().default(""),
    }),
  }),
  scrum: z.object({
    epic: z.string().min(1),
    sprintLength: z.string().min(1),
    ceremonies: z.array(z.string()).default(["Planning", "Daily", "Review", "Rétrospective"]),
    metrics: z.array(z.string()).default(["Vélocité", "Lead time", "Défauts", "Satisfaction"]),
    stories: z.array(StorySchema).min(1, "Ajoute au moins 1 user story"),
    dor: z.array(z.string()).default(["Story claire", "Dépendances levées", "Design/tech validés"]),
    dod: z
      .array(z.string())
      .default([
        "Fonctionnel validé",
        "Accessibilité WCAG AA",
        "Traçabilité xAPI/SCORM",
        "Tests verts",
        "Documentation à jour",
      ]),
  }),
  addie: z.object({
    analysis: z.array(z.string()).default([]),
    design: z.array(z.string()).default([]),
    development: z.array(z.string()).default([]),
    implementation: z.array(z.string()).default([]),
    evaluation: z.array(z.string()).default([]),
  }),
  results: z.object({
    indicators: z.array(IndicatorSchema).default([]),
    highlights: z.array(z.string()).default([]),
  }),
  proofs: z.object({
    demo: z.string().optional().default(""),
    deliverables: z.array(z.string()).default([]),
    codeRepo: z.string().optional().default(""),
    dashboard: z.string().optional().default(""),
    testimonials: z.array(z.string()).default([]),
  }),
  learnings: z.object({
    worked: z.array(z.string()).default([]),
    change: z.array(z.string()).default([]),
    next: z.array(z.string()).default([]),
  }),
  accessibilityChecklist: z.array(z.string()).default([]),
  risks: z.array(RiskSchema).default([]),
  raci: z.array(RaciSchema).default([]),
  annexes: z.object({
    xapi: z.string().optional().default(""),
    storyTemplate: z.string().optional().default(""),
    links: z.array(z.string()).default([]),
  }),
});

export type FormData = z.infer<typeof FormSchema>;