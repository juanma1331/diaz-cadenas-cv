import { db, CVS, ATTACHMENTS } from "astro:db";
import { generateId } from "lucia";
import { faker } from "@faker-js/faker";

// https://astro.build/db/seed
export default async function seed() {
  await generateCVs([{ qty: 1000 }]);
}

function defaultCV(id: string) {
  return {
    id,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    place: faker.helpers.arrayElement([
      "Andújar",
      "Brenes",
      "Bollullos Par del Condado",
      "Cádiz",
      "Coria del Rio",
      "Estepa",
      "Gilena",
      "Hytasa",
      "La Carolina",
      "Lantejuela",
      "Moguer",
      "Osuna",
      "Sanlúcar de Barrameda",
      "Sevilla",
      "Utrera",
    ]),
    position: faker.helpers.arrayElement([
      "Carnicería",
      "Charcutería",
      "Pescadería",
      "Frutería",
      "Panadería",
      "Pastelería",
      "Cajero",
      "Reponedor",
      "Limpieza",
    ]),
    status: faker.helpers.arrayElement([1, 2, 3, 4]),
    createdAt: faker.date.past(),
  };
}

type Operation = {
  qty: number;
  attributes?: Partial<typeof CVS.$inferInsert>;
};

async function generateCVs(operations: Array<Operation>) {
  const queries = [];
  for (const operation of operations) {
    for (let i = 0; i < operation.qty; i++) {
      const cvId = generateId(15);
      const CV = {
        ...defaultCV(cvId),
        ...operation.attributes,
      } as typeof CVS.$inferInsert;

      queries.push(db.insert(CVS).values(CV));

      queries.push(
        db.insert(ATTACHMENTS).values({
          name: `Attachment ${i}`,
          url: `https://example.com/attachment-${i}`,
          size: 4194304,
          type: "application/pdf",
          key: `key-${i}`,
          cvId: cvId,
        })
      );
    }
  }

  await db.batch(queries as any);
}
