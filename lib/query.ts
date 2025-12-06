import { NoteSchema } from "./zod-schema";
import axios from "axios";

export const QUERIES = {
  NOTES: {
    create: async (data: NoteSchema) => {
      const result = await axios.post("/api/notes", data);
      return result.data;
    },
    all: async (search?: string) => {
      const params = search ? { search } : {};
      const result = await axios.get("/api/notes", { params });
      return result.data;
    },
    details: async (id: string) => {
      const result = await axios.get(`/api/notes/${id}`);
      return result.data;
    },
    bySlug: async (slug: string) => {
      const result = await axios.get(`/api/notes/slug/${slug}`);
      return result.data;
    },
    update: async (id: string, data: NoteSchema) => {
      const result = await axios.patch(`/api/notes/${id}`, data);
      return result.data;
    },
    delete: async (id: string) => {
      const result = await axios.delete(`/api/notes/${id}`);
      return result.data;
    },
  },
} as const;
