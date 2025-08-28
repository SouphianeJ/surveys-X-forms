import { useFieldArray, UseFormRegister } from "react-hook-form";
import { FormData } from "./schema";

export function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
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

export function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="label">{children}</label>;
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`input ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`textarea ${props.className ?? ""}`} />;
}

export function ArrayEditor({
  itemsFA,
  name,
  register,
  placeholder,
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
          <button type="button" className="btn" onClick={() => itemsFA.remove(index)}>
            –
          </button>
        </div>
      ))}
      <button type="button" className="btn" onClick={() => itemsFA.append("")}>
        + Ajouter
      </button>
    </div>
  );
}

export function Checklist({
  items,
  value,
  onToggle,
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