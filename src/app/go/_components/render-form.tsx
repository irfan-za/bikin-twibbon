"use client";
import { isValidImageUrl } from "@/utils/validator";
import Form from "./form";

export interface Props {
  searchParams: {
    title?: string;
    frameUrl?: string;
    caption?: string;
    slug?: string;
  };
}

export default function RenderForm({ searchParams }: Readonly<Props>) {
  if (!searchParams.frameUrl) {
    const customFrameUrl = localStorage.getItem("customFrameUrl") as
      | string
      | undefined;

    if (!customFrameUrl)
      return (
        <h1 className="text-[36px] font-bold leading-[130%] sm:text-[44px] mb-[18px]">
          <span className="text-primary-500">Something went wrong </span> Please
          reload the page.
        </h1>
      );

    return (
      <Form searchParams={{ ...searchParams, frameUrl: customFrameUrl }} />
    );
  }

  if (isValidImageUrl(searchParams.frameUrl))
    return <Form searchParams={searchParams} />;

  return (
    <h1 className="text-[36px] font-bold leading-[130%] sm:text-[44px] mb-[18px]">
      <span className="text-primary-500">ERROR</span> Invalid frame!
    </h1>
  );
}
