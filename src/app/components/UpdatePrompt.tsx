import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';

interface UpdatePromptProps {
  open: boolean;
  onUpdate: () => void;
  onDismiss: () => void;
}

export function UpdatePrompt({ open, onUpdate, onDismiss }: UpdatePromptProps) {
  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && onDismiss()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>發現新版本</AlertDialogTitle>
          <AlertDialogDescription>
            有可用的更新版本，是否要立即更新？您的資料都儲存在本地，更新不會影響您的待辦事項。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onDismiss}>稍後再說</AlertDialogCancel>
          <AlertDialogAction onClick={onUpdate}>立即更新</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
