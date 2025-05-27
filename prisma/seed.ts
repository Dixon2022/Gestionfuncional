import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

async function main() {
  console.log(`Start seeding ...`);

  // 1. Seed Users
  const user1Password = await bcrypt.hash('password123', SALT_ROUNDS);
  const user2Password = await bcrypt.hash('securePass!', SALT_ROUNDS);

  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      name: 'Alice Wonderland',
      password: user1Password,
      phone: '123-456-7890',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      name: 'Bob The Builder',
      password: user2Password,
      phone: '987-654-3210',
    },
  });
  console.log(`Created users: ${user1.name}, ${user2.name}`);

  // 2. Seed Properties from JSON Lines file
  const propertyDataPath = path.join(__dirname, 'property_seed_data.txt');
  try {
    const fileContent = fs.readFileSync(propertyDataPath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim() !== ''); // Filter out empty lines

    for (const line of lines) {
      try {
        const propertyData = JSON.parse(line) as PropertySeedData;
        
        const owner = await prisma.user.findUnique({
          where: { email: propertyData.ownerEmail },
        });

        if (!owner) {
          console.warn(`Owner with email ${propertyData.ownerEmail} not found for property "${propertyData.title}". Skipping this property.`);
          continue;
        }

        // Validate enum values before upserting
        const propertyType = propertyData.type.toUpperCase() as Prisma.PropertyType;
        const listingType = propertyData.listingType.toUpperCase() as Prisma.ListingType;

        if (!Object.values(Prisma.PropertyType).includes(propertyType)) {
            console.warn(`Invalid property type: ${propertyData.type} for property "${propertyData.title}". Skipping.`);
            continue;
        }
        if (!Object.values(Prisma.ListingType).includes(listingType)) {
            console.warn(`Invalid listing type: ${propertyData.listingType} for property "${propertyData.title}". Skipping.`);
            continue;
        }

        const createdProperty = await prisma.property.upsert({
          where: { title: propertyData.title }, // Assuming title is unique for upsert
          update: { // Define what to update if property exists, can be empty
            description: propertyData.description,
            address: propertyData.address,
            city: propertyData.city,
            price: propertyData.price,
            area: propertyData.area,
            lotSize: propertyData.lotSize,
            bedrooms: propertyData.bedrooms,
            bathrooms: propertyData.bathrooms,
            yearBuilt: propertyData.yearBuilt,
            type: propertyType,
            listingType: listingType,
            features: propertyData.features || [],
            isFeatured: propertyData.isFeatured === undefined ? false : propertyData.isFeatured,
            mainImageUri: propertyData.mainImageUri,
            ownerId: owner.id,
            updatedAt: new Date(),
          },
          create: {
            title: propertyData.title,
            description: propertyData.description,
            address: propertyData.address,
            city: propertyData.city,
            price: propertyData.price,
            area: propertyData.area,
            lotSize: propertyData.lotSize,
            bedrooms: propertyData.bedrooms,
            bathrooms: propertyData.bathrooms,
            yearBuilt: propertyData.yearBuilt,
            type: propertyType,
            listingType: listingType,
            features: propertyData.features || [],
            isFeatured: propertyData.isFeatured === undefined ? false : propertyData.isFeatured,
            mainImageUri: propertyData.mainImageUri,
            ownerId: owner.id,
          },
        });
        console.log(`Upserted property: ${createdProperty.title}`);

        if (propertyData.images && propertyData.images.length > 0) {
          const imageRecords = propertyData.images.map((imageUrl, index) => ({
            url: imageUrl,
            propertyId: createdProperty.id,
            order: index + 1,
          }));
          
          // Use createMany and skipDuplicates to avoid errors if re-running seed with same images
          await prisma.propertyImage.createMany({
            data: imageRecords,
            skipDuplicates: true, 
          });
          console.log(`Added ${imageRecords.length} images for property: ${createdProperty.title}`);
        }

      } catch (parseError) {
        console.error(`Error parsing JSON line: "${line}". Skipping.`, parseError);
      }
    }
  } catch (fileError) {
    console.error(`Error reading property seed data file: ${propertyDataPath}`, fileError);
  }

  console.log(`Seeding finished.`);
}

// Define an interface for the expected structure of property data in the text file
interface PropertySeedData {
  title: string;
  description: string;
  address: string;
  city: string;
  price: number;
  area?: number;
  lotSize?: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt?: number;
  type: string; // Will be cast to Prisma.PropertyType
  listingType: string; // Will be cast to Prisma.ListingType
  features?: string[];
  isFeatured?: boolean;
  mainImageUri: string;
  ownerEmail: string;
  images?: string[];
}

// Import fs and path at the top of the file
import fs from 'fs';
import path from 'path';

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
