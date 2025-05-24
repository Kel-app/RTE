export default function switchTheme(theme, setTheme, setDefaultColor) {
  if (theme === "dark") {
    setTheme("light");
    setDefaultColor("#000000");
  } else {
    setTheme("dark");
    setDefaultColor("#ffffff");
  }
}
