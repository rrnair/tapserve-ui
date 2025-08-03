import { Label } from "@/components/ui/label"
import MultipleSelector, { Option } from "@/components/ui/multiselect"

/** Example usage */
/**
 * const frameworks: Option[] = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
  {
    value: "angular",
    label: "Angular",
  },
  {
    value: "vue",
    label: "Vue.js",
  },
  {
    value: "react",
    label: "React",
  },
  {
    value: "ember",
    label: "Ember.js",
  },
  {
    value: "gatsby",
    label: "Gatsby",
  },
  {
    value: "eleventy",
    label: "Eleventy",
  },
  {
    value: "solid",
    label: "SolidJS",
  },
  {
    value: "preact",
    label: "Preact",
  },
  {
    value: "qwik",
    label: "Qwik",
  },
  {
    value: "alpine",
    label: "Alpine.js",
  },
  {
    value: "lit",
    label: "Lit",
  },
]
**/
interface SelectWithMultiSearchProps {
  options: Option[]
  value?: Option[]
  onChange?: (options: Option[]) => void
  placeholder?: string
  label?: string
  className?: string
}

export default function SelectWithMultiSearch({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  label,
  className
}: SelectWithMultiSearchProps) {
  console.log(`[SelectWithMultiSearch] ${label}:`, { 
    optionsLength: options?.length || 0, 
    options: options?.slice(0, 3), 
    value: value?.length || 0 
  });

  return (
    <div className={className}>
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <MultipleSelector
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        emptyIndicator={<p className="text-center text-sm">No results found</p>}
        maxSelected={10}
        hidePlaceholderWhenSelected
        triggerSearchOnFocus
      />
    </div>
  )
}
