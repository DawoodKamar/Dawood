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
  let classes = project.classList;

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
    classes.forEach((classx) => {
      switch (classx) {
        case "dkservices":
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
          break;
        case "sharp":
          projectDetail.innerHTML = `<div class="common-container">
          <p class="summary">Sharp Truck Trailer Repair is a local business with a focus on providing top-notch trailer repair services. The project is currently awaiting final feedback from the client.</p>
          
          <section class="section-block">
            <h4>Situation</h4>
            <p>The client wanted to improve their online presence and attract new clients. One of the significant challenges was competing in a saturated market and making the business more visible.</p>  
          </section>
        
          <section class="section-block">
            <h4>Task</h4>
            <p>The primary goal was to create an SEO-optimized website that could effectively attract new clients. In addition, implementing a Google Map to highlight the service area and incorporating Stripe payments were also key objectives.</p>
          </section>
          
          <section class="section-block">
            <h4>Action</h4>
            <p>We chose Next.js, React, and TypeScript as our tech stack for the project. These technologies not only provide robustness but also the ability to scale the website in the future. Plans to add a mechanic and client login are already in the pipeline. I focused on SEO optimization to make the website easily discoverable. Google Maps was integrated to highlight the service area, and Stripe payments were added to facilitate online transactions. The project is now awaiting final feedback from the client. You can check out the <a href="https://github.com/DawoodKamar/Sharp">code on GitHub</a> and <a href="https://sharp-lac.vercel.app/">visit the live app here</a>.</p>
          </section>
          
          <section class="section-block">
            <h4>Result</h4>
            <p>Though the website is awaiting final feedback, the initial signs are promising. The SEO-optimized pages are designed to attract a higher volume of local traffic, and the implemented features are expected to offer a better user experience. The tech stack ensures scalability for future features.</p>
          </section>
          
          <figure>
            <img src="images/google-map.png" alt="Image of Google Maps highlighting service area">
            <figcaption>Google Map highlighting the service area</figcaption>
          </figure>
          
          <figure>
            <img src="images/stripe-payment.png" alt="Image of Stripe payments implementation">
            <figcaption>Stripe Payment Implementation</figcaption>
          </figure>
          
          <figure>
          <img src="images/sharp-ui.png" alt="Image of section of home page">
          <figcaption> Section of the home page</figcaption>
        </figure>
        </div>
        `;
          break;
        case "codscope":
          projectDetail.innerHTML = `<div class="common-container">
          <p class="summary">CodScope is a gaming blog website dedicated to the popular game Call of Duty. This is a hobby project with a focus on creative design and community building.</p>
          
          <section class="section-block">
            <h4>Situation</h4>
            <p>As a fan of Call of Duty, I recognized a lack of dedicated spaces where fans could discuss the game, share tips, and get the latest news. I wanted to create a platform that could serve these needs.</p>  
          </section>
        
          <section class="section-block">
            <h4>Task</h4>
            <p>The aim was to build a creatively designed website that could potentially foster a community around the game. It was essential to have a user-friendly interface, robust features, and a captivating layout to keep visitors engaged.</p>
          </section>
          
          <section class="section-block">
            <h4>Action</h4>
            <p>I chose WordPress and Elementor as the tech stack for this project and decided to host it on Bluehost. These technologies were ideal for my needs, offering a mix of customizability, scalability, and ease of use. I started by setting up WordPress on Bluehost and then used Elementor to create the visual elements. The focus was on an appealing design that would attract Call of Duty enthusiasts. I also set up various sections for news and tips.</p>
          </section>
          
          <section class="section-block">
            <h4>Result</h4>
            <p>The website is currently in its early stages, but I am pleased with its visual appeal and functionality. The next steps involve content creation and promotion to attract a community around the site. You can check out the <a href="https://codscope.com/">visit the live app here</a>.</p>
          </section>
          
          <figure>
            <img src="images/CodScopehome1.png" alt="Image of CodScope's homepage">
            <figcaption>CodScope's Homepage</figcaption>
          </figure>
          
          <figure>
            <img src="images/CodScopeabout.png" alt="Image of the about section">
            <figcaption>CodScope About Section</figcaption>
          </figure>
          
          <figure>
            <img src="images/CodScopecontact.png" alt="Image of the contact page">
            <figcaption>CodScope Contact Page</figcaption>
          </figure>
        </div>
        
        `;
          break;
      }
    });
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
