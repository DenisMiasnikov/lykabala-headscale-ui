import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: "/machines",
    permanent: false
  }
});

export default function IndexPage() {
  return null;
}
