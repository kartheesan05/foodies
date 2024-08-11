// import fs from "node:fs";
// import sql from "better-sqlite3";
// import slugify from "slugify";
// import xss from "xss";
// import path from "path";

// let db;

// function getDatabase() {
//   if (!db) {
//     const dbPath = path.resolve(process.cwd(), "meals.db"); // Use process.cwd() for the correct path
//     db = sql(dbPath);
//   }
//   return db;
// }

// export async function getMeals() {
//   await new Promise((resolve) => setTimeout(resolve, 5000));

//   const db = getDatabase();
//   return db.prepare("SELECT * FROM meals").all();
// }

// export function getMeal(slug) {
//   const db = getDatabase();
//   return db.prepare("SELECT * FROM meals WHERE slug = ?").get(slug);
// }

// export async function saveMeal(meal) {
//   meal.slug = slugify(meal.title, { lower: true });
//   meal.instructions = xss(meal.instructions);

//   const extension = meal.image.name.split(".").pop();
//   const fileName = `${meal.slug}.${extension}`;

//   const stream = fs.createWriteStream(`public/images/${fileName}`);
//   const bufferedImage = await meal.image.arrayBuffer();

//   stream.write(Buffer.from(bufferedImage), (error) => {
//     if (error) {
//       throw new Error("Saving image failed!");
//     }
//   });

//   meal.image = `/images/${fileName}`;

//   const db = getDatabase();
//   db.prepare(
//     `
//     INSERT INTO meals
//       (title, summary, instructions, creator, creator_email, image, slug)
//     VALUES (
//       @title,
//       @summary,
//       @instructions,
//       @creator,
//       @creator_email,
//       @image,
//       @slug
//     )
//   `
//   ).run(meal);
// }


// import fs from "node:fs";
import { Database } from "@sqlitecloud/drivers";
import slugify from "slugify";
import xss from "xss";
// import path from "path";

const dbUri = process.env.DB_URI; 

const db = new Database(dbUri);

async function getDatabase() {
  // Ensure connection is established
  return await db;
}

export async function getMeals() {
  await new Promise((resolve) => setTimeout(resolve, 500));

  // const dbInstance = await getDatabase();
  return await db.sql("USE DATABASE foodies; SELECT * FROM meals");
}

export async function getMeal(slug) {
  // const dbInstance = await getDatabase();
  const result = await db.sql(
    "USE DATABASE foodies; SELECT * FROM meals WHERE slug = ?",
    [slug]
  );
  return result[0]; // SQLite Cloud SDK returns an array
}

// export async function saveMeal(meal) {
//   meal.slug = slugify(meal.title, { lower: true });
//   meal.instructions = xss(meal.instructions);

//   const extension = meal.image.name.split(".").pop();
//   const fileName = `${meal.slug}.${extension}`;

//   const stream = fs.createWriteStream(path.join("public", "images", fileName));
//   const bufferedImage = await meal.image.arrayBuffer();

//   return new Promise((resolve, reject) => {
//     stream.write(Buffer.from(bufferedImage), (error) => {
//       if (error) {
//         return reject(new Error("Saving image failed!"));
//       }
//       stream.end(() => resolve());
//     });
//   }).then(async () => {
//     meal.image = `/images/${fileName}`;

//     const dbInstance = getDatabase();
//     return await dbInstance.sql(
//       `
//       USE DATABASE foodies; 
//       INSERT INTO meals
//         (title, summary, instructions, creator, creator_email, image, slug)
//       VALUES (?, ?, ?, ?, ?, ?, ?)
//       `,
//       [
//         meal.title,
//         meal.summary,
//         meal.instructions,
//         meal.creator,
//         meal.creator_email,
//         meal.image,
//         meal.slug,
//       ]
//     );
//   });
// }

export async function saveMeal(meal) {
  meal.slug = slugify(meal.title, { lower: true });
  meal.instructions = xss(meal.instructions);

  const extension = meal.image.name.split(".").pop();
  const fileName = `${meal.slug}.${extension}`;
  meal.image = `/images/${fileName}`;

   await db.sql(
    `
      USE DATABASE foodies; 
      INSERT INTO meals
        (title, summary, instructions, creator, creator_email, image, slug)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
    [
      meal.title,
      meal.summary,
      meal.instructions,
      meal.creator,
      meal.creator_email,
      meal.image,
      meal.slug,
    ]
   );
  
  return;


  }
