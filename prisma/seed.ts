import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const createDate = (daysFromNow: number, hour: number, minute: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, minute, 0, 0);
  return date;
};

async function main() {
  await prisma.reminder.deleteMany();
  await prisma.cardDesign.deleteMany();
  await prisma.userFavourite.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@community.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  const sampleEvents = [
    {
      title: "Moonlight Beats Night",
      category: "Music",
      city: "Coimbatore",
      dateTime: createDate(2, 19, 30),
      price: 499,
      description: "A live music night with indie bands and DJ sets for the local community.",
      imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80",
      isActive: true,
    },
    {
      title: "Community Food Fair",
      category: "Food",
      city: "Bengaluru",
      dateTime: createDate(4, 12, 0),
      price: 199,
      description: "Street food stalls, tasting counters, and live cooking demos.",
      imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80",
      isActive: true,
    },
    {
      title: "Creative Workshop Lab",
      category: "Workshop",
      city: "Hyderabad",
      dateTime: createDate(6, 15, 0),
      price: 799,
      description: "Hands-on workshop exploring design thinking, prototyping and creative tools.",
      imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80",
      isActive: true,
    },
    {
      title: "Sunrise Run Circle",
      category: "Sports",
      city: "Chennai",
      dateTime: createDate(1, 6, 15),
      price: 0,
      description: "A family-friendly fitness meet with warm-up drills and a short 3 km route.",
      imageUrl: "https://images.unsplash.com/photo-1541534401786-2077eed87a74?auto=format&fit=crop&w=1000&q=80",
      isActive: true,
    },
    {
      title: "Storytime for Kids",
      category: "Kids",
      city: "Pune",
      dateTime: createDate(3, 11, 0),
      price: 150,
      description: "Interactive storytelling session with illustration and craft activities.",
      imageUrl: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1000&q=80",
      isActive: true,
    },
    {
      title: "Heritage Walk Weekend",
      category: "Workshop",
      city: "Jaipur",
      dateTime: createDate(9, 9, 30),
      price: 350,
      description: "An urban heritage walk covering local stories, architecture and hidden cafes.",
      imageUrl: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1000&q=80",
      isActive: true,
    },
    {
      title: "Jazz & Jams",
      category: "Music",
      city: "Mumbai",
      dateTime: createDate(12, 20, 0),
      price: 699,
      description: "An evening of smooth jazz, live improvisations and local talent.",
      imageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1000&q=80",
      isActive: true,
    },
    {
      title: "Kids Football Fest",
      category: "Sports",
      city: "Kochi",
      dateTime: createDate(7, 16, 0),
      price: 250,
      description: "Mini football drills, friendly games and team challenges for young players.",
      imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1000&q=80",
      isActive: true,
    },
    {
      title: "Pottery and Clay Studio",
      category: "Workshop",
      city: "Lucknow",
      dateTime: createDate(14, 17, 30),
      price: 950,
      description: "Learn the basics of pottery with guided shaping, glazing and finishing.",
      imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1000&q=80",
      isActive: true,
    },
    {
      title: "Street Food Trails",
      category: "Food",
      city: "Delhi",
      dateTime: createDate(18, 18, 0),
      price: 299,
      description: "A guided food trail with regional flavors and chef recommendations.",
      imageUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1000&q=80",
      isActive: true,
    },
    {
      title: "Indie Movie Night",
      category: "Music",
      city: "Bengaluru",
      dateTime: createDate(-4, 19, 0),
      price: 350,
      description: "A past event with indie films, acoustic sets and community conversation.",
      imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1000&q=80",
      isActive: true,
    },
    {
      title: "Indoor Yoga Evening",
      category: "Workshop",
      city: "Coimbatore",
      dateTime: createDate(-2, 18, 30),
      price: 450,
      description: "A calming yoga session infused with breathwork and guided meditation.",
      imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80",
      isActive: true,
    },
    {
      title: "Summer Splash Carnival",
      category: "Kids",
      city: "Chennai",
      dateTime: createDate(20, 10, 0),
      price: 200,
      description: "Water games, bounce zones, and fun contests for kids and families.",
      imageUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1000&q=80",
      isActive: true,
    },
    {
      title: "Neighborhood Cricket Clash",
      category: "Sports",
      city: "Ahmedabad",
      dateTime: createDate(5, 17, 30),
      price: 100,
      description: "Friendly cricket matches and skill contests for local neighborhood teams.",
      imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1000&q=80",
      isActive: true,
    },
    {
      title: "Silent Disco Social",
      category: "Music",
      city: "Pune",
      dateTime: createDate(10, 20, 15),
      price: 599,
      description: "Dance under the lights with wireless headsets and a community playlist.",
      imageUrl: "https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&w=1000&q=80",
      isActive: false,
    },
  ];

  await prisma.event.createMany({ data: sampleEvents });

  console.log(`Seeded ${sampleEvents.length} events and admin user ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
