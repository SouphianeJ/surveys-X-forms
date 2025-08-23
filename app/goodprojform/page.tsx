"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useFieldArray, UseFormRegister } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { exportJson, exportCsv, exportPdf } from "../../lib/exporters";

const IndicatorSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  baseline: z.string().optional().default(""),
  target: z.string().optional().default(""),
  actual: z.string().optional().default(""),
  gap: z.string().optional().default("")
});

const StorySchema = z.object({
  asA: z.string().min(1),
  iWant: z.string().min(1),
  soThat: z.string().min(1),
  acceptanceCriteria: z.string().min(1),
  estimate: z.coerce.number().min(0).default(1)
});

const RiskSchema = z.object({
  risk: z.string().min(1),
  probability: z.enum(["L", "M", "H"]).default("M"),
  impact: z.enum(["L", "M", "H"]).default("M"),
  response: z.string().min(1),
  owner: z.string().min(1)
});

const RaciSchema = z.object({
  task: z.string().min(1),
  r: z.string().min(1),
  a: z.string().min(1),
  c: z.string().optional().default(""),
  i: z.string().optional().default("")
});

const FormSchema = z.object({
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
    businessKpi: z.string().optional().default("")
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
      owner: z.string().optional().default("")
    })
  }),
  scrum: z.object({
    epic: z.string().min(1),
    sprintLength: z.string().min(1),
    ceremonies: z.array(z.string()).default(["Planning", "Daily", "Review", "Rétrospective"]),
    metrics: z.array(z.string()).default(["Vélocité", "Lead time", "Défauts", "Satisfaction"]),
    stories: z.array(StorySchema).min(1, "Ajoute au moins 1 user story"),
    dor: z.array(z.string()).default([
      "Story claire",
      "Dépendances levées",
      "Design/tech validés"
    ]),
    dod: z.array(z.string()).default([
      "Fonctionnel validé",
      "Accessibilité WCAG AA",
      "Traçabilité xAPI/SCORM",
      "Tests verts",
      "Documentation à jour"
    ])
  }),
  addie: z.object({
    analysis: z.array(z.string()).default([]),
    design: z.array(z.string()).default([]),
    development: z.array(z.string()).default([]),
    implementation: z.array(z.string()).default([]),
    evaluation: z.array(z.string()).default([])
  }),
  results: z.object({
    indicators: z.array(IndicatorSchema).default([]),
    highlights: z.array(z.string()).default([])
  }),
  proofs: z.object({
    demo: z.string().optional().default(""),
    deliverables: z.array(z.string()).default([]),
    codeRepo: z.string().optional().default(""),
    dashboard: z.string().optional().default(""),
    testimonials: z.array(z.string()).default([])
  }),
  learnings: z.object({
    worked: z.array(z.string()).default([]),
    change: z.array(z.string()).default([]),
    next: z.array(z.string()).default([])
  }),
  accessibilityChecklist: z.array(z.string()).default([]),
  risks: z.array(RiskSchema).default([]),
  raci: z.array(RaciSchema).default([]),
  annexes: z.object({
    xapi: z.string().optional().default(""),
    storyTemplate: z.string().optional().default(""),
    links: z.array(z.string()).default([])
  })
});

type FormData = z.infer<typeof FormSchema>;

// --------- Helpers UI ----------
function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="card p-5 md:p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        {subtitle && <p className="text-sm text-ink-300">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="label">{children}</label>;
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`input ${props.className ?? ""}`} />;
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`textarea ${props.className ?? ""}`} />;
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="badge">{children}</span>;
}

function getDefaultValues(): FormData {
  return {
    pitch: "",
    projectClient: "",
    period: "",
    role: "",
    stakeholders: "",
    targetAudience: "",
    scope: [],
    context: "",
    pains: [],
    baseline: { timeToCompetency: "", completionRate: "", csat: "", businessKpi: "" },
    constraints: [],
    hypotheses: [],
    learningObjectives: [""],
    kirkpatrick: {
      l1Target: "",
      l2Target: "",
      l3Target: "",
      l4Target: "",
      plan: { what: "", when: "", where: "", tool: "", owner: "" }
    },
    scrum: {
      epic: "",
      sprintLength: "2 semaines",
      ceremonies: ["Planning", "Daily", "Review", "Rétrospective"],
      metrics: ["Vélocité", "Lead time", "Défauts", "Satisfaction"],
      stories: [{ asA: "", iWant: "", soThat: "", acceptanceCriteria: "", estimate: 1 }],
      dor: ["Story claire", "Dépendances levées", "Design/tech validés"],
      dod: [
        "Fonctionnel validé",
        "Accessibilité WCAG AA",
        "Traçabilité xAPI/SCORM",
        "Tests verts",
        "Documentation à jour"
      ]
    },
    addie: { analysis: [], design: [], development: [], implementation: [], evaluation: [] },
    results: { indicators: [], highlights: [] },
    proofs: { demo: "", deliverables: [], codeRepo: "", dashboard: "", testimonials: [] },
    learnings: { worked: [], change: [], next: [] },
    accessibilityChecklist: [],
    risks: [],
    raci: [],
    annexes: { xapi: "", storyTemplate: "", links: [] }
  };
}

// --------- Page ----------
export default function GoodProjFormPage() {
  const defaultValues = useMemo(() => getDefaultValues(), []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<FormData>({ defaultValues, resolver: zodResolver(FormSchema), mode: "onBlur" });

  // Arrays
  const painsFA = useFieldArray({ control, name: "pains" as any });
  const constraintsFA = useFieldArray({ control, name: "constraints" as any });
  const hypothesesFA = useFieldArray({ control, name: "hypotheses" as any });
  const objectivesFA = useFieldArray({ control, name: "learningObjectives" as any });
  const storiesFA = useFieldArray({ control, name: "scrum.stories" });
  const indicatorsFA = useFieldArray({ control, name: "results.indicators" });
  const highlightsFA = useFieldArray({ control, name: "results.highlights" as any });
  const deliverablesFA = useFieldArray({ control, name: "proofs.deliverables" as any });
  const testimonialsFA = useFieldArray({ control, name: "proofs.testimonials" as any });
  const workedFA = useFieldArray({ control, name: "learnings.worked" as any });
  const changeFA = useFieldArray({ control, name: "learnings.change" as any });
  const nextFA = useFieldArray({ control, name: "learnings.next" as any });
  const risksFA = useFieldArray({ control, name: "risks" });
  const raciFA = useFieldArray({ control, name: "raci" });
  const linksFA = useFieldArray({ control, name: "annexes.links" as any });

  const [jsonPreview, setJsonPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSubmit = (data: FormData) => {
    const json = JSON.stringify(data, null, 2);
    setJsonPreview(json);
  };

  const downloadJson = () => exportJson(watch());
  const downloadCsv = () => exportCsv(watch());
  const downloadPdf = () => exportPdf(watch());

  const copyJson = async () => {
    const data = jsonPreview || JSON.stringify(watch(), null, 2);
    await navigator.clipboard.writeText(data);
    alert("JSON copié dans le presse-papiers.");
  };

  const handleReset = () => {
    const vals = getDefaultValues();
    reset(vals);
    setJsonPreview(JSON.stringify(vals, null, 2));
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        reset(data, { keepDefaultValues: true });
        setJsonPreview(JSON.stringify(data, null, 2));
      } catch {
        alert("JSON invalide");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // For instant preview
  useEffect(() => {
    const sub = watch((v) => setJsonPreview(JSON.stringify(v, null, 2)));
    return () => sub.unsubscribe();
  }, [watch]);

  const scopeOptions = ["E-learning", "Portail web", "Parcours blended", "LMS/LRS", "Change management"];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">Good Project Form</h1>
        <p className="text-ink-300 text-sm">
          Basé sur ta fiche : <strong>ADDIE × Scrum × Kirkpatrick</strong>. Tous les champs clés, tableaux dynamiques et export JSON.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Section title="Métadonnées">
          <Row>
            <div>
              <Label>Pitch (1 ligne)</Label>
              <TextInput placeholder="Valeur + pour qui" {...register("pitch")} />
              {errors.pitch && <p className="mt-1 text-sm text-red-400">{errors.pitch.message}</p>}
            </div>
            <div>
              <Label>Projet / Client</Label>
              <TextInput placeholder="Nom du projet ou client" {...register("projectClient")} />
            </div>
          </Row>
          <Row>
            <div>
              <Label>Période</Label>
              <TextInput placeholder="ex. Q1–Q2 2025" {...register("period")} />
            </div>
            <div>
              <Label>Rôle</Label>
              <TextInput placeholder="ex. Lead ID & Dev Front" {...register("role")} />
            </div>
          </Row>
          <Row>
            <div>
              <Label>Parties prenantes (libre)</Label>
              <TextInput placeholder="Noms, fonctions…" {...register("stakeholders")} />
            </div>
            <div>
              <Label>Public cible</Label>
              <TextInput placeholder="Profils, effectifs, prérequis" {...register("targetAudience")} />
            </div>
          </Row>
          <div className="mt-4">
            <Label>Périmètre</Label>
            <div className="flex flex-wrap gap-2">
              {scopeOptions.map((opt) => {
                const checked = watch("scope").includes(opt);
                return (
                  <button
                    type="button"
                    key={opt}
                    className={`badge ${checked ? "bg-accent-500 text-ink-950" : ""}`}
                    onClick={() => {
                      const cur = watch("scope");
                      if (cur.includes(opt)) setValue("scope", cur.filter((v) => v !== opt));
                      else setValue("scope", [...cur, opt]);
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {errors.scope && <p className="mt-1 text-sm text-red-400">{errors.scope.message as string}</p>}
          </div>
        </Section>

        <Section title="Contexte & Problème (P de PAR)">
          <Label>Situation actuelle</Label>
          <TextArea placeholder="Décris en 3–4 lignes le contexte" {...register("context")} />
          <Row>
            <div>
              <Label>Douleurs / risques</Label>
              <ArrayEditor itemsFA={painsFA} name="pains" register={register} placeholder="Ajouter une douleur…" />
            </div>
            <div>
              <Label>Contraintes</Label>
              <ArrayEditor itemsFA={constraintsFA} name="constraints" register={register} placeholder="Ajouter une contrainte…" />
            </div>
          </Row>
          <Row>
            <div>
              <Label>Baseline — Time-to-competency</Label>
              <TextInput placeholder="ex. 10j" {...register("baseline.timeToCompetency")} />
            </div>
            <div>
              <Label>Baseline — Complétion (%)</Label>
              <TextInput placeholder="ex. 58%" {...register("baseline.completionRate")} />
            </div>
          </Row>
          <Row>
            <div>
              <Label>Baseline — CSAT (L1)</Label>
              <TextInput placeholder="ex. 3.8/5" {...register("baseline.csat")} />
            </div>
            <div>
              <Label>Baseline — KPI métier (L4)</Label>
              <TextInput placeholder="ex. T2M élevé" {...register("baseline.businessKpi")} />
            </div>
          </Row>
          <div className="mt-4">
            <Label>Hypothèses à valider</Label>
            <ArrayEditor itemsFA={hypothesesFA} name="hypotheses" register={register} placeholder="Ajouter une hypothèse…" />
          </div>
        </Section>

        <Section title="Objectifs d’apprentissage (Design pédagogique)">
          <ArrayEditor itemsFA={objectivesFA} name="learningObjectives" register={register} placeholder="Objectif mesurable (Bloom)…" />
        </Section>

        <Section title="Indicateurs de succès (Kirkpatrick)">
          <Row>
            <div>
              <Label>L1 — Cible</Label>
              <TextInput placeholder="ex. CSAT ≥ 4.5/5" {...register("kirkpatrick.l1Target")} />
            </div>
            <div>
              <Label>L2 — Cible</Label>
              <TextInput placeholder="ex. Post-test ≥ 80%" {...register("kirkpatrick.l2Target")} />
            </div>
          </Row>
          <Row>
            <div>
              <Label>L3 — Cible</Label>
              <TextInput placeholder="ex. Application à J+30" {...register("kirkpatrick.l3Target")} />
            </div>
            <div>
              <Label>L4 — Cible</Label>
              <TextInput placeholder="ex. 10→6 jours" {...register("kirkpatrick.l4Target")} />
            </div>
          </Row>
          <Row>
            <div>
              <Label>Plan — Quoi</Label>
              <TextInput placeholder="L1–L4" {...register("kirkpatrick.plan.what")} />
            </div>
            <div>
              <Label>Plan — Quand</Label>
              <TextInput placeholder="Fin / J+30 / Trimestriel" {...register("kirkpatrick.plan.when")} />
            </div>
          </Row>
          <Row>
            <div>
              <Label>Plan — Où</Label>
              <TextInput placeholder="LMS / LRS / Enquête" {...register("kirkpatrick.plan.where")} />
            </div>
            <div>
              <Label>Plan — Outil</Label>
              <TextInput placeholder="xAPI / SCORM / BI" {...register("kirkpatrick.plan.tool")} />
            </div>
          </Row>
          <div className="mt-4">
            <Label>Plan — Responsable</Label>
            <TextInput placeholder="Nom / rôle" {...register("kirkpatrick.plan.owner")} />
          </div>
        </Section>

        <Section title="Delivery (Scrum/Agile)">
          <Row>
            <div>
              <Label>Epic</Label>
              <TextInput placeholder="Objectif business de haut niveau" {...register("scrum.epic")} />
            </div>
            <div>
              <Label>Longueur du sprint</Label>
              <TextInput placeholder="ex. 2 semaines" {...register("scrum.sprintLength")} />
            </div>
          </Row>

          <div className="mt-4">
            <Label>User stories</Label>
            <div className="space-y-3">
              {storiesFA.fields.map((f, i) => (
                <div key={f.id} className="rounded-xl border border-ink-800 p-3">
                  <Row>
                    <div>
                      <Label>En tant que…</Label>
                      <TextInput {...register(`scrum.stories.${i}.asA` as const)} placeholder="Persona" />
                    </div>
                    <div>
                      <Label>Je veux…</Label>
                      <TextInput {...register(`scrum.stories.${i}.iWant` as const)} placeholder="Capacité" />
                    </div>
                  </Row>
                  <Row>
                    <div>
                      <Label>Afin de…</Label>
                      <TextInput {...register(`scrum.stories.${i}.soThat` as const)} placeholder="Valeur" />
                    </div>
                    <div>
                      <Label>Estimation (pts)</Label>
                      <TextInput type="number" min={0} {...register(`scrum.stories.${i}.estimate` as const)} />
                    </div>
                  </Row>
                  <div className="mt-2">
                    <Label>Critères d’acceptation</Label>
                    <TextArea {...register(`scrum.stories.${i}.acceptanceCriteria` as const)} placeholder="Critères testables…" />
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <button type="button" className="btn" onClick={() => storiesFA.remove(i)}>Supprimer</button>
                  </div>
                </div>
              ))}
              <button type="button" className="btn" onClick={() => storiesFA.append({ asA: "", iWant: "", soThat: "", acceptanceCriteria: "", estimate: 1 })}>
                + Ajouter une story
              </button>
            </div>
            {errors.scrum?.stories && <p className="mt-1 text-sm text-red-400">{(errors.scrum.stories as any).message}</p>}
          </div>

          <Row>
            <div>
              <Label>Definition of Ready (DoR)</Label>
              <ArrayEditor itemsFA={useFieldArray({ control, name: "scrum.dor" as any })} name="scrum.dor" register={register} placeholder="Élément DoR…" />
            </div>
            <div>
              <Label>Definition of Done (DoD)</Label>
              <ArrayEditor itemsFA={useFieldArray({ control, name: "scrum.dod" as any })} name="scrum.dod" register={register} placeholder="Élément DoD…" />
            </div>
          </Row>
        </Section>

        <Section title="ADDIE — activités & checks (libre)">
          <Row>
            <div>
              <Label>Analyse</Label>
              <ArrayEditor itemsFA={useFieldArray({ control, name: "addie.analysis" as any })} name="addie.analysis" register={register} placeholder="Activité / livrable…" />
            </div>
            <div>
              <Label>Design</Label>
              <ArrayEditor itemsFA={useFieldArray({ control, name: "addie.design" as any })} name="addie.design" register={register} placeholder="Activité / livrable…" />
            </div>
          </Row>
          <Row>
            <div>
              <Label>Développement</Label>
              <ArrayEditor itemsFA={useFieldArray({ control, name: "addie.development" as any })} name="addie.development" register={register} placeholder="Activité / livrable…" />
            </div>
            <div>
              <Label>Implémentation</Label>
              <ArrayEditor itemsFA={useFieldArray({ control, name: "addie.implementation" as any })} name="addie.implementation" register={register} placeholder="Activité / livrable…" />
            </div>
          </Row>
          <div className="mt-4">
            <Label>Évaluation</Label>
            <ArrayEditor itemsFA={useFieldArray({ control, name: "addie.evaluation" as any })} name="addie.evaluation" register={register} placeholder="Activité / livrable…" />
          </div>
        </Section>

        <Section title="Résultats (R de PAR)">
          <div className="space-y-3">
            {indicatorsFA.fields.map((f, i) => (
              <div key={f.id} className="rounded-xl border border-ink-800 p-3">
                <Row>
                  <div>
                    <Label>Indicateur</Label>
                    <TextInput {...register(`results.indicators.${i}.name` as const)} placeholder="ex. Time-to-competency" />
                  </div>
                  <div>
                    <Label>Baseline</Label>
                    <TextInput {...register(`results.indicators.${i}.baseline` as const)} placeholder="ex. 10" />
                  </div>
                </Row>
                <Row>
                  <div>
                    <Label>Cible</Label>
                    <TextInput {...register(`results.indicators.${i}.target` as const)} placeholder="ex. 6" />
                  </div>
                  <div>
                    <Label>Réel</Label>
                    <TextInput {...register(`results.indicators.${i}.actual` as const)} placeholder="ex. 6.2" />
                  </div>
                </Row>
                <div className="mt-2">
                  <Label>Écart</Label>
                  <TextInput {...register(`results.indicators.${i}.gap` as const)} placeholder="ex. -0.2" />
                </div>
                <div className="mt-3 flex justify-end">
                  <button type="button" className="btn" onClick={() => indicatorsFA.remove(i)}>Supprimer</button>
                </div>
              </div>
            ))}
            <button type="button" className="btn" onClick={() => indicatorsFA.append({ name: "", baseline: "", target: "", actual: "", gap: "" })}>
              + Ajouter un indicateur
            </button>
          </div>

          <div className="mt-4">
            <Label>Faits marquants</Label>
            <ArrayEditor itemsFA={highlightsFA} name="results.highlights" register={register} placeholder="Impact clé…" />
          </div>
        </Section>

        <Section title="Preuves & liens">
          <Row>
            <div>
              <Label>Démo / Vidéo</Label>
              <TextInput placeholder="URL…" {...register("proofs.demo")} />
            </div>
            <div>
              <Label>Repo code</Label>
              <TextInput placeholder="URL GitHub…" {...register("proofs.codeRepo")} />
            </div>
          </Row>
          <Row>
            <div>
              <Label>Dashboard</Label>
              <TextInput placeholder="URL BI / LRS…" {...register("proofs.dashboard")} />
            </div>
            <div>
              <Label>Livrables</Label>
              <ArrayEditor itemsFA={deliverablesFA} name="proofs.deliverables" register={register} placeholder="Ajoute un livrable…" />
            </div>
          </Row>
          <div className="mt-4">
            <Label>Témoignages</Label>
            <ArrayEditor itemsFA={testimonialsFA} name="proofs.testimonials" register={register} placeholder='ex. "Très clair" — Manager, 2025-06' />
          </div>
        </Section>

        <Section title="Enseignements & suites">
          <Row>
            <div>
              <Label>Ce qui a bien marché</Label>
              <ArrayEditor itemsFA={workedFA} name="learnings.worked" register={register} placeholder="Ajouter un point…" />
            </div>
            <div>
              <Label>Ce que l’on changerait</Label>
              <ArrayEditor itemsFA={changeFA} name="learnings.change" register={register} placeholder="Ajouter un point…" />
            </div>
          </Row>
          <div className="mt-4">
            <Label>Prochaines itérations</Label>
            <ArrayEditor itemsFA={nextFA} name="learnings.next" register={register} placeholder="Ajouter une itération…" />
          </div>
        </Section>

        <Section title="Accessibilité — rappel WCAG (extrait)">
          <Checklist
            value={watch("accessibilityChecklist")}
            onToggle={(item) => {
              const v = watch("accessibilityChecklist");
              setValue(
                "accessibilityChecklist",
                v.includes(item) ? v.filter((x) => x !== item) : [...v, item]
              );
            }}
            items={[
              "Alternatives textuelles",
              "Contraste ≥ 4.5:1",
              "Navigation clavier & focus visible",
              "Sous-titres / transcripts",
              "Lisibilité mobile"
            ]}
          />
        </Section>

        <Section title="Risques & RACI">
          <div className="space-y-3">
            <Label>Risques</Label>
            {risksFA.fields.map((f, i) => (
              <div key={f.id} className="rounded-xl border border-ink-800 p-3">
                <Row>
                  <div>
                    <Label>Risque</Label>
                    <TextInput {...register(`risks.${i}.risk` as const)} placeholder="Ex. indisponibilité SME" />
                  </div>
                  <div>
                    <Label>Proba</Label>
                    <select className="input" {...register(`risks.${i}.probability` as const)}>
                      <option value="L">L</option>
                      <option value="M">M</option>
                      <option value="H">H</option>
                    </select>
                  </div>
                </Row>
                <Row>
                  <div>
                    <Label>Impact</Label>
                    <select className="input" {...register(`risks.${i}.impact` as const)}>
                      <option value="L">L</option>
                      <option value="M">M</option>
                      <option value="H">H</option>
                    </select>
                  </div>
                  <div>
                    <Label>Réponse</Label>
                    <TextInput {...register(`risks.${i}.response` as const)} placeholder="Stratégie" />
                  </div>
                </Row>
                <div className="mt-2">
                  <Label>Propriétaire</Label>
                  <TextInput {...register(`risks.${i}.owner` as const)} placeholder="Nom" />
                </div>
                <div className="mt-3 flex justify-end">
                  <button type="button" className="btn" onClick={() => risksFA.remove(i)}>Supprimer</button>
                </div>
              </div>
            ))}
            <button type="button" className="btn" onClick={() => risksFA.append({ risk: "", probability: "M", impact: "M", response: "", owner: "" })}>
              + Ajouter un risque
            </button>
          </div>

          <div className="mt-6 space-y-3">
            <Label>RACI (mini)</Label>
            {raciFA.fields.map((f, i) => (
              <div key={f.id} className="rounded-xl border border-ink-800 p-3">
                <Row>
                  <div><Label>Tâche</Label><TextInput {...register(`raci.${i}.task` as const)} /></div>
                  <div><Label>R</Label><TextInput {...register(`raci.${i}.r` as const)} /></div>
                </Row>
                <Row>
                  <div><Label>A</Label><TextInput {...register(`raci.${i}.a` as const)} /></div>
                  <div><Label>C</Label><TextInput {...register(`raci.${i}.c` as const)} /></div>
                </Row>
                <div className="mt-2">
                  <Label>I</Label>
                  <TextInput {...register(`raci.${i}.i` as const)} />
                </div>
                <div className="mt-3 flex justify-end">
                  <button type="button" className="btn" onClick={() => raciFA.remove(i)}>Supprimer</button>
                </div>
              </div>
            ))}
            <button type="button" className="btn" onClick={() => raciFA.append({ task: "", r: "", a: "", c: "", i: "" })}>
              + Ajouter une ligne RACI
            </button>
          </div>
        </Section>

        <Section title="Annexes">
          <Row>
            <div>
              <Label>Énoncé xAPI (JSON / libre)</Label>
              <TextArea placeholder='{"verb": {"id": ".../answered"}}' {...register("annexes.xapi")} />
            </div>
            <div>
              <Label>Gabarit user story</Label>
              <TextArea placeholder="En tant que..., je veux..., afin de..." {...register("annexes.storyTemplate")} />
            </div>
          </Row>
          <div className="mt-4">
            <Label>Liens utiles</Label>
            <ArrayEditor itemsFA={linksFA} name="annexes.links" register={register} placeholder="URL Notion / Drive / Confluence…" />
          </div>
        </Section>

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn btn-primary">Valider & Prévisualiser JSON</button>
          <button type="button" className="btn" onClick={downloadJson}>Télécharger JSON</button>
          <button type="button" className="btn" onClick={downloadCsv}>Télécharger CSV</button>
          <button type="button" className="btn" onClick={downloadPdf}>Télécharger PDF</button>
          <button type="button" className="btn" onClick={copyJson}>Copier JSON</button>
          <button type="button" className="btn" onClick={handleReset}>Réinitialiser</button>
          <button type="button" className="btn" onClick={() => fileInputRef.current?.click()}>Importer JSON</button>
          <input type="file" accept="application/json" ref={fileInputRef} onChange={handleImportJson} className="hidden" />
        </div>
      </form>

      <Section title="Prévisualisation JSON (live)">
        <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-ink-800 bg-ink-900/60 p-4 text-xs">
          {jsonPreview}
        </pre>
      </Section>

      <p className="text-center text-xs text-ink-500">
        Astuce : tu pourras plus tard brancher une API Route ou une action serveur pour persister ce JSON.
      </p>
    </div>
  );
}

// --------- Small reusable components ----------
function ArrayEditor({
  itemsFA,
  name,
  register,
  placeholder
}: {
  itemsFA: ReturnType<typeof useFieldArray<any>>;
  name: string;
  register: UseFormRegister<FormData>;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      {itemsFA.fields.map((field: any, index: number) => (
        <div key={field.id} className="flex gap-2">
          <input className="input" {...register(`${name}.${index}` as any)} placeholder={placeholder} />
          <button type="button" className="btn" onClick={() => itemsFA.remove(index)}>–</button>
        </div>
      ))}
      <button type="button" className="btn" onClick={() => itemsFA.append("")}>+ Ajouter</button>
    </div>
  );
}

function Checklist({
  items,
  value,
  onToggle
}: {
  items: string[];
  value: string[];
  onToggle: (item: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => {
        const active = value.includes(it);
        return (
          <button
            key={it}
            type="button"
            className={`badge ${active ? "bg-accent-500 text-ink-950" : ""}`}
            onClick={() => onToggle(it)}
            title={it}
          >
            {it}
          </button>
        );
      })}
    </div>
  );
}
