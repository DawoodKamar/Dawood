// _-----------------------------------------handling the theme toggle --------------------------------------
const theme = (() => {
    if (typeof localStorage !== "undefined" && localStorage.getItem("theme")) {
      return localStorage.getItem("theme");
    }
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  })();
  
  if (theme === "light") {
    document.documentElement.classList.remove("dark");
  } else {
    document.documentElement.classList.add("dark");
  }
  
  window.localStorage.setItem("theme", theme);
  
  const handleToggleClick = () => {
    const element = document.documentElement;
    element.classList.toggle("dark");
  
    const isDark = element.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };
  
  document
    .getElementById("themeToggle")
    .addEventListener("click", handleToggleClick);

// _-----------------------------------------handling menu toggling --------------------------------------
document.querySelector('.hamburger').addEventListener('click', () => {
    document.querySelector('.side-menu').classList.toggle('expanded');
    // document.querySelector('.side-menu').classList.remove('expanded');
  });
  document.querySelector('.close-menu').addEventListener('click', () => {
    document.querySelector('.side-menu').classList.remove('expanded');
  });
  
// _-----------------------------------------handling scroll nav animation--------------------------------------

window.addEventListener('scroll', () => {
  const navLinks= document.querySelector('.nav');
  const headerName= document.querySelector(".headerName")
  const scrollPosition = window.scrollY || document.documentElement.scrollTop;
  if (scrollPosition > 50){
    navLinks.classList.add('visible');
    headerName.classList.add('visible');
    headerName.parentElement.classList.add('visible');


  }else {
    navLinks.classList.remove('visible');
    headerName.classList.remove('visible');
    headerName.parentElement.classList.remove('visible');

  }
})

