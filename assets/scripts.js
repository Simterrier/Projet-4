async function loadTemplates() {
  const response = await fetch("./assets/templates.html");
  const html = await response.text();
  const container = document.createElement("div");
  container.style.display = "none";
  container.innerHTML = html;
  document.body.appendChild(container);
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadTemplates();
  const t = document.getElementById("tags-row-template");
  if (!t) {
    console.error("Le template 'tags-row-template' est introuvable");
  } else {
    console.log("Template chargé :", t);
  }
  $(".gallery").mauGallery({
    columns: {
      xs: 1,
      sm: 2,
      md: 3,
      lg: 3,
      xl: 3,
    },
    lightBox: true,
    lightboxId: "myAwesomeLightbox",
    showTags: true,
    tagsPosition: "top",
  });
});
