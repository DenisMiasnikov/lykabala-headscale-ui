import { useForm } from '@tanstack/react-form'
import {Card, Input, Button, Avatar} from "@/shared/ui";
import {useFileUpload} from "@/shared";

function validate(value: string, rule: 'name' | 'pictureUrl') {
  if (!value.trim()) return 'Required'
  if (rule === 'name' && value.trim().length < 3) return 'At least 3 characters'
  if (rule === 'pictureUrl' && value.trim().length < 3) return 'At least 3 characters'
  return undefined
}

export default function NamespaceForm(
  {
    namespace,
    onSubmit,
  }
) {
  const form = useForm({
    defaultValues: {
      name: namespace?.name || '',
      displayName: namespace?.displayName || '',
      email: namespace?.email || '',
      pictureUrl: namespace?.pictureUrl || '',
    },
    onSubmit,
  })

  const newPictureUrl = form.getFieldValue('pictureUrl');

  const {uploading, fileInputRef, handleFileUpload, triggerUpload} = useFileUpload({
    onSuccess: (key) => {
      form.setFieldValue('pictureUrl', key);
    }
  });

  async function updateUserImage() {
    const res = await fetch("/api/internal/update-image", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({userId: namespace?.id, imageUrl: newPictureUrl.trim() || undefined}),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update image");
    return data.user;
  }

  return (
    <Card>
      <form.Field
        name="name"
        validators={{onBlur: ({value}) => validate(value, 'name')}}
      >
        {({state: {value, meta: {isTouched, errors}}, handleChange, handleBlur}) => (
          <>
            <Input
              value={value}
              onChange={handleChange}
              onBlur={handleBlur}
              type="text"
              placeholder="e.g. personal"
            />
            {isTouched && errors[0] && (
              <span>{errors[0] as string}</span>
            )}
          </>
        )}
      </form.Field>

      <form.Field
        name="displayName"
      >
        {({state: {value}, handleChange, handleBlur}) => (
          <Input
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            type="text"
            placeholder="e.g. Personal Space"
            disabled={namespace?.id}
          />
        )}
      </form.Field>

      <form.Field
        name="email"
      >
        {({state: {value}, handleChange, handleBlur}) => (
          <Input
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            type="email"
            placeholder="user@example.com"
            disabled={namespace?.id}
          />
        )}
      </form.Field>

      <div style={{marginBottom: "1rem"}}>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{display: "none"}}
        />
        <Button
          label={uploading ? "Uploading..." : "Upload Image"}
          type="button"
          onClick={triggerUpload}
          disabled={uploading}
        />
        {newPictureUrl && (
          <div style={{
            marginTop: '16px',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <Avatar src={newPictureUrl} size={'large'}/>
          </div>
        )}
      </div>

      <form.Field
        name="pictureUrl"
      >
        {({state: {value, meta: {isTouched, errors}}, handleChange, handleBlur}) => (
          <>
            <Input
              value={value}
              onChange={handleChange}
              onBlur={handleBlur}
              type="text"
              placeholder="Or paste image URL"
            />
            {isTouched && errors[0] && (
              <span>{errors[0] as string}</span>
            )}
          </>
        )}
      </form.Field>

      <form.Subscribe selector={s => ({isSubmitting: s.isSubmitting, canSubmit: s.canSubmit})}>
        {({isSubmitting, canSubmit}) => (
          <Button
            type={'button'}
            label={namespace?.id ? 'Update Namespace' : 'Create Namespace'}
            mode={'primary'}
            disabled={!canSubmit || isSubmitting}
            onClick={form.handleSubmit}
          />
        )}
      </form.Subscribe>
    </Card>
  )
}
