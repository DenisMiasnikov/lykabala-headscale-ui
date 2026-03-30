import { GetServerSideProps } from "next";
import { getAuthRedirect } from "../../utils/requireAuth";
import { useUsers } from "../../features/users/hooks/useUsers";
import CurrentUserCard from "../../features/users/components/CurrentUserCard";
import CreateUserForm from "../../features/users/components/CreateUserForm";
import UsersTable from "../../features/users/components/UsersTable";

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
    <div className="page">
      {(error || message) && (
        <div
          style={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 1000,
            minWidth: 300,
            maxWidth: 450,
          }}
        >
          <div className={`pill ${error ? 'error' : 'online'}`} style={{ padding: '12px 16px' }}>
            {error || message}
          </div>
        </div>
      )}

      <div className="container">
        <h1 className="title">User Settings</h1>
        <p className="subtitle">Manage your account.</p>

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
          <div className="card">
            <h2 className="title" style={{ fontSize: 22 }}>User Management</h2>
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
          </div>
        )}
      </div>
    </div>
  );
}
