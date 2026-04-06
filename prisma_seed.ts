import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding...");

  // Cities
  const istanbul = await prisma.city.upsert({
    where: { slug: "istanbul" },
    update: {},
    create: { name: "İstanbul", slug: "istanbul" },
  });
  const ankara = await prisma.city.upsert({
    where: { slug: "ankara" },
    update: {},
    create: { name: "Ankara", slug: "ankara" },
  });
  const izmir = await prisma.city.upsert({
    where: { slug: "izmir" },
    update: {},
    create: { name: "İzmir", slug: "izmir" },
  });

  // Districts
  const besiktas = await prisma.district.upsert({
    where: { cityId_slug: { cityId: istanbul.id, slug: "besiktas" } },
    update: {},
    create: { name: "Beşiktaş", slug: "besiktas", cityId: istanbul.id },
  });
  const kadikoy = await prisma.district.upsert({
    where: { cityId_slug: { cityId: istanbul.id, slug: "kadikoy" } },
    update: {},
    create: { name: "Kadıköy", slug: "kadikoy", cityId: istanbul.id },
  });
  const cankaya = await prisma.district.upsert({
    where: { cityId_slug: { cityId: ankara.id, slug: "cankaya" } },
    update: {},
    create: { name: "Çankaya", slug: "cankaya", cityId: ankara.id },
  });
  const yenimahalle = await prisma.district.upsert({
    where: { cityId_slug: { cityId: ankara.id, slug: "yenimahalle" } },
    update: {},
    create: { name: "Yenimahalle", slug: "yenimahalle", cityId: ankara.id },
  });
  const karsiyaka = await prisma.district.upsert({
    where: { cityId_slug: { cityId: izmir.id, slug: "karsiyaka" } },
    update: {},
    create: { name: "Karşıyaka", slug: "karsiyaka", cityId: izmir.id },
  });
  const bornova = await prisma.district.upsert({
    where: { cityId_slug: { cityId: izmir.id, slug: "bornova" } },
    update: {},
    create: { name: "Bornova", slug: "bornova", cityId: izmir.id },
  });

  // Users
  const adminHash = await bcrypt.hash("Admin123!", 10);
  const ownerHash = await bcrypt.hash("Owner123!", 10);
  const userHash = await bcrypt.hash("User123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@admin.com" },
    update: {},
    create: {
      email: "admin@admin.com",
      fullName: "Admin",
      passwordHash: adminHash,
      role: "admin",
      isVerified: true,
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: "isletmeci@padelburada.com" },
    update: {},
    create: {
      email: "isletmeci@padelburada.com",
      fullName: "Ahmet Yılmaz",
      passwordHash: ownerHash,
      role: "business_owner",
      isVerified: true,
      phone: "05321234567",
    },
  });

  const normalUser = await prisma.user.upsert({
    where: { email: "kullanici@padelburada.com" },
    update: {},
    create: {
      email: "kullanici@padelburada.com",
      fullName: "Mehmet Demir",
      passwordHash: userHash,
      role: "user",
      isVerified: true,
      phone: "05329876543",
    },
  });

  // Courts
  const courts = [
    {
      name: "Beşiktaş Padel Club",
      slug: "besiktas-padel-club",
      address: "Sinanpaşa Mah. Çırağan Cad. No:15, Beşiktaş",
      cityId: istanbul.id,
      districtId: besiktas.id,
      lat: 41.0432,
      lng: 29.0045,
      courtType: "indoor",
      surface: "grass",
      hasParking: true,
      hasShower: true,
      hasRacketRental: true,
      hasLighting: true,
      minPriceHour: 200,
      maxPriceHour: 350,
      phone: "02122345678",
      description: "İstanbul'un kalbinde premium padel deneyimi. 3 adet kapalı kortumuzla yıl boyunca oynayın.",
      coverImageUrl: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800",
    },
    {
      name: "Kadıköy Padel Arena",
      slug: "kadikoy-padel-arena",
      address: "Moda Cad. No:42, Kadıköy",
      cityId: istanbul.id,
      districtId: kadikoy.id,
      lat: 40.9833,
      lng: 29.0264,
      courtType: "outdoor",
      surface: "cement",
      hasParking: false,
      hasShower: true,
      hasRacketRental: true,
      hasLighting: true,
      minPriceHour: 150,
      maxPriceHour: 280,
      phone: "02163456789",
      description: "Kadıköy'ün en popüler padel merkezi. Deniz manzaralı açık kortlarımızda maçınızı yapın.",
      coverImageUrl: "https://images.unsplash.com/photo-1526888935184-a82d2a4b7e67?w=800",
    },
    {
      name: "Çankaya Padel Center",
      slug: "cankaya-padel-center",
      address: "Tunalı Hilmi Cad. No:88, Çankaya",
      cityId: ankara.id,
      districtId: cankaya.id,
      lat: 39.9042,
      lng: 32.8597,
      courtType: "indoor",
      surface: "rubber",
      hasParking: true,
      hasShower: true,
      hasRacketRental: false,
      hasLighting: true,
      minPriceHour: 180,
      maxPriceHour: 300,
      phone: "03124567890",
      description: "Ankara'nın merkezinde, profesyonel zemin ve ekipmanlarla donatılmış padel tesisi.",
      coverImageUrl: "https://images.unsplash.com/photo-1545809763-0a97e73a32c8?w=800",
    },
    {
      name: "Yenimahalle Padel Park",
      slug: "yenimahalle-padel-park",
      address: "Batıkent Mah. 3562. Cad. No:5, Yenimahalle",
      cityId: ankara.id,
      districtId: yenimahalle.id,
      lat: 39.9673,
      lng: 32.7412,
      courtType: "outdoor",
      surface: "grass",
      hasParking: true,
      hasShower: false,
      hasRacketRental: true,
      hasLighting: false,
      minPriceHour: 120,
      maxPriceHour: 200,
      phone: "03125678901",
      description: "Uygun fiyatlı ve geniş parkur alanıyla ailelere ve başlangıç seviyesine uygun padel parkı.",
      coverImageUrl: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800",
    },
    {
      name: "Karşıyaka Padel Club",
      slug: "karsiyaka-padel-club",
      address: "Girne Cad. No:120, Karşıyaka",
      cityId: izmir.id,
      districtId: karsiyaka.id,
      lat: 38.4592,
      lng: 27.1124,
      courtType: "outdoor",
      surface: "grass",
      hasParking: true,
      hasShower: true,
      hasRacketRental: true,
      hasLighting: true,
      minPriceHour: 160,
      maxPriceHour: 280,
      phone: "02326789012",
      description: "İzmir'in en köklü padel kulübü. Türkiye şampiyonlarının antrenman yaptığı prestijli tesisimiz.",
      coverImageUrl: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800",
    },
    {
      name: "Bornova Padel House",
      slug: "bornova-padel-house",
      address: "Ege Üniversitesi Karşısı, Kazımdirik Mah. No:3, Bornova",
      cityId: izmir.id,
      districtId: bornova.id,
      lat: 38.4667,
      lng: 27.2167,
      courtType: "indoor",
      surface: "cement",
      hasParking: true,
      hasShower: true,
      hasRacketRental: true,
      hasLighting: true,
      minPriceHour: 140,
      maxPriceHour: 250,
      phone: "02327890123",
      description: "Ege Üniversitesi yakınında, öğrenci dostu fiyatlarla kaliteli padel ortamı.",
      coverImageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
    },
  ];

  for (const c of courts) {
    const court = await prisma.court.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        ...c,
        ownerUserId: owner.id,
        isApproved: true,
        status: "active",
        avgRating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        totalReviews: Math.floor(Math.random() * 40) + 5,
      },
    });

    // Schedules: Pazartesi-Pazar (1-7 → JS 0=Pazar)
    for (let day = 0; day <= 6; day++) {
      const existing = await prisma.courtSchedule.findFirst({
        where: { courtId: court.id, dayOfWeek: day },
      });
      if (!existing) {
        await prisma.courtSchedule.create({
          data: {
            courtId: court.id,
            dayOfWeek: day,
            startTime: "09:00",
            endTime: "23:00",
            priceHour: c.minPriceHour,
            isActive: true,
          },
        });
      }
    }
  }

  console.log("✅ Seed tamamlandı.");
  console.log("👤 Admin: admin@admin.com / Admin123!");
  console.log("🏢 İşletmeci: isletmeci@padelburada.com / Owner123!");
  console.log("👤 Kullanıcı: kullanici@padelburada.com / User123!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
