import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@touneshelp.tn";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin";
  const adminHash = await bcrypt.hash(adminPassword, 12);
  const userHash = await bcrypt.hash("user12345", 12);

  await prisma.caseHelper.deleteMany();
  await prisma.helpRequest.deleteMany();
  await prisma.tunisiaCase.deleteMany();
  await prisma.place.deleteMany();
  await prisma.user.deleteMany({ where: { email: { not: adminEmail } } });

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Admin TounesHelp",
      passwordHash: adminHash,
      role: "ADMIN",
      status: "ACTIVE",
      skills: "Administration,Coordination,Support",
    },
    create: {
      name: "Admin TounesHelp",
      email: adminEmail,
      phone: "+21671123456",
      passwordHash: adminHash,
      role: "ADMIN",
      status: "ACTIVE",
      bio: "Platform administrator",
      skills: "Administration,Coordination,Support",
    },
  });

  const user = await prisma.user.create({
    data: {
      name: "Test User",
      email: "user@example.com",
      phone: "+21620123456",
      passwordHash: userHash,
      role: "USER",
      status: "ACTIVE",
      skills: "Volunteering",
    },
  });

  await prisma.tunisiaCase.create({
    data: {
      title: "Family needs urgent food support",
      description: "A vulnerable family needs immediate food and basic supplies.",
      fullDescription:
        "A vulnerable family in Tunis has no stable income and needs immediate food and hygiene support while local NGOs coordinate longer-term help.",
      governorate: "Tunis",
      city: "Bab Souika",
      latitude: 36.8,
      longitude: 10.17,
      status: "SUFFERING",
      category: "FOOD",
      victimName: "Anonymous Family",
      victimPhone: "+21621123456",
      creatorName: user.name,
      creatorPhone: user.phone || "+21600000000",
      creatorEmail: user.email,
      peopleAffected: 5,
      imagesJson: "[]",
      datePublished: new Date(),
      createdById: user.id,
    },
  });

  await prisma.place.createMany({
    data: [
      {
        name: "Tunis Medical Center",
        address: "Avenue Habib Bourguiba",
        city: "Tunis",
        governorate: "Tunis",
        latitude: 36.8065,
        longitude: 10.1815,
        type: "hospital",
        phone: "+21671578000",
        isActive: true,
      },
      {
        name: "Tunis Food Bank",
        address: "Rue de la Kasbah",
        city: "Tunis",
        governorate: "Tunis",
        latitude: 36.7992,
        longitude: 10.1706,
        type: "food_bank",
        phone: "+21671336000",
        isActive: true,
      },
    ],
  });

  console.log("Database seeded.");
  console.log(`Admin email: ${admin.email}`);
  console.log(`Admin password: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
