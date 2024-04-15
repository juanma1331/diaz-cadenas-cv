import { CVSStatus } from "@/constants";
import { NOW, column, defineDb, defineTable } from "astro:db";

const CVS = defineTable({
  columns: {
    id: column.text({ primaryKey: true, unique: true }),
    name: column.text(),
    email: column.text(),
    place: column.text(),
    position: column.text(),
    status: column.number({ default: CVSStatus.PENDING }),
    createdAt: column.date(),
  },
});

const ATTACHMENTS = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    url: column.text(),
    size: column.number(),
    type: column.text(),
    key: column.text(),
    cvId: column.text({ references: () => CVS.columns.id }),
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: { CVS, ATTACHMENTS },
});
