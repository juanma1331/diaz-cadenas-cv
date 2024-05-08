import { CVS_STATUS } from "@/constants";
import { NOW, column, defineDb, defineTable } from "astro:db";

const USERS = defineTable({
  columns: {
    id: column.text({ primaryKey: true, optional: false, unique: true }),
    username: column.text({ unique: true, optional: false }),
    password: column.text({ optional: true }),
  },
});

const SESSIONS = defineTable({
  columns: {
    id: column.text({ optional: false, unique: true }),
    userId: column.text({
      optional: false,
      references: () => USERS.columns.id,
    }),
    expiresAt: column.number({ optional: false }),
  },
});

const CVS = defineTable({
  columns: {
    id: column.text({ primaryKey: true, unique: true }),
    name: column.text(),
    email: column.text(),
    place: column.text(),
    position: column.text(),
    status: column.number({ default: CVS_STATUS.PENDING }),
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
  tables: { CVS, ATTACHMENTS, USERS, SESSIONS },
});
