import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import React, { useState } from "react";
import { Input } from "~/components/ui/input";

interface UserPromptProps {
  onConfirm: (value: string) => void;
}

export default function UserPrompt({ onConfirm }: UserPromptProps) {
  const [open, setOpen] = useState(true);
  const [customSize, setCustomSize] = useState("23px");

  const handleConfirm = () => {
    if (!customSize) {
      setCustomSize("23px");
    }
    onConfirm(customSize);
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="bg-white dark:bg-black text-black dark:text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Custom Font Size</AlertDialogTitle>
          <AlertDialogDescription>
            Enter a custom font size
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          value={customSize}
          onChange={(e) => setCustomSize(e.target.value)}
          placeholder="23px"
        />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
