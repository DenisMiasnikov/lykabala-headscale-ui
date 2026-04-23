import { useForm } from '@tanstack/react-form'
import {Card, Input, Toggle, Button} from "@/shared/ui";
import { useCurrentUser} from "@/entities/user/model";

function validate(value: string, rule: 'username' | 'password') {
  if (!value.trim()) return 'Required'
  if (rule === 'username' && value.trim().length < 3) return 'At least 3 characters'
  if (rule === 'password' && value.trim().length < 3) return 'Invalid password'
  return undefined
}

export default function UserForm({
  user,
  onSubmit,
}) {
  const { data: currentUser } = useCurrentUser()
  const showAdminToggle = currentUser?.isAdmin;
  const isEditMode = !!user;

  const form = useForm({
    defaultValues: {
      username: user?.username ||'',
      password: user?.password  || '',
      isAdmin: user?.isAdmin || false,
    },
    onSubmit,
  })

  return (
    <Card>
      <form.Field
        name="username"
        validators={{onBlur: ({value}) => validate(value, 'username')}}
      >
        {({state: {value, meta: {isTouched, errors } }, handleChange, handleBlur  }) => (
          <div style={{flex: 1, marginBottom: 16}}>
            <label style={{display: "block", marginBottom: 8}}>Username</label>
            <Input
              type={'text'}
              value={value}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="username"
            />
            {isTouched && errors[0] && (
              <span>{errors[0] as string}</span>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="password"
        validators={{onBlur: ({value}) => validate(value, 'password')}}
      >
        {({state: {value, meta: {isTouched, errors } }, handleChange, handleBlur  }) => (
          <div style={{flex: 1, marginBottom: 16}}>
            <label style={{display: "block", marginBottom: 8}}>
              {isEditMode ? "New Password (leave empty to keep current)" : "Password"}
            </label>
            <Input
              type={'password'}
              value={value}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={isEditMode ? "new password" : "password"}
            />

            {isTouched && errors[0] && (
                <span>{errors[0] as string}</span>
            )}
          </div>
        )}
      </form.Field>

      {showAdminToggle && <form.Field name="isAdmin">
        {field => (
          <Toggle
            value={field.state.value}
            onChange={field.handleChange}
            label={field.state.value ? 'Admin' : 'User'}
          />
        )}
      </form.Field>}

      <form.Subscribe selector={s => ({ isSubmitting: s.isSubmitting, canSubmit: s.canSubmit })}>
        {({isSubmitting, canSubmit}) => (
          <Button
            type={'button'}
            mode={'secondary'}
            disabled={!canSubmit || isSubmitting}
            onClick={form.handleSubmit}
            label={isSubmitting ? 'Saving...' : 'Submit'}
          />
        )}
      </form.Subscribe>
    </Card>
  );
}
