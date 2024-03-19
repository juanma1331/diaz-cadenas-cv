import { NOW, column, defineDb, defineTable } from 'astro:db';

const CV = defineTable({
 columns: {
  id: column.text({primaryKey: true, unique: true}),
  name: column.text(),
  email: column.text(),
  createdAt: column.date({default: NOW}),
 } 
});

const Attachment = defineTable({
  columns: {
    id: column.number({primaryKey: true}),
    name: column.text(),
    url: column.text(),
    size: column.number(),
    type: column.text(),
    cvId: column.text({references: () => CV.columns.id}),
  }
});


// https://astro.build/db/config
export default defineDb({
  tables: {CV, Attachment}
});
