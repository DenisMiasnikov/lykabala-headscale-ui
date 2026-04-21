import { GetServerSideProps } from "next";
import { getAuthRedirect } from "@/shared/lib/auth/requireAuth";
import { useUsers } from "@/features/user/hooks/useUsers";
import CurrentUserCard from "@/features/user/components/CurrentUserCard";
import CreateUserForm from "@/features/user/components/CreateUserForm";
import UsersTable from "@/features/user/components/UsersTable";
import {Page} from "@/shared/ui";

import styles from './index.module.css'

export const getServerSideProps: GetServerSideProps = async (context) => {
  const redirect = await getAuthRedirect(context);
  if (redirect) return redirect;
  return { props: {} };
};

export default function UsersPage() {
  const {
    currentUser,
    users,
    error,
    message,
    newUsername,
    setNewUsername,
    newPassword,
    setNewPassword,
    newIsAdmin,
    setNewIsAdmin,
    editPassword,
    setEditPassword,
    editUsername,
    setEditUsername,
    updateMyPassword,
    updateMyUsername,
    createUser,
    toggleAdmin,
    deleteUser,
  } = useUsers();

  if (!currentUser) {
    return <div className="page">Loading...</div>;
  }

  return (
    <Page title={'User Settings'} subtitle={'Manage your account.'}>
      {(error || message) && (
        <div
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            zIndex: 1000,
            minWidth: 300,
            maxWidth: 450,
          }}
        >
          <div
            className={`pill ${error ? "error" : "online"}`}
            style={{ padding: "12px 16px" }}
          >
            {error || message}
          </div>
        </div>
      )}

      <div className={styles.usersPage}>
        <CurrentUserCard
          currentUser={currentUser}
          editPassword={editPassword}
          setEditPassword={setEditPassword}
          onUpdatePassword={updateMyPassword}
          editUsername={editUsername}
          setEditUsername={setEditUsername}
          onUpdateUsername={updateMyUsername}
        />

        {currentUser.isAdmin && (
          <>
            <CreateUserForm
              newUsername={newUsername}
              setNewUsername={setNewUsername}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              newIsAdmin={newIsAdmin}
              setNewIsAdmin={setNewIsAdmin}
              onCreateUser={createUser}
            />
            <UsersTable
              users={users}
              currentUser={currentUser}
              onToggleAdmin={toggleAdmin}
              onDeleteUser={deleteUser}
            />
          </>
        )}
      </div>
    </Page>
  )
}
