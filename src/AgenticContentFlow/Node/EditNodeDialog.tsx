/** @format */
import { NodeData } from "../types";
import { useNodeEditForm } from "./hooks/useNodeEditForm";
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface EditNodeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (updates: Partial<NodeData>) => void;
  nodeData: NodeData; // Made required since useNodeEditForm needs it
}

export const EditNodeDialog = ({
  open,
  onClose,
  onSave,
  nodeData,
}: EditNodeDialogProps) => {
  const { formData, isValid, updateField, handleSave, handleKeyDown } =
    useNodeEditForm({
      open,
      nodeData,
      onSave,
      onClose,
    });

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[425px]" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>Edit Node</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              autoFocus
              className={cn(
                !formData.label?.trim() && "border-red-500 focus-visible:ring-red-500"
              )}
              value={formData.label || ""}
              onChange={(e) => updateField("label", e.target.value)}
            />
            {!formData.label?.trim() && (
              <p className="text-sm text-red-500">Label is required</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="difficulty-level">Difficulty Level</Label>
            <Select
              value={formData.nodeLevel as string || "basic"}
              onValueChange={(value) => updateField("nodeLevel", value)}
            >
              <SelectTrigger id="difficulty-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="details">Details</Label>
            <Textarea
              id="details"
              className={cn(
                formData.details !== undefined && !formData.details.trim() && "border-red-500 focus-visible:ring-red-500"
              )}
              rows={4}
              value={formData.details || ""}
              onChange={(e) => updateField("details", e.target.value)}
            />
            {formData.details !== undefined && !formData.details.trim() && (
              <p className="text-sm text-red-500">Details cannot be empty if provided</p>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground">
            Press Ctrl/⌘ + Enter to save
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!isValid}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
