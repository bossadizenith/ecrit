"use client";

import { CreateNote } from "./create-note";
import { DeleteNote } from "./delete-note";
import { SearchNote } from "./search-note";
import { Settings } from "./settings";

export const Modals = () => {
  return (
    <>
      <CreateNote />
      <DeleteNote />
      <SearchNote />
      <Settings />
    </>
  );
};
