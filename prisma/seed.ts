import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando siembra (seeding) de la base de datos...\n");

  const adminEmail =
    process.env.ADMIN_EMAIL?.trim().toLowerCase() ||
    "beckhamjosethtorrescaceres@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123456*";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let supabaseUserId = "";

  // 1. Crear o sincronizar usuario en Supabase Auth
  if (supabaseUrl && serviceRoleKey) {
    try {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      console.log(`🔐 Verificando usuario en Supabase Auth (${adminEmail})...`);
      const { data: listData, error: listError } =
        await supabaseAdmin.auth.admin.listUsers();

      if (listError) {
        console.warn("⚠️ No se pudo listar usuarios de Supabase Auth:", listError.message);
      } else {
        const existing = listData?.users?.find(
          (u) => u.email?.toLowerCase() === adminEmail
        );

        if (existing) {
          supabaseUserId = existing.id;
          console.log(`✔ Usuario ya existe en Supabase Auth (ID: ${existing.id})`);

          // Actualizar contraseña por si se especificó una nueva
          if (process.env.ADMIN_PASSWORD) {
            await supabaseAdmin.auth.admin.updateUserById(existing.id, {
              password: adminPassword,
            });
            console.log("✔ Contraseña actualizada en Supabase Auth");
          }
        } else {
          const { data: created, error: createError } =
            await supabaseAdmin.auth.admin.createUser({
              email: adminEmail,
              password: adminPassword,
              email_confirm: true,
              user_metadata: {
                full_name: "Beckham Torres Caceres",
              },
            });

          if (createError) {
            console.error("❌ Error creando usuario en Supabase Auth:", createError.message);
          } else if (created.user) {
            supabaseUserId = created.user.id;
            console.log(`✔ Usuario creado con éxito en Supabase Auth (ID: ${created.user.id})`);
          }
        }
      }
    } catch (authErr) {
      console.warn("⚠️ Error conectando con Supabase Auth API:", authErr);
    }
  } else {
    console.warn("⚠️ Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env");
  }

  // Fallback para ID si no se obtuvo de Supabase Auth
  if (!supabaseUserId) {
    supabaseUserId = "admin-" + Buffer.from(adminEmail).toString("hex").slice(0, 16);
  }

  // 2. Sembrar tabla Admin en PostgreSQL (Prisma)
  console.log("\n📦 Sembrando registro en la tabla Admin (Prisma Postgres)...");
  const adminRecord = await prisma.admin.upsert({
    where: { userId: supabaseUserId },
    update: { email: adminEmail },
    create: {
      userId: supabaseUserId,
      email: adminEmail,
    },
  });
  console.log(`✔ Registro Admin verificado (ID: ${adminRecord.id}, userId: ${adminRecord.userId})`);

  // 3. Sembrar perfil inicial en tabla Profile si está vacía
  console.log("\n👤 Verificando perfil principal (Profile)...");
  const profileCount = await prisma.profile.count();
  if (profileCount === 0) {
    const profile = await prisma.profile.create({
      data: {
        name: "Beckham Torres Caceres",
        role: "Desarrollador Full-Stack",
        headline: "Código limpio, detalles cuidados.",
        description:
          "Desarrollador Full-Stack. Construyo productos web rápidos, escalables y con experiencias interactivas en 3D.",
        bio: "Soy desarrollador con foco en arquitectura frontend y experiencias interactivas. Me gusta llevar una idea desde el diseño hasta producción, cuidando rendimiento, accesibilidad y mantenibilidad.",
        email: adminEmail,
        githubUrl: "https://github.com/BeckhamTorresCaceres",
        linkedinUrl: "https://linkedin.com",
        twitterUrl: "https://twitter.com",
      },
    });
    console.log(`✔ Perfil creado con éxito: ${profile.name} (${profile.email})`);
  } else {
    console.log("✔ Perfil principal ya existe en la base de datos.");
  }

  // 4. Sembrar Proyectos iniciales si está vacía
  console.log("\n📁 Verificando proyectos (Project)...");
  const projectCount = await prisma.project.count();
  if (projectCount === 0) {
    const defaultProjects = [
      {
        title: "Nebula Dashboard",
        slug: "nebula-dashboard",
        description: "Panel de analítica en tiempo real con WebSockets y gráficos WebGL.",
        stack: ["React", "D3", "WebSocket"],
        order: 1,
        published: true,
      },
      {
        title: "Orbit Commerce",
        slug: "orbit-commerce",
        description: "E-commerce headless con checkout optimizado y visor de producto 3D.",
        stack: ["Next.js", "Stripe", "Three.js"],
        order: 2,
        published: true,
      },
      {
        title: "Pulse API",
        slug: "pulse-api",
        description: "API escalable con colas, caché y observabilidad end-to-end.",
        stack: ["Node", "PostgreSQL", "Docker"],
        order: 3,
        published: true,
      },
      {
        title: "CodeLens CLI",
        slug: "codelens-cli",
        description: "Herramienta open source para auditar dependencias y rendimiento.",
        stack: ["TypeScript", "CLI", "OSS"],
        order: 4,
        published: true,
      },
    ];

    for (const p of defaultProjects) {
      await prisma.project.create({ data: p });
    }
    console.log(`✔ Se crearon ${defaultProjects.length} proyectos iniciales en la base de datos.`);
  } else {
    console.log(`✔ Proyectos ya registrados (${projectCount} encontrados).`);
  }

  // 5. Sembrar Habilidades si está vacía
  console.log("\n⚡ Verificando habilidades (Skill)...");
  const skillCount = await prisma.skill.count();
  if (skillCount === 0) {
    const defaultSkills = [
      { name: "React", category: "Frontend", order: 1 },
      { name: "Next.js", category: "Frontend", order: 2 },
      { name: "TypeScript", category: "Frontend", order: 3 },
      { name: "Tailwind CSS", category: "Frontend", order: 4 },
      { name: "Node.js", category: "Backend", order: 5 },
      { name: "PostgreSQL", category: "Backend", order: 6 },
      { name: "Prisma ORM", category: "Backend", order: 7 },
      { name: "Three.js", category: "3D & Motion", order: 8 },
      { name: "R3F", category: "3D & Motion", order: 9 },
      { name: "GSAP", category: "3D & Motion", order: 10 },
      { name: "Docker", category: "DevOps", order: 11 },
      { name: "Git & GitHub", category: "Herramientas", order: 12 },
    ];

    for (const s of defaultSkills) {
      await prisma.skill.create({ data: s });
    }
    console.log(`✔ Se crearon ${defaultSkills.length} habilidades iniciales en la base de datos.`);
  } else {
    console.log(`✔ Habilidades ya registradas (${skillCount} encontradas).`);
  }

  // 6. Sembrar Experiencia si está vacía
  console.log("\n💼 Verificando experiencia (Experience)...");
  const expCount = await prisma.experience.count();
  if (expCount === 0) {
    const defaultJobs = [
      {
        period: "2023 — Actual",
        role: "Senior Full-Stack Developer",
        company: "Empresa Tech",
        description: "Lidero el frontend de una plataforma SaaS con más de 200k usuarios.",
        order: 1,
      },
      {
        period: "2020 — 2023",
        role: "Full-Stack Developer",
        company: "Studio Digital",
        description: "Producto web, APIs y experiencias interactivas para marcas internacionales.",
        order: 2,
      },
      {
        period: "2018 — 2020",
        role: "Frontend Developer",
        company: "Startup Labs",
        description: "Primer producto desde cero hasta producción en 8 meses.",
        order: 3,
      },
    ];

    for (const j of defaultJobs) {
      await prisma.experience.create({ data: j });
    }
    console.log(`✔ Se crearon ${defaultJobs.length} experiencias iniciales en la base de datos.`);
  } else {
    console.log(`✔ Experiencias ya registradas (${expCount} encontradas).`);
  }

  console.log("\n==================================================");
  console.log("🎉 Siembra completada con éxito");
  console.log(`👤 Admin Email:    ${adminEmail}`);
  console.log(`🔑 Admin Password: ${adminPassword}`);
  console.log("==================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Error en el proceso de seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
