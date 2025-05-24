export default function switchTheme(theme, setTheme) {
  if (theme === "dark") {
    setTheme("light");
  } else {
    setTheme("dark");
  }
}
