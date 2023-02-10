import { NextSeo, NextSeoProps } from "next-seo";

export type SeoProps = Pick<NextSeoProps, "title">;

export default function Seo({ title }: SeoProps): JSX.Element {
  return (
    <NextSeo
      defaultTitle="NextPortfolio"
      title={title}
      titleTemplate={"%s - NextPortfolio"}
    />
  );
}
