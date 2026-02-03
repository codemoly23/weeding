"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Trash2, GripVertical, Copy, ChevronDown } from "lucide-react";
import type {
  LeadFormWidgetSettings,
  LeadFormField,
  FormFieldType,
  FormSubmitTo,
} from "@/lib/page-builder/types";
import { DEFAULT_LEAD_FORM_SETTINGS } from "@/lib/page-builder/defaults";
import { generateId } from "@/lib/page-builder/widget-registry";
import {
  SelectInput,
  NumberInput,
  ColorInput,
  TextInput,
  ToggleSwitch,
} from "@/app/admin/appearance/landing-page/components/ui/form-controls";
import { AccordionSection } from "@/app/admin/appearance/landing-page/components/ui/accordion-section";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Field type options
const FIELD_TYPE_OPTIONS = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "select", label: "Dropdown" },
  { value: "textarea", label: "Textarea" },
];

// Options input component - allows typing commas freely
interface OptionsInputProps {
  value: string[];
  onChange: (options: string[]) => void;
}

function OptionsInput({ value, onChange }: OptionsInputProps) {
  // Keep local state for the raw text input
  const [localValue, setLocalValue] = useState(value.join(", "));

  // Update local value when external value changes (e.g., from undo/redo)
  useEffect(() => {
    setLocalValue(value.join(", "));
  }, [value]);

  // Only parse and update parent on blur
  const handleBlur = () => {
    const options = localValue
      .split(",")
      .map((opt) => opt.trim())
      .filter(Boolean);
    onChange(options);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">Options</label>
      <Input
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          e.stopPropagation();
          // Also save on Enter
          if (e.key === "Enter") {
            handleBlur();
          }
        }}
        placeholder="Option 1, Option 2, Option 3"
      />
      <p className="text-xs text-muted-foreground">Comma-separated list of options</p>
    </div>
  );
}

interface SortableFieldItemProps {
  field: LeadFormField;
  index: number;
  onUpdate: (id: string, updates: Partial<LeadFormField>) => void;
  onDelete: (id: string) => void;
  onCopy: (id: string) => void;
}

function SortableFieldItem({
  field,
  index,
  onUpdate,
  onDelete,
  onCopy,
}: SortableFieldItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-lg border bg-card transition-colors",
        isDragging && "opacity-50 shadow-lg z-50"
      )}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-2 p-3">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">{index + 1}</span>
          </div>

          {/* Field Label */}
          <div className="flex-1">
            <Input
              value={field.label}
              onChange={(e) => onUpdate(field.id, { label: e.target.value })}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="Field label..."
              className="h-9"
            />
          </div>

          {/* Field Type Badge */}
          <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
            {field.type}
          </span>

          {/* Expand/Collapse */}
          <CollapsibleTrigger asChild>
            <button
              className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title={isOpen ? "Collapse" : "Expand"}
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </button>
          </CollapsibleTrigger>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onCopy(field.id)}
              className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Duplicate"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(field.id)}
              className="flex h-7 w-7 items-center justify-center rounded text-destructive/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Expanded Content */}
        <CollapsibleContent>
          <div className="border-t p-3 space-y-3">
            <SelectInput
              label="Field Type"
              value={field.type}
              onChange={(v) => onUpdate(field.id, { type: v as FormFieldType })}
              options={FIELD_TYPE_OPTIONS}
            />

            <TextInput
              label="Field Name"
              value={field.name}
              onChange={(v) => onUpdate(field.id, { name: v })}
              placeholder="e.g., email, phone, company"
              description="Internal name for form data (no spaces)"
            />

            <TextInput
              label="Placeholder"
              value={field.placeholder || ""}
              onChange={(v) => onUpdate(field.id, { placeholder: v })}
              placeholder="Enter placeholder text..."
            />

            <ToggleSwitch
              label="Required"
              checked={field.required}
              onChange={(checked) => onUpdate(field.id, { required: checked })}
            />

            {/* Options for Select type */}
            {field.type === "select" && (
              <OptionsInput
                value={field.options || []}
                onChange={(options) => onUpdate(field.id, { options })}
              />
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

interface LeadFormWidgetSettingsPanelProps {
  settings: Partial<LeadFormWidgetSettings>;
  onChange: (settings: LeadFormWidgetSettings) => void;
  activeTab?: "content" | "style" | "advanced";
}

export function LeadFormWidgetSettingsPanel({
  settings: partialSettings,
  onChange,
  activeTab = "content",
}: LeadFormWidgetSettingsPanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    })
  );

  // Merge with defaults
  const settings: LeadFormWidgetSettings = {
    ...DEFAULT_LEAD_FORM_SETTINGS,
    ...partialSettings,
    submitButton: {
      ...DEFAULT_LEAD_FORM_SETTINGS.submitButton,
      ...partialSettings?.submitButton,
    },
  };

  const updateField = <K extends keyof LeadFormWidgetSettings>(
    key: K,
    value: LeadFormWidgetSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  const updateSubmitButton = (
    key: keyof LeadFormWidgetSettings["submitButton"],
    value: unknown
  ) => {
    onChange({
      ...settings,
      submitButton: { ...settings.submitButton, [key]: value },
    });
  };

  const addFormField = useCallback(() => {
    const newField: LeadFormField = {
      id: generateId("field"),
      type: "text",
      name: `field_${settings.fields.length + 1}`,
      label: "New Field",
      placeholder: "",
      required: false,
    };
    onChange({ ...settings, fields: [...settings.fields, newField] });
  }, [settings, onChange]);

  const updateFormField = useCallback(
    (id: string, updates: Partial<LeadFormField>) => {
      onChange({
        ...settings,
        fields: settings.fields.map((field) =>
          field.id === id ? { ...field, ...updates } : field
        ),
      });
    },
    [settings, onChange]
  );

  const removeFormField = useCallback(
    (id: string) => {
      onChange({
        ...settings,
        fields: settings.fields.filter((field) => field.id !== id),
      });
    },
    [settings, onChange]
  );

  const copyFormField = useCallback(
    (id: string) => {
      const fieldToCopy = settings.fields.find((f) => f.id === id);
      if (!fieldToCopy) return;

      const index = settings.fields.findIndex((f) => f.id === id);
      const newField: LeadFormField = {
        ...fieldToCopy,
        id: generateId("field"),
        name: `${fieldToCopy.name}_copy`,
      };
      const newFields = [...settings.fields];
      newFields.splice(index + 1, 0, newField);
      onChange({ ...settings, fields: newFields });
    },
    [settings, onChange]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = settings.fields.findIndex((f) => f.id === active.id);
        const newIndex = settings.fields.findIndex((f) => f.id === over.id);
        onChange({
          ...settings,
          fields: arrayMove(settings.fields, oldIndex, newIndex),
        });
      }
    },
    [settings, onChange]
  );

  // Content Tab
  const renderContentTab = () => (
    <div className="space-y-4">
      {/* Form Header */}
      <AccordionSection title="Form Header" defaultOpen>
        <div className="space-y-3">
          <TextInput
            label="Title"
            value={settings.title || ""}
            onChange={(v) => updateField("title", v)}
            placeholder="Form title..."
          />
          <TextInput
            label="Description"
            value={settings.description || ""}
            onChange={(v) => updateField("description", v)}
            placeholder="Form description..."
          />
        </div>
      </AccordionSection>

      {/* Form Fields */}
      <AccordionSection title="Form Fields" defaultOpen>
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">
              {settings.fields.length} field{settings.fields.length !== 1 ? "s" : ""}
            </span>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={settings.fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {settings.fields.map((field, index) => (
                  <SortableFieldItem
                    key={field.id}
                    field={field}
                    index={index}
                    onUpdate={updateFormField}
                    onDelete={removeFormField}
                    onCopy={copyFormField}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <Button
            variant="outline"
            size="sm"
            onClick={addFormField}
            className="w-full mt-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Field
          </Button>
        </div>
      </AccordionSection>

      {/* Submit Button */}
      <AccordionSection title="Submit Button" defaultOpen>
        <div className="space-y-3">
          <TextInput
            label="Button Text"
            value={settings.submitButton.text}
            onChange={(v) => updateSubmitButton("text", v)}
            placeholder="Submit"
          />
          <ToggleSwitch
            label="Full Width"
            checked={settings.submitButton.fullWidth}
            onChange={(checked) => updateSubmitButton("fullWidth", checked)}
          />
        </div>
      </AccordionSection>

      {/* Success Message */}
      <AccordionSection title="Success Message">
        <TextInput
          label="Message"
          value={settings.successMessage}
          onChange={(v) => updateField("successMessage", v)}
          placeholder="Thank you for your submission!"
        />
      </AccordionSection>
    </div>
  );

  // Style Tab
  const renderStyleTab = () => (
    <div className="space-y-4">
      <AccordionSection title="Container Style" defaultOpen>
        <div className="space-y-3">
          <ColorInput
            label="Background Color"
            value={settings.backgroundColor || "#1e293b"}
            onChange={(v) => updateField("backgroundColor", v)}
          />
          <ColorInput
            label="Title Color"
            value={settings.titleColor || "#ffffff"}
            onChange={(v) => updateField("titleColor", v)}
          />
          <ColorInput
            label="Description Color"
            value={settings.descriptionColor || "#94a3b8"}
            onChange={(v) => updateField("descriptionColor", v)}
          />
          <ColorInput
            label="Label Color"
            value={settings.labelColor || "#e2e8f0"}
            onChange={(v) => updateField("labelColor", v)}
          />
          <ColorInput
            label="Input Text Color"
            value={settings.inputTextColor || "#ffffff"}
            onChange={(v) => updateField("inputTextColor", v)}
          />
          <NumberInput
            label="Padding"
            value={settings.padding}
            onChange={(v) => updateField("padding", v)}
            min={0}
            max={64}
            step={4}
            unit="px"
          />
          <NumberInput
            label="Border Radius"
            value={settings.borderRadius}
            onChange={(v) => updateField("borderRadius", v)}
            min={0}
            max={32}
            step={2}
            unit="px"
          />
          <ToggleSwitch
            label="Shadow"
            checked={settings.shadow}
            onChange={(checked) => updateField("shadow", checked)}
          />
        </div>
      </AccordionSection>

      <AccordionSection title="Button Style">
        <div className="space-y-3">
          <ColorInput
            label="Button Background"
            value={settings.submitButton.style?.bgColor || "#f97316"}
            onChange={(v) =>
              updateSubmitButton("style", {
                ...settings.submitButton.style,
                bgColor: v,
              })
            }
          />
          <ColorInput
            label="Button Text Color"
            value={settings.submitButton.style?.textColor || "#ffffff"}
            onChange={(v) =>
              updateSubmitButton("style", {
                ...settings.submitButton.style,
                textColor: v,
              })
            }
          />
          <NumberInput
            label="Button Border Radius"
            value={settings.submitButton.style?.borderRadius || 6}
            onChange={(v) =>
              updateSubmitButton("style", {
                ...settings.submitButton.style,
                borderRadius: v,
              })
            }
            min={0}
            max={24}
            step={2}
            unit="px"
          />
        </div>
      </AccordionSection>
    </div>
  );

  // Advanced Tab
  const renderAdvancedTab = () => (
    <div className="space-y-4">
      <AccordionSection title="Form Submission" defaultOpen>
        <div className="space-y-3">
          <SelectInput
            label="Submit To"
            value={settings.submitTo}
            onChange={(v) => updateField("submitTo", v as FormSubmitTo)}
            options={[
              { value: "database", label: "Database (Save Locally)" },
              { value: "webhook", label: "Webhook URL" },
              { value: "email", label: "Email" },
            ]}
          />

          {settings.submitTo === "webhook" && (
            <TextInput
              label="Webhook URL"
              value={settings.webhookUrl || ""}
              onChange={(v) => updateField("webhookUrl", v)}
              placeholder="https://..."
              description="URL to send form data to"
            />
          )}

          {settings.submitTo === "email" && (
            <TextInput
              label="Email Address"
              value={settings.emailTo || ""}
              onChange={(v) => updateField("emailTo", v)}
              placeholder="admin@example.com"
              description="Email to receive form submissions"
            />
          )}
        </div>
      </AccordionSection>
    </div>
  );

  return (
    <>
      {activeTab === "content" && renderContentTab()}
      {activeTab === "style" && renderStyleTab()}
      {activeTab === "advanced" && renderAdvancedTab()}
    </>
  );
}
