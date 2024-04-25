import { db, CVS, ATTACHMENTS } from "astro:db";
import { generateId } from "lucia";
import { faker } from "@faker-js/faker";

// https://astro.build/db/seed
export default async function seed() {
  await generateCVS(10000);
}

async function generateCVS(qty: number) {
  const queries = [];
  for (let i = 0; i < qty; i++) {
    const cvId = generateId(15);
    queries.push(
      db.insert(CVS).values({
        id: cvId,
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
      })
    );

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

    queries.push(
      db.insert(ATTACHMENTS).values({
        name: `Attachment-2 ${i}`,
        url: `https://example.com/attachment-2-${i}`,
        size: 35651584,
        type: "video/mp4",
        key: `key-2-${i}`,
        cvId: cvId,
      })
    );
  }

  await db.batch(queries as any);
}
