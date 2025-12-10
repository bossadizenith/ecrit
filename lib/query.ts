import { NoteSchema } from "./zod-schema";
import axios from "axios";

type NotesParams = {
  search?: string;
  page?: number;
  limit?: number;
};

export const QUERIES = {
  NOTES: {
    create: async (data: NoteSchema) => {
      const result = await axios.post("/api/notes", data);
      return result.data;
    },
    all: async (params?: NotesParams) => {
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
    share: async (id: string, data: { public: boolean; password?: string }) => {
      const result = await axios.patch(`/api/notes/${id}/share`, data);
      return result.data;
    },
  },
  SHARED: {
    get: async (id: string) => {
      const result = await axios.get(`/api/shared/${id}`);
      return result.data;
    },
    access: async (id: string, password?: string) => {
      const result = await axios.post(`/api/shared/${id}`, { password });
      return result.data;
    },
  },
} as const;
