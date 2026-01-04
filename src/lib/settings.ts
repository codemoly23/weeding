import prisma from "@/lib/db";

/**
 * Get a setting value from the database
 */
export async function getSetting(key: string): Promise<string | null> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key },
    });
    return setting?.value || null;
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error);
    return null;
  }
}

/**
 * Set a setting value in the database
 */
export async function setSetting(key: string, value: string): Promise<void> {
  try {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  } catch (error) {
    console.error(`Error setting ${key}:`, error);
    throw error;
  }
}

/**
 * Get multiple settings at once
 */
export async function getSettings(keys: string[]): Promise<Record<string, string | null>> {
  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: keys } },
    });

    const result: Record<string, string | null> = {};
    for (const key of keys) {
      result[key] = settings.find(s => s.key === key)?.value || null;
    }
    return result;
  } catch (error) {
    console.error("Error getting settings:", error);
    return keys.reduce((acc, key) => ({ ...acc, [key]: null }), {});
  }
}
