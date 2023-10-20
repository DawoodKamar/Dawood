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
document.querySelector(".hamburger").addEventListener("click", () => {
  document.querySelector(".side-menu").classList.toggle("expanded");
});
document.querySelector(".close-menu").addEventListener("click", () => {
  document.querySelector(".side-menu").classList.remove("expanded");
});

// _-----------------------------------------handling scroll nav animation--------------------------------------

window.addEventListener("scroll", () => {
  const navLinks = document.querySelector(".nav");
  const headerName = document.querySelector(".headerName");
  const scrollPosition = window.scrollY || document.documentElement.scrollTop;
  if (scrollPosition > 50) {
    navLinks.classList.add("visible");
    headerName.classList.add("visible");
    headerName.parentElement.classList.add("visible");
  } else {
    navLinks.classList.remove("visible");
    headerName.classList.remove("visible");
    headerName.parentElement.classList.remove("visible");
  }
});

// _-----------------------------------------handling project routing--------------------------------------

document.querySelector(".cta-button").addEventListener("click", () => {
  if ((window.location.hash = "#projects")) {
    window.location.hash = "#";
    window.location.hash = "#projects";
  } else window.location.hash = "#projects";
});

// _-----------------------------------------handling project expanding--------------------------------------

function expandProject(project, buttonElement) {
  // Toggle expanded class
  project.classList.toggle("expanded-project");

  // Get the 'disc' div inside the clicked project
  const disc = project.querySelector(".disc");

  // Create or toggle new project detail div
  let projectDetail = project.querySelector(".project-detail");
  if (!projectDetail) {
    projectDetail = document.createElement("div");
    projectDetail.className = "project-detail";
    projectDetail.innerHTML = "<p>Your project details here.</p>";
    document.querySelector(".more").innerText = "Show Less";
    disc.appendChild(projectDetail);

    if (buttonElement.innerText === "More Info") {
      buttonElement.innerText = "Show Less";
    } else {
      buttonElement.innerText = "More Info";
    }
  }
  projectDetail.style.display =
    projectDetail.style.display === "none" || !projectDetail.style.display
      ? "block"
      : "none";
}

// Add event listener to 'More Info' buttons
const moreInfoButtons = document.querySelectorAll(".more");
moreInfoButtons.forEach((button) => {
  button.addEventListener("click", function () {
    const project = this.closest(".dkservices, .sharp, .codscope");
    expandProject(project, this);
    project.classList.toggle("newProjectStyle");
  });
});
