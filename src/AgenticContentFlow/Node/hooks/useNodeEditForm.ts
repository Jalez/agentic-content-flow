/** @format */
import { useState, useEffect, useMemo } from "react";
import { NodeData } from "../../types";

interface UseNodeEditFormConfig {
  open: boolean;
  nodeData: NodeData;
  onSave: (updates: Partial<NodeData>) => void;
  onClose: () => void;
}

export const useNodeEditForm = ({
  open,
  nodeData,
  onSave,
  onClose,
}: UseNodeEditFormConfig) => {
  const [formData, setFormData] = useState<Partial<NodeData>>({
    label: nodeData.label,
    details: nodeData.details,
    nodeLevel: nodeData.nodeLevel,
  });

  useEffect(() => {
    if (open) {
      setFormData({
        label: nodeData.label,
        details: nodeData.details,
        nodeLevel: nodeData.nodeLevel,
      });
    }
  }, [open, nodeData]);

  const isValid = useMemo(
    () =>
      Boolean(formData.label?.trim().length) &&
      (!formData.details || formData.details?.trim().length > 0),
    [formData]
  );

  const handleSave = () => {
    if (!isValid) return;

    const updates: Partial<NodeData> = {
      label: formData.label ? formData.label.trim() : "",
      nodeLevel: formData.nodeLevel,
    };

    if (formData.details !== undefined) {
      updates.details = formData.details.trim();
    }

    onSave(updates);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && isValid) {
      handleSave();
    }
  };

  const updateField = (field: keyof NodeData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    isValid,
    updateField,
    handleSave,
    handleKeyDown,
  };
};
