(function ($) {
  $.fn.mauGallery = function (options) {
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = [];
    return this.each(function () {
      $.fn.mauGallery.methods.createRowWrapper($(this));
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }
      $.fn.mauGallery.listeners(options);

      $(this)
        .children(".gallery-item")
        .each(function (index) {
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
          var theTag = $(this).data("gallery-tag");
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });

      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }

      $(this).fadeIn(500);
    });
  };
  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true,
  };
  $.fn.mauGallery.listeners = function (options) {
    $(".gallery-item").on("click", function () {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });

    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
    $(".gallery").on("click", ".mg-prev", () =>
      $.fn.mauGallery.methods.prevImage(options.lightboxId)
    );
    $(".gallery").on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.nextImage(options.lightboxId)
    );
  };
  $.fn.mauGallery.methods = {
    createRowWrapper(element) {
      if (!element.children().first().hasClass("row")) {
        element.prepend('<div class="gallery-items-row row"></div>');
      }
    },
    wrapItemInColumn(element, columns) {
      const template = document.getElementById("gallery-column-template");
      const clone = template.content.cloneNode(true);
      const wrapper = clone.querySelector(".item-column");

      if (typeof columns === "object") {
        if (columns.xs)
          wrapper.classList.add(`col-${Math.ceil(12 / columns.xs)}`);
        if (columns.sm)
          wrapper.classList.add(`col-sm-${Math.ceil(12 / columns.sm)}`);
        if (columns.md)
          wrapper.classList.add(`col-md-${Math.ceil(12 / columns.md)}`);
        if (columns.lg)
          wrapper.classList.add(`col-lg-${Math.ceil(12 / columns.lg)}`);
        if (columns.xl)
          wrapper.classList.add(`col-xl-${Math.ceil(12 / columns.xl)}`);
      } else if (typeof columns === "number") {
        wrapper.classList.add(`col-${Math.ceil(12 / columns)}`);
      } else {
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
      }
      const $wrapper = $(wrapper);
      element.before($wrapper);
      $wrapper.append(element);
    },

    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },
    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },
    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`)
        .find(".lightboxImage")
        .attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },
    prevImage() {
      let activeImage = null;
      $("img.gallery-item").each(function () {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = $(this);
        }
      });
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];
      if (activeTag === "all") {
        $(".item-column").each(function () {
          if ($(this).children("img").length) {
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        $(".item-column").each(function () {
          if ($(this).children("img").data("gallery-tag") === activeTag) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }
      let index = 0;

      $(imagesCollection).each(function (i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i;
        }
      });
      index--;
      if (index < 0) index = imagesCollection.length - 1;

      let prev = imagesCollection[index];
      $(".lightboxImage").attr("src", $(prev).attr("src"));
    },

    nextImage() {
      let activeImage = null;
      $("img.gallery-item").each(function () {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = $(this);
        }
      });

      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];
      if (activeTag === "all") {
        $(".item-column").each(function () {
          if ($(this).children("img").length) {
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        $(".item-column").each(function () {
          if ($(this).children("img").data("gallery-tag") === activeTag) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }
      let index = 0;

      $(imagesCollection).each(function (i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i;
        }
      });
      index++;
      if (index >= imagesCollection.length) index = 0;
      let next = imagesCollection[index];
      $(".lightboxImage").attr("src", $(next).attr("src"));
    },

    createLightBox(gallery, lightboxId, navigation) {
      const template = document.getElementById("lightbox-template");
      const clone = template.content.cloneNode(true);
      const modal = clone.querySelector(".modal");

      if (lightboxId) {
        modal.id = lightboxId;
      }
      if (!navigation) {
        clone.querySelector(".mg-prev").classList.add("hidden");
        clone.querySelector(".mg-next").classList.add("hidden");
      }
      gallery.append(modal);
    },

    showItemTags(gallery, position, tags) {
      const ul = document.createElement("ul");
      ul.className = "my-4 tags-bar nav nav-pills";

      const template = document.getElementById("tag-item-template");

      const allClone = template.content.cloneNode(true);
      const allSpan = allClone.querySelector("span");
      allSpan.textContent = "Tous";
      allSpan.classList.add("active", "active-tag");
      allSpan.dataset.imagesToggle = "all";
      ul.appendChild(allClone);

      tags.forEach((tag) => {
        const clone = template.content.cloneNode(true);
        const span = clone.querySelector("span");
        span.textContent = tag;
        span.dataset.imagesToggle = tag;
        ul.appendChild(clone);
      });

      if (position === "bottom") {
        gallery.append(ul);
      } else if (position === "top") {
        gallery.prepend(ul);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },

    filterByTag() {
      if ($(this).hasClass("active-tag")) {
        return;
      }

      $(".active-tag").removeClass("active active-tag");
      $(this).addClass("active active-tag");

      var tag = $(this).data("images-toggle");

      $(".gallery-item").each(function () {
        $(this).parents(".item-column").hide();
        if (tag === "all") {
          $(this).parents(".item-column").show();
        } else if ($(this).data("gallery-tag") === tag) {
          $(this).parents(".item-column").show();
        }
      });
    },
  };
})(jQuery);
