import {GetServerSideProps} from "next";
import {UpdateUser} from "@/features/user/ui/updateUser/UpdateUser";
import {DeleteUser} from "@/features/user/ui/deleteUser/DeleteUser";
import UserCard from "@/entities/user/ui/UserCard";
import {useCurrentUser, useUsersList} from "@/entities/user/model";
import {Page} from "@/shared/ui";
import {getAuthRedirect} from "@/shared/lib/auth/requireAuth";


import styles from './index.module.css'

export const getServerSideProps: GetServerSideProps = async (context) => {
  const redirect = await getAuthRedirect(context);
  if (redirect) return redirect;
  return { props: {} };
};

export default function UsersPage() {
  const { data: currentUser, isPending: isPendingCurrent, isError: isErrorCurrent } = useCurrentUser()
  const { data: users, isPending, isError } = useUsersList(!currentUser?.isAdmin)

  const isPend = currentUser?.isAdmin ?  (isPendingCurrent || isPending) : isPendingCurrent;
  const isErr = currentUser?.isAdmin ?  (isError || isErrorCurrent) : isErrorCurrent;

  if (isPend) return <div className="page">Loading...</div>
  if (isErr)   return <div className="page">Something went wrong</div>

  return (
    <Page title={'User Settings'} subtitle={`Manage your account ${currentUser?.isAdmin ? 'and other users' : ''}.`}>
      {(isError) && (
        <div className={styles.error}>
          <div className={`pill ${isError ? "error" : "online"} ${styles.errorPill}`}>
            {isError}
          </div>
        </div>
      )}

      <div className={styles.createUser}>
        {currentUser.isAdmin && (
          <UpdateUser/>
        )}
      </div>

      {currentUser.isAdmin ? (
        <div className={styles.usersPage}>
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              currentUser={currentUser}
              rightAction={currentUser?.isAdmin && currentUser?.id !== user.id && (
                <DeleteUser user={user}/>
              )}
              actions={<UpdateUser user={user}/>}
            />
          ))}
        </div>
      ) : (
        <UserCard
          key={currentUser.id}
          user={currentUser}
          currentUser={currentUser}
          actions={<UpdateUser user={currentUser}/>}
        />
      )}
    </Page>
  )
}
