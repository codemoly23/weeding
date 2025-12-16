"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
  Info,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Types
interface FormField {
  id: string;
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  helpText?: string;
  width: string;
  required: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  options?: Array<{ value: string; label: string }>;
  dataSourceType?: string;
  dataSourceKey?: string;
  dependsOn?: string;
  conditionalLogic?: {
    show?: boolean;
    when?: string;
    operator?: string;
    value?: string | string[];
  };
  accept?: string;
  maxSize?: number;
  defaultValue?: string;
}

interface FormTab {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  order: number;
  fields: FormField[];
}

interface FormTemplate {
  id: string;
  version: number;
  tabs: FormTab[];
}

interface ListItem {
  value: string;
  label: string;
  code?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
  isPopular?: boolean;
}

interface DynamicFormRendererProps {
  template: FormTemplate;
  onSubmit: (data: Record<string, unknown>) => void;
  onStepChange?: (step: number) => void;
  isSubmitting?: boolean;
  initialData?: Record<string, unknown>;
}

// Build Zod schema from form fields
function buildValidationSchema(tabs: FormTab[]): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};

  tabs.forEach((tab) => {
    tab.fields.forEach((field) => {
      // Skip non-input fields
      if (["heading", "paragraph", "divider"].includes(field.type)) {
        return;
      }

      let fieldSchema: z.ZodTypeAny;

      switch (field.type) {
        case "email":
          fieldSchema = z.string().email("Invalid email address");
          break;
        case "phone":
          fieldSchema = z.string().regex(/^[+]?[\d\s-()]+$/, "Invalid phone number");
          break;
        case "number":
          fieldSchema = z.coerce.number();
          if (field.validation?.min !== undefined) {
            fieldSchema = (fieldSchema as z.ZodNumber).min(field.validation.min);
          }
          if (field.validation?.max !== undefined) {
            fieldSchema = (fieldSchema as z.ZodNumber).max(field.validation.max);
          }
          break;
        case "date":
          fieldSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date");
          break;
        case "checkbox":
          fieldSchema = z.boolean();
          break;
        case "file_upload":
        case "image_upload":
          fieldSchema = z.any();
          break;
        case "multi_select":
        case "checkbox_group":
          fieldSchema = z.array(z.string());
          break;
        default:
          fieldSchema = z.string();
          if (field.validation?.minLength) {
            fieldSchema = (fieldSchema as z.ZodString).min(
              field.validation.minLength,
              `Minimum ${field.validation.minLength} characters`
            );
          }
          if (field.validation?.maxLength) {
            fieldSchema = (fieldSchema as z.ZodString).max(
              field.validation.maxLength,
              `Maximum ${field.validation.maxLength} characters`
            );
          }
          if (field.validation?.pattern) {
            fieldSchema = (fieldSchema as z.ZodString).regex(
              new RegExp(field.validation.pattern),
              "Invalid format"
            );
          }
      }

      // Make optional if not required
      if (!field.required) {
        fieldSchema = fieldSchema.optional().or(z.literal(""));
      }

      shape[field.name] = fieldSchema;
    });
  });

  return z.object(shape);
}

// Get field width class
function getWidthClass(width: string): string {
  switch (width) {
    case "half":
      return "sm:col-span-1";
    case "third":
      return "sm:col-span-1 lg:col-span-1";
    case "two_third":
      return "sm:col-span-2 lg:col-span-2";
    default:
      return "sm:col-span-2";
  }
}

export function DynamicFormRenderer({
  template,
  onSubmit,
  onStepChange,
  isSubmitting = false,
  initialData = {},
}: DynamicFormRendererProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [listData, setListData] = useState<Record<string, ListItem[]>>({});
  const [loadingLists, setLoadingLists] = useState<Record<string, boolean>>({});

  // Build validation schema
  const validationSchema = buildValidationSchema(template.tabs);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: initialData,
    mode: "onBlur",
  });

  const currentTab = template.tabs[currentStep];
  const isLastStep = currentStep === template.tabs.length - 1;

  // Watch all values for conditional logic
  const formValues = watch();

  // Fetch list data
  const fetchListData = useCallback(async (key: string, parentId?: string) => {
    const cacheKey = parentId ? `${key}_${parentId}` : key;

    if (listData[cacheKey] || loadingLists[cacheKey]) {
      return;
    }

    setLoadingLists((prev) => ({ ...prev, [cacheKey]: true }));

    try {
      let url = `/api/lists/${key}`;
      if (parentId) {
        url += `?parentId=${parentId}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setListData((prev) => ({ ...prev, [cacheKey]: data.items || [] }));
      }
    } catch (error) {
      console.error("Error fetching list:", error);
    } finally {
      setLoadingLists((prev) => ({ ...prev, [cacheKey]: false }));
    }
  }, [listData, loadingLists]);

  // Fetch required lists on mount and when dependencies change
  useEffect(() => {
    currentTab?.fields.forEach((field) => {
      if (field.dataSourceType && field.dataSourceKey) {
        if (field.dataSourceType === "state_list" && field.dependsOn) {
          // Fetch states based on selected country
          const countryValue = formValues[field.dependsOn];
          if (countryValue) {
            fetchListData(field.dataSourceKey, countryValue);
          }
        } else if (
          ["country_list", "currency_list", "custom_list"].includes(
            field.dataSourceType
          )
        ) {
          fetchListData(field.dataSourceKey);
        }
      }
    });
  }, [currentStep, formValues, currentTab, fetchListData]);

  // Check if field should be visible based on conditional logic
  const isFieldVisible = (field: FormField): boolean => {
    if (!field.conditionalLogic) return true;

    const { show, when, operator, value } = field.conditionalLogic;
    if (!when) return true;

    const watchedValue = formValues[when];

    let conditionMet = false;
    switch (operator) {
      case "equals":
        conditionMet = watchedValue === value;
        break;
      case "not_equals":
        conditionMet = watchedValue !== value;
        break;
      case "contains":
        conditionMet = Array.isArray(value)
          ? value.includes(watchedValue)
          : String(watchedValue).includes(String(value));
        break;
      case "not_empty":
        conditionMet = !!watchedValue && watchedValue !== "";
        break;
      case "empty":
        conditionMet = !watchedValue || watchedValue === "";
        break;
      default:
        conditionMet = true;
    }

    return show ? conditionMet : !conditionMet;
  };

  // Handle next step
  const handleNext = async () => {
    // Validate current tab fields
    const fieldsToValidate = currentTab.fields
      .filter((f) => !["heading", "paragraph", "divider"].includes(f.type))
      .filter(isFieldVisible)
      .map((f) => f.name);

    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      if (isLastStep) {
        handleSubmit(onSubmit)();
      } else {
        setCurrentStep((prev) => prev + 1);
        onStepChange?.(currentStep + 1);
      }
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      onStepChange?.(currentStep - 1);
    }
  };

  // Render field based on type
  const renderField = (field: FormField) => {
    if (!isFieldVisible(field)) return null;

    const error = errors[field.name];
    const widthClass = getWidthClass(field.width);

    // Non-input fields
    if (field.type === "heading") {
      return (
        <div key={field.id} className={cn("col-span-full", widthClass)}>
          <h3 className="text-lg font-semibold">{field.label}</h3>
        </div>
      );
    }

    if (field.type === "paragraph") {
      return (
        <div key={field.id} className={cn("col-span-full", widthClass)}>
          <p className="text-sm text-muted-foreground">{field.label}</p>
        </div>
      );
    }

    if (field.type === "divider") {
      return (
        <div key={field.id} className="col-span-full">
          <hr className="border-border" />
        </div>
      );
    }

    // Input fields
    const fieldLabel = (
      <div className="flex items-center gap-1">
        <Label htmlFor={field.name}>
          {field.label}
          {field.required && <span className="text-destructive">*</span>}
        </Label>
        {field.helpText && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{field.helpText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );

    switch (field.type) {
      case "text":
      case "email":
      case "phone":
      case "number":
      case "date":
        return (
          <div key={field.id} className={cn("space-y-2", widthClass)}>
            {fieldLabel}
            <Input
              id={field.name}
              type={field.type === "phone" ? "tel" : field.type}
              placeholder={field.placeholder}
              {...register(field.name)}
              className={cn(error && "border-destructive")}
            />
            {error && (
              <p className="text-xs text-destructive">{error.message as string}</p>
            )}
          </div>
        );

      case "textarea":
        return (
          <div key={field.id} className={cn("space-y-2", widthClass)}>
            {fieldLabel}
            <Textarea
              id={field.name}
              placeholder={field.placeholder}
              {...register(field.name)}
              className={cn(error && "border-destructive")}
              rows={4}
            />
            {error && (
              <p className="text-xs text-destructive">{error.message as string}</p>
            )}
          </div>
        );

      case "select":
      case "country_select":
      case "state_select":
        const listKey = field.dataSourceKey || field.name;
        const dependsOnValue = field.dependsOn ? formValues[field.dependsOn] : null;
        const cacheKey = dependsOnValue ? `${listKey}_${dependsOnValue}` : listKey;
        const options = field.options || listData[cacheKey] || [];
        const isLoading = loadingLists[cacheKey];

        return (
          <div key={field.id} className={cn("space-y-2", widthClass)}>
            {fieldLabel}
            <Controller
              name={field.name}
              control={control}
              render={({ field: controllerField }) => (
                <Select
                  value={controllerField.value || ""}
                  onValueChange={(value) => {
                    controllerField.onChange(value);
                    // Clear dependent fields when this field changes
                    template.tabs.forEach((tab) => {
                      tab.fields.forEach((f) => {
                        if (f.dependsOn === field.name) {
                          setValue(f.name, "");
                        }
                      });
                    });
                  }}
                  disabled={isLoading || (field.dependsOn && !dependsOnValue)}
                >
                  <SelectTrigger className={cn(error && "border-destructive")}>
                    <SelectValue
                      placeholder={
                        isLoading
                          ? "Loading..."
                          : field.placeholder || "Select..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.icon && <span className="mr-2">{opt.icon}</span>}
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {error && (
              <p className="text-xs text-destructive">{error.message as string}</p>
            )}
          </div>
        );

      case "radio":
        return (
          <div key={field.id} className={cn("space-y-2", widthClass)}>
            {fieldLabel}
            <Controller
              name={field.name}
              control={control}
              render={({ field: controllerField }) => (
                <RadioGroup
                  value={controllerField.value}
                  onValueChange={controllerField.onChange}
                  className="flex flex-col space-y-1"
                >
                  {(field.options || []).map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt.value} id={`${field.name}-${opt.value}`} />
                      <Label htmlFor={`${field.name}-${opt.value}`}>{opt.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
            {error && (
              <p className="text-xs text-destructive">{error.message as string}</p>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div key={field.id} className={cn("flex items-center space-x-2", widthClass)}>
            <Controller
              name={field.name}
              control={control}
              render={({ field: controllerField }) => (
                <Checkbox
                  id={field.name}
                  checked={controllerField.value}
                  onCheckedChange={controllerField.onChange}
                />
              )}
            />
            <Label htmlFor={field.name} className="text-sm font-normal">
              {field.label}
              {field.required && <span className="text-destructive">*</span>}
            </Label>
            {error && (
              <p className="text-xs text-destructive">{error.message as string}</p>
            )}
          </div>
        );

      case "file_upload":
      case "image_upload":
        return (
          <div key={field.id} className={cn("space-y-2", widthClass)}>
            {fieldLabel}
            <div
              className={cn(
                "relative flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary",
                error && "border-destructive"
              )}
            >
              <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
              {field.accept && (
                <p className="text-xs text-muted-foreground">
                  Accepted: {field.accept}
                </p>
              )}
              {field.maxSize && (
                <p className="text-xs text-muted-foreground">
                  Max size: {field.maxSize}MB
                </p>
              )}
              <Input
                id={field.name}
                type="file"
                accept={field.accept}
                className="absolute inset-0 cursor-pointer opacity-0"
                {...register(field.name)}
              />
            </div>
            {error && (
              <p className="text-xs text-destructive">{error.message as string}</p>
            )}
          </div>
        );

      default:
        return (
          <div key={field.id} className={cn("space-y-2", widthClass)}>
            {fieldLabel}
            <Input
              id={field.name}
              placeholder={field.placeholder}
              {...register(field.name)}
              className={cn(error && "border-destructive")}
            />
            {error && (
              <p className="text-xs text-destructive">{error.message as string}</p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {template.tabs.map((tab, index) => (
          <div
            key={tab.id}
            className={cn(
              "flex items-center",
              index < template.tabs.length - 1 && "flex-1"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors",
                index === currentStep
                  ? "bg-primary text-primary-foreground"
                  : index < currentStep
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {index < currentStep ? (
                <Check className="h-5 w-5" />
              ) : (
                index + 1
              )}
            </div>
            {index < template.tabs.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-0.5 flex-1",
                  index < currentStep ? "bg-primary/20" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Tab Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold">{currentTab.name}</h2>
        {currentTab.description && (
          <p className="text-muted-foreground">{currentTab.description}</p>
        )}
      </div>

      {/* Form Fields */}
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="grid gap-4 sm:grid-cols-2">
          {currentTab.fields.map(renderField)}
        </div>
      </form>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button type="button" onClick={handleNext} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : isLastStep ? (
            <>
              Submit
              <Check className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
