import React from "react";

interface DetailsProps {
  params: Promise<{ id: string }>;
}

export default function Details({ params }: DetailsProps) {
  const { id } = React.use(params);
  console.log(id);

  return (
    <div>
      <div>{id}</div>
    </div>
  );
}
