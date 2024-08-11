import fs from "node:fs";
import sql from "better-sqlite3";
import slugify from "slugify";
import xss from "xss";
import path from "path";

let db;

function getDatabase() {
  if (!db) {
    const dbPath = path.resolve(process.cwd(), "meals.db"); // Use process.cwd() for the correct path
    db = sql(dbPath);
  }
  return db;
}

export async function getMeals() {
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const db = getDatabase();
  return db.prepare("SELECT * FROM meals").all();
}

export function getMeal(slug) {
  const db = getDatabase();
  return db.prepare("SELECT * FROM meals WHERE slug = ?").get(slug);
}

export async function saveMeal(meal) {
  meal.slug = slugify(meal.title, { lower: true });
  meal.instructions = xss(meal.instructions);

  const extension = meal.image.name.split(".").pop();
  const fileName = `${meal.slug}.${extension}`;

  const stream = fs.createWriteStream(`public/images/${fileName}`);
  const bufferedImage = await meal.image.arrayBuffer();

  stream.write(Buffer.from(bufferedImage), (error) => {
    if (error) {
      throw new Error("Saving image failed!");
    }
  });

  meal.image = `/images/${fileName}`;

  const db = getDatabase();
  db.prepare(
    `
    INSERT INTO meals
      (title, summary, instructions, creator, creator_email, image, slug)
    VALUES (
      @title,
      @summary,
      @instructions,
      @creator,
      @creator_email,
      @image,
      @slug
    )
  `
  ).run(meal);
}
