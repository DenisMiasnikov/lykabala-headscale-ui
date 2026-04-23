import {GetServerSideProps} from "next";
import {useUsers} from "@/features/user/model/hooks/useUsers";
import {UpdateUser} from "@/features/user/ui/updateUser/UpdateUser";
import UserCard from "@/entities/user/ui/UserCard";
import {Page} from "@/shared/ui";
import {getAuthRedirect} from "@/shared/lib/auth/requireAuth";


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
  } = useUsers();

  if (!currentUser) {
    return <div className="page">Loading...</div>;
  }

  return (
    <Page title={'User Settings'} subtitle={'Manage your account and other users.'}>
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

      <div style={{marginBottom: 24, display: 'flex', gap: 12}}>
        {currentUser.isAdmin && (
          <UpdateUser/>
        )}
      </div>

      <div className={styles.usersPage}>
        {users.map((user) => (
          <UserCard
            key={user.username}
            user={user}
            currentUser={currentUser}
            actions={<UpdateUser user={user}/>}
          />
        ))}
      </div>
    </Page>
  )
}
