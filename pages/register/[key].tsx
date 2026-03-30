import { GetServerSideProps } from "next";

export default function RegisterRedirect() {
  // This page never renders client-side; it redirects via getServerSideProps
  return null;
}

export const getServerSideProps = async (context) => {
  const { key } = context.params || {};
  if (key && typeof key === "string") {
    return {
      redirect: {
        destination: `/machines?key=${encodeURIComponent(key)}`,
        permanent: false,
      },
    };
  }
  // If no key, redirect to machines page
  return {
    redirect: {
      destination: "/machines",
      permanent: false,
    },
  };
};
