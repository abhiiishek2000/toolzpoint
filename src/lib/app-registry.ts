import data from "./apps-data.json";
export type AppDefinition = (typeof data)[number];
export const apps: AppDefinition[] = data;
export function getApp(slug: string) {
  return apps.find((a) => a.slug === slug && a.status === "published");
}
