import useModal from "@/hooks/use-modal";
import {
  Dialog,
  DialogContent,
  DialogContentWrapper,
  DialogHeader,
  DialogMiniPadding,
  DialogTitle,
} from "@/components/ui/dialog";
import DropZone from "@/components/dropzone";

const UploadImage = ({ noteId }: { noteId: string }) => {
  const { type, onClose } = useModal();
  const isModalOpen = type === "upload-image";

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader className="hidden">
          <DialogTitle>Upload Image</DialogTitle>
        </DialogHeader>
        <DialogMiniPadding>
          <DialogContentWrapper className="p-0">
            <DropZone type="mediaUploader" noteId={noteId} />
          </DialogContentWrapper>
        </DialogMiniPadding>
      </DialogContent>
    </Dialog>
  );
};

export default UploadImage;
