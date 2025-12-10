import prisma from "./src/config/db";

async function main() {
  try {
    const user = await prisma.user.upsert({
      where: { userId: 1 },
      update: {},
      create: {
        userId: 1,
        email: "test@example.com",
        passwordHash: "hashedpassword",
        fullName: "Test User",
      },
    });
    console.log("User 1 ensured:", user);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
