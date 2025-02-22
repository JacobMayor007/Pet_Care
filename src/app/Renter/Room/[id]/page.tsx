import React from "react";
import RentersNavigation from "../../RentersNavigation/page";

interface boardID {
  params: Promise<{ id: string }>;
}

export default function RoomDetails({ params }: boardID) {
  const { id } = React.use(params);
  console.log(id);

  return (
    <div>
      <nav className="relative z-20">
        <RentersNavigation />
      </nav>
      <div className="z-10 mx-52 h-screen">
        <div></div>
      </div>
    </div>
  );
}
