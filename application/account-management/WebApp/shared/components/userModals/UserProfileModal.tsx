import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { FileTrigger, Form, Heading, Label } from "react-aria-components";
import { Menu, MenuItem, MenuSeparator, MenuTrigger } from "@repo/ui/components/Menu";
import { CameraIcon, Trash2Icon, XIcon } from "lucide-react";
import { Button } from "@repo/ui/components/Button";
import { Dialog } from "@repo/ui/components/Dialog";
import { Modal } from "@repo/ui/components/Modal";
import { TextField } from "@repo/ui/components/TextField";
import { api, type Schemas } from "@/shared/lib/api/client";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { AuthenticationContext } from "@repo/infrastructure/auth/AuthenticationProvider";
import { useMutation } from "@tanstack/react-query";
import { mutationSubmitter } from "@repo/ui/forms/mutationSubmitter";
import { FormErrorMessage } from "@repo/ui/components/FormErrorMessage";

const MAX_FILE_SIZE = 1024 * 1024; // 1MB in bytes
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]; // Align with backend

type ProfileModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

type ProfileDialogProps = ProfileModalProps & {
  onIsLoadingChange: (isLoading: boolean) => void;
};

export default function UserProfileModal({ isOpen, onOpenChange }: Readonly<ProfileModalProps>) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable={!isLoading}>
      <UserProfileDialog isOpen={isOpen} onOpenChange={onOpenChange} onIsLoadingChange={setIsLoading} />
    </Modal>
  );
}

function UserProfileDialog({ onOpenChange, onIsLoadingChange }: Readonly<ProfileDialogProps>) {
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [removeAvatarFlag, setRemoveAvatarFlag] = useState(false);

  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  const { updateUserInfo } = useContext(AuthenticationContext);

  const { data: user, isLoading, error, refetch } = api.useQuery("get", "/api/account-management/users/me");

  useEffect(() => {
    onIsLoadingChange(isLoading);
  }, [onIsLoadingChange, isLoading]);

  // Close dialog and cleanup
  const closeDialog = useCallback(() => {
    onOpenChange(false);
    setSelectedAvatarFile(null);
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
      setAvatarPreviewUrl(null);
    }
  }, [onOpenChange, avatarPreviewUrl]);

  const updateAvatarMutation = api.useMutation("post", "/api/account-management/users/me/update-avatar");
  const removeAvatarMutation = api.useMutation("delete", "/api/account-management/users/me/remove-avatar");
  const updateCurrentUserMutation = api.useMutation("put", "/api/account-management/users/me");

  const saveMutation = useMutation<
    void,
    Schemas["HttpValidationProblemDetails"],
    { body: Schemas["UpdateCurrentUserCommand"] }
  >({
    mutationFn: async (data) => {
      if (selectedAvatarFile) {
        const formData = new FormData();
        formData.append("file", selectedAvatarFile);
        // biome-ignore lint/suspicious/noExplicitAny: The client does not support typed file uploads, see https://github.com/openapi-ts/openapi-typescript/issues/1214
        await updateAvatarMutation.mutateAsync({ body: formData as any });
      } else if (removeAvatarFlag) {
        await removeAvatarMutation.mutateAsync({});
        setRemoveAvatarFlag(false);
      }

      await updateCurrentUserMutation.mutateAsync(data);
      const { data: updatedUser } = await refetch();
      if (updatedUser) {
        updateUserInfo(updatedUser);
      }

      closeDialog();
    }
  });

  // Handle file selection
  const onFileSelect = (files: FileList | null) => {
    if (files?.[0]) {
      const file = files[0];

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        alert(t`Please select a JPEG, PNG, GIF, or WebP image.`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        alert(t`Image must be smaller than 1 MB.`);
        return;
      }

      setSelectedAvatarFile(file);
      const objectUrl = URL.createObjectURL(file);
      setAvatarPreviewUrl(objectUrl);
      setRemoveAvatarFlag(false);
    }
  };

  if (!user) {
    return (
      <Dialog aria-label={t`User profile`}>
        <Heading slot="title">
          {isLoading && <Trans>Fetching data...</Trans>}
          {error && JSON.stringify(error)}
        </Heading>
      </Dialog>
    );
  }

  return (
    <Dialog aria-label={t`User profile`}>
      <XIcon onClick={closeDialog} className="h-10 w-10 absolute top-2 right-2 p-2 hover:bg-muted" />
      <Heading slot="title" className="text-2xl">
        <Trans>User profile</Trans>
      </Heading>
      <p className="text-muted-foreground text-sm">
        <Trans>Update your profile picture and personal details here.</Trans>
      </p>

      <Form
        onSubmit={mutationSubmitter(saveMutation)}
        validationBehavior="aria"
        validationErrors={saveMutation.error?.errors}
        className="flex flex-col gap-4 mt-4"
      >
        <FileTrigger
          ref={avatarFileInputRef}
          onSelect={(files) => {
            setAvatarMenuOpen(false);
            onFileSelect(files);
          }}
          acceptedFileTypes={ALLOWED_FILE_TYPES}
        />

        <Label>
          <Trans>Profile picture</Trans>
        </Label>

        <MenuTrigger isOpen={avatarMenuOpen} onOpenChange={setAvatarMenuOpen}>
          <Button
            variant="icon"
            className="rounded-full w-16 h-16 mb-3 bg-secondary hover:bg-secondary/80"
            aria-label={t`Change profile picture`}
          >
            {user.avatarUrl || avatarPreviewUrl ? (
              <img
                src={avatarPreviewUrl ?? user.avatarUrl ?? ""}
                className="rounded-full h-full w-full object-cover"
                alt={t`Preview avatar`}
              />
            ) : (
              <CameraIcon className="size-10 text-secondary-foreground" aria-label={t`Add profile picture`} />
            )}
          </Button>
          <Menu>
            <MenuItem
              onAction={() => {
                avatarFileInputRef.current?.click();
              }}
            >
              <CameraIcon className="w-4 h-4" />
              <Trans>Upload profile picture</Trans>
            </MenuItem>
            {(user.avatarUrl || avatarPreviewUrl) && (
              <>
                <MenuSeparator />
                <MenuItem
                  onAction={() => {
                    setAvatarMenuOpen(false);
                    setRemoveAvatarFlag(true);
                    setSelectedAvatarFile(null);
                    setAvatarPreviewUrl(null);
                    user.avatarUrl = null;
                  }}
                >
                  <Trash2Icon className="w-4 h-4 text-destructive" />
                  <span className="text-destructive">
                    <Trans>Remove profile picture</Trans>
                  </span>
                </MenuItem>
              </>
            )}
          </Menu>
        </MenuTrigger>

        <div className="flex flex-col sm:flex-row gap-4">
          <TextField
            autoFocus
            isRequired
            name="firstName"
            label={t`First name`}
            defaultValue={user?.firstName}
            placeholder={t`E.g., Alex`}
            className="sm:w-64"
          />
          <TextField
            isRequired
            name="lastName"
            label={t`Last name`}
            defaultValue={user?.lastName}
            placeholder={t`E.g., Taylor`}
            className="sm:w-64"
          />
        </div>
        <TextField name="email" label={t`Email`} value={user?.email} />
        <TextField name="title" label={t`Title`} defaultValue={user?.title} placeholder={t`E.g., Software Engineer`} />

        <FormErrorMessage error={saveMutation.error} />

        <div className="flex justify-end gap-4 mt-6">
          <Button type="reset" onPress={closeDialog} variant="secondary">
            <Trans>Cancel</Trans>
          </Button>
          <Button type="submit" isDisabled={isLoading || saveMutation.isPending}>
            {saveMutation.isPending ? <Trans>Saving...</Trans> : <Trans>Save changes</Trans>}
          </Button>
        </div>
      </Form>
    </Dialog>
  );
}
