import { db, CVS, ATTACHMENTS } from "astro:db";
import { generateId } from "lucia";
import { faker } from "@faker-js/faker";

// https://astro.build/db/seed
export default async function seed() {
  await generateCVS(100);
}

async function generateCVS(qty: number) {
  for (let i = 0; i < qty; i++) {
    const cvId = generateId(20);
    await db.insert(CVS).values({
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
      status: faker.helpers.arrayElement(["pending", "reviewed"]),
      createdAt: faker.date.past(),
    });
    await db.insert(ATTACHMENTS).values({
      name: `Attachment ${i}`,
      url: `https://example.com/attachment-${i}`,
      size: 1000,
      type: "application/pdf",
      key: `key-${i}`,
      cvId: cvId,
    });
    await db.insert(ATTACHMENTS).values({
      name: `Attachment-2 ${i}`,
      url: `https://example.com/attachment-2-${i}`,
      size: 1000,
      type: "video/mp4",
      key: `key-2-${i}`,
      cvId: cvId,
    });
  }
}
