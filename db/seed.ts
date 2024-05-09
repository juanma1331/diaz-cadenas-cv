import { db, CVS, ATTACHMENTS, USERS } from "astro:db";
import { generateId, generateIdFromEntropySize } from "lucia";
import { faker } from "@faker-js/faker";
import { Argon2id } from "oslo/password";

// https://astro.build/db/seed
export default async function seed() {
  await createDefaultUser();
  await createCVs([{ qty: 1000 }]);
}

async function createDefaultUser() {
  const password = await new Argon2id().hash("password");
  const username = "fakeuser";
  const id = generateIdFromEntropySize(10);

  await db.insert(USERS).values({
    id,
    username,
    password,
  });
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

type CVCreation = {
  qty: number;
  attributes?: Partial<typeof CVS.$inferInsert>;
};

async function createCVs(operations: Array<CVCreation>) {
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
