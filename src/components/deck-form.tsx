import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export const deckFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
});

export type DeckFormData = z.infer<typeof deckFormSchema>;

interface DeckFormProps {
  initialData?: Partial<DeckFormData>;
  onSubmit: (data: DeckFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export function DeckForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Submit",
  isLoading = false,
}: DeckFormProps) {
  const form = useForm<DeckFormData>({
    resolver: zodResolver(deckFormSchema),
    defaultValues: {
      name: initialData?.name || "",
    },
  });

  const handleSubmit = async (data: DeckFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid gap-4 py-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter deck name..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading || form.formState.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || form.formState.isSubmitting}
          >
            {isLoading || form.formState.isSubmitting
              ? "Loading..."
              : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
