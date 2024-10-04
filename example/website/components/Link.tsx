import NextLink from "next/link";

const Link = ({
  pathname,
  children,
}: {
  pathname: string;
  children: React.ReactNode;
}) => {
  return (
    <NextLink href={`${process.env.DEMO_APP_URL}${pathname}`}>
      {children}
    </NextLink>
  );
};

export default Link;
