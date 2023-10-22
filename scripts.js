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

  const disc = project.querySelector(".disc");
  let projectDetail = project.querySelector(".project-detail");

  if (projectDetail) {
    if (
      projectDetail.style.display === "none" ||
      !projectDetail.style.display
    ) {
      projectDetail.style.display = "block";
      buttonElement.innerText = "Show Less";
    } else {
      projectDetail.style.display = "none";
      buttonElement.innerText = "More Info";
      projectDetail.remove(); // Remove the element
    }
  } else {
    projectDetail = document.createElement("div");
    projectDetail.className = "project-detail";
    projectDetail.innerHTML = `<div class="common-container">
    <p class="summary">DK Services is a fleet maintenance company that I founded. Our main aim is to keep our customers' vehicles running smoothly. But like any business, we faced some challenges along the way.</p>
    
    <section class="section-block">
      <h4>Situation</h4>
      <p>Managing a whole fleet of vehicles was no small task. The work orders were hard to keep track of and it was affecting our efficiency.</p>  
    </section>
  
    <section class="section-block">
    <h4>Task</h4>
    <p>Our main goal was to make things simpler and more organized. We decided that a web application could help manage the work orders better.</p>
    </section>
    <section class="section-block">
    <h4>Action</h4>
    <p>So I took charge of this and chose a bunch of tech tools to help us out. We used Next.js to build the web server and React.js to create the user interface. For storing all our data, we used Prisma and MySQL. And we made sure to use Git and GitHub to keep everything organized. The new app has features like a login system and a real-time work order updater. You can check out the <a href="https://github.com/DawoodKamar/DK-services">code on GitHub</a> and <a href="https://dk-services.vercel.app/">visit the live app here</a>.</p>
    </section>
    
    <section class="section-block">
    <h4>Result</h4>
    <p>The app has made our lives so much easier. Work orders are managed better, and our profits went up by about 20%. It was a big lesson in how the right tech can really make a difference in how we work.</p>
    </section>
    
    <figure>
    <img src="images/form.png" alt="Image of the workorder form on dk services">
    <figcaption>Workorder form on dk services</figcaption>
  </figure>
  <figure>
  <img src="images/submissions.png" alt="Image of the list of submissions with search functionality">
  <figcaption>List of submissions with search functionality</figcaption>
</figure>
      <figure>
      <img src="images/pdfexample.png" alt="image of PDF download functionality for easy invoicing">
      <figcaption>PDF download functionality for easy invoicing</figcaption>
    </figure>
    </div>
  `;
    buttonElement.innerText = "Show Less";
    disc.appendChild(projectDetail);
    projectDetail.style.display = "block";
  }
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
