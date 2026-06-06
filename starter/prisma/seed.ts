import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const samples = [
    { email: "demo.email@example.com", name: "Erin Email", channel: "email", source: "homepage", status: "engaged" },
    { phone: "+14155550100", name: "Wendy WhatsApp", channel: "whatsapp", source: "instagram", status: "new" },
    { email: "lead.from.fb@example.com", name: "Frank Facebook", channel: "email", source: "facebook", status: "new" },
  ];

  for (const s of samples) {
    await db.lead.upsert({
      where: { email: s.email ?? `noemail-${s.name}` },
      update: {},
      create: s,
    });
  }
  console.log(`Seeded ${samples.length} demo leads.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
