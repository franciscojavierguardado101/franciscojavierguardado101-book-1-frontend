import { getMainMenu } from "@/lib/drupal-menu";
import HeaderClient from "./HeaderClient";

export default async function Header() {
  const navItems = await getMainMenu();
  return <HeaderClient navItems={navItems} />;
}
