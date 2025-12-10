"use client";

import { CreateNote } from "./create-note";
import { DeleteNote } from "./delete-note";
import { SearchNote } from "./search-note";
import { Settings } from "./settings";
import { ShareNote } from "./share-note";

export const Modals = () => {
  return (
    <>
      <CreateNote />
      <DeleteNote />
      <SearchNote />
      <Settings />
      <ShareNote />
    </>
  );
};
