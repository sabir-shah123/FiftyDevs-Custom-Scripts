(function () {
  /*
  ========================================
  STATE
  ========================================
  */

  let menuInjected = false;
  let injectingNow = false;
  let currentMode = null;


  /*
  ========================================
  GET USER DATA
  ========================================
  */

  async function getUserData() {
    return new Promise((resolve) => {
      try {
        const avatarBtn = document.querySelector(
          "#pg-afcp-navbar__navigation-page-img-avatar-profile-btn, #pg-afcp-navbar__navigation-page-txt-avatar-profile-btn"
        );

        if (!avatarBtn) {
          resolve({ name: "", email: "" });
          return;
        }

        avatarBtn.click();

        const observer = new MutationObserver(() => {
          const nameEl = document.querySelector(".hl-text-lg-medium");
          const emailEl = document.querySelector(".hl-text-sm-regular");

          if (nameEl && emailEl) {

            let name = nameEl.innerText
              .replace("Hi,", "")
              .replace("!", "")
              .trim();

            let email = emailEl.innerText.trim();

            avatarBtn.click();
            observer.disconnect();

            resolve({ name, email });
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });

      } catch (err) {
        resolve({ name: "", email: "" });
      }
    });
  }


  /*
  ========================================
  BUILD LINKS
  ========================================
  */

  async function buildMenuLinks() {

    const user = await getUserData();

    const params = new URLSearchParams({
      full_name: user.name || "",
      email: user.email || "",
    }).toString();

    return [
      {
        title: "Learning Area (Courses)",
        url: "https://portal.nerotrades.com/courses/library-v2",
      },
      {
        title: "Investor Community",
        url: "https://portal.nerotrades.com/communities/",
      },
      {
        title: "Manage License Keys",
        url:
          "https://link.teamnero.com/widget/form/FF9zr7GrGFkAXXnkCNQV?" +
          params,
      },
      {
        title: "Downloads",
        url: "https://portal.nerotrades.com/courses/products/5b61ca58-74df-45e1-8fa0-5894f534b291/categories/14e1e756-8a7e-4ff3-876a-49e4ec019117?source=communities",
      },
      {
        title: "Setup Guide",
        url: "https://portal.nerotrades.com/courses/products/5b61ca58-74df-45e1-8fa0-5894f534b291/categories/a56c70a3-74c0-42a3-9df4-4fe79752e4ee/posts/84a6ebbc-c5bd-47aa-a12b-c296457232cd",
      },
    ];
  }


  /*
  ========================================
  ICONS
  ========================================
  */

    const icons = [
    "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z",
    "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z",
    "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4 4m0 0l-4-4m4 4V4",
    "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  ];


  /*
  ========================================
  LAYOUT DETECTION
  ========================================
  */

  function getLayoutMode() {
    if (document.querySelector(".w-\\[24vw\\]")) return "desktop";
    if (document.querySelector("#id-mobile-switch")) return "mobile";
    return null;
  }

  function findDesktopContainer() {
    const sidebar = document.querySelector(".w-\\[24vw\\]");
    if (!sidebar) return null;

    const sticky = sidebar.querySelector(".sticky");
    if (!sticky) return null;

    return sticky.querySelector("div:nth-child(2)");
  }


  /*
  ========================================
  DESKTOP MENU
  ========================================
  */

  async function injectGroup(container) {

  if (!container) return;
  if (menuInjected || injectingNow) return;

  if (container.querySelector(".custom-gHL-resources-group")) {
    menuInjected = true;
    return;
  }

  injectingNow = true;

  const menuLinks = await buildMenuLinks();

  const groupDiv = document.createElement("div");
  groupDiv.className = "custom-gHL-resources-group";
  groupDiv.dataset.menuItem = "true"; // protection for approval script

  menuLinks.forEach((link, index) => {

    const a = document.createElement("a");

    // ✅ Setup Guide special case
    if (link.title === "Setup Guide") {
      a.href = "#";
      a.dataset.link = link.url;   // store real URL safely
      a.classList.add("setup_guide_button");
    } else {
      a.href = link.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }

    a.dataset.menuItem = "true";

    a.className +=
      " group mt-2 flex h-7 cursor-pointer items-center justify-between rounded p-[10px] hover:bg-communities-sidebar-fill";

    a.innerHTML = `
      <div class="grid w-full grid-cols-6 items-center font-medium xl:grid-cols-8">
        <div class="col-span-1 mr-3">
          <svg xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="h-5 w-5">
            <path stroke-linecap="round"
              stroke-linejoin="round"
              d="${icons[index]}"></path>
          </svg>
        </div>
        <div class="col-span-4 truncate xl:col-span-6 hl-text-md-medium">
          ${link.title}
        </div>
      </div>
    `;

    groupDiv.appendChild(a);
  });

  container.appendChild(groupDiv);

  menuInjected = true;
  injectingNow = false;
}

  document.addEventListener("click", function (e) {

  const btn = e.target.closest(".setup_guide_button");
  if (!btn) return;

  e.preventDefault();

  const url = btn.dataset.link;
  if (!url) return;

  console.log("Setup Guide clicked:", url);

  // do your custom logic here
  window.open(url, "_blank");

});


  /*
  ========================================
  MOBILE ICONS
  ========================================
  */

  async function injectMobileIcons() {

    const topBar = document.querySelector(".fixed.z-50");
    if (!topBar) return;

    if (topBar.querySelector(".custom-mobile-icons")) return;

    const menuLinks = await buildMenuLinks();

    const wrapper = document.createElement("div");
    wrapper.className =
      "custom-mobile-icons flex items-center gap-3 ml-2";

    menuLinks.forEach((link, index) => {

      const btn = document.createElement("a");
      if(link.title == 'Setup Guide'){
        btn.href = '#'
      }else{
         btn.href = link.url;
      }
      btn.href = link.url;
      btn.target = "_blank";
      btn.dataset.menuItem = "true";

      btn.className =
        "flex items-center justify-center w-8 h-8 rounded-md";

      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-5 h-5">
          <path stroke-linecap="round"
            stroke-linejoin="round"
            d="${icons[index]}"></path>
        </svg>
      `;

      wrapper.appendChild(btn);
    });

    const leftSection = topBar.querySelector(".flex.items-center");

    if (leftSection) leftSection.appendChild(wrapper);
    else topBar.appendChild(wrapper);
  }


  /*
  ========================================
  REMOVE
  ========================================
  */

  function removeMenu() {
    document
      .querySelectorAll(".custom-gHL-resources-group")
      .forEach(el => el.remove());

    menuInjected = false;
  }

  function removeMobileIcons() {
    document
      .querySelectorAll(".custom-mobile-icons")
      .forEach(el => el.remove());
  }


  /*
  ========================================
  CONTROLLER
  ========================================
  */

  async function handleLayoutChange() {

    const mode = getLayoutMode();
    if (!mode) return;

    if (mode === currentMode) return;

    currentMode = mode;

    removeMenu();
    removeMobileIcons();

    if (mode === "desktop") {
      const container = findDesktopContainer();
      if (container) injectGroup(container);
    }

    if (mode === "mobile") {
      injectMobileIcons();
    }
  }


  /*
  ========================================
  OBSERVER
  ========================================
  */

  const observer = new MutationObserver(() => {
    handleLayoutChange();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });


  /*
  ========================================
  INITIAL RUN
  ========================================
  */

  setTimeout(handleLayoutChange, 1200);

})();


/*
  =========================
  Hide the user profiles pictures
  =========================
  */

(function () {
  const DEFAULT_AVATAR =
    "https://img.icons8.com/ios-glyphs/30/user-male-circle.png";

  //  replace only avatar-like images
  function replaceSpecificAvatars() {
    const avatarSelectors = [
      ".n-avatar img",
      ".ghl-avatar img",
      ".default-avatar img",
      ".ghl-avatar-container img",
      "span.n-avatar img",
      ".n-avatar.default-avatar img",
    ];

    avatarSelectors.forEach((selector) => {
      const images = document.querySelectorAll(selector);

      images.forEach((img) => {
        // Skip if already replaced or not a profile-like src
        if (img.src === DEFAULT_AVATAR || img.dataset.avatarFixed) return;

        //  only replace if src looks like a user upload (not icons/logos)
        if (
          img.src.includes("storage.googleapis.com") ||
          img.src.includes("cdnclientportal") ||
          img.src.includes("user") ||
          !img.src
        ) {
          img.src = DEFAULT_AVATAR;
          img.srcset = "";
          img.alt = "User Avatar";
          img.dataset.avatarFixed = "true";

          // Fix display if needed
          img.style.objectFit = "contain";
          img.style.width = "100%";
          img.style.height = "100%";
        }
      });
    });
  }

  replaceSpecificAvatars();

  // Watch for dynamically loaded avatars
  const observer = new MutationObserver(() => {
    replaceSpecificAvatars();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["src", "data-image-src", "class"],
  });

  setInterval(replaceSpecificAvatars, 4000);
})();

//for the community posts hidden or show
// == CONFIGURATION ==
const ADMIN_EMAIL = "usmanali@xortlogix.com";
const API_BASE = "https://justin-membership.sabirshahbzu.workers.dev";
const MATCH_STRING = 'a[href*="/posts/"]';

// == STATE ==
let isAdmin = false;
let approvedPosts = [];
let approvedIds = new Set();
let processedPosts = new Set();

// == HELPER: API CALLS (CORS-safe with Worker) ==
async function callApi(action, method = "GET", data = null) {
  const url = new URL(API_BASE);

  if (method === "GET") {
    url.searchParams.append("action", action);

    const response = await fetch(url, {
      method: "GET",
      mode: "cors",
    });

    if (!response.ok) throw new Error(`HTTP error ${response.status}`);

    return response.json();
  } else {
    // ✅ Send clean JSON body
    const response = await fetch(url, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "text/plain", // avoids CORS preflight
      },
      body: JSON.stringify({
        action,
        ...data,
      }),
    });

    if (!response.ok) throw new Error(`HTTP error ${response.status}`);

    return response.json();
  }
}

// == FETCH APPROVED POSTS ==
async function fetchApprovedPosts() {
  try {
    const posts = await callApi("getAll", "GET");
    approvedPosts = posts;
    approvedIds = new Set(posts.map((p) => p.ID));
    localStorage.setItem(
      "approvedPosts",
      JSON.stringify({ timestamp: Date.now(), data: posts })
    );
    console.log("Approved posts loaded:", approvedIds);
  } catch (e) {
    console.error("Failed to fetch approved posts:", e);
    const cached = localStorage.getItem("approvedPosts");
    if (cached) {
      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        approvedPosts = data;
        approvedIds = new Set(data.map((p) => p.ID));
        console.log("Using cached approved posts");
      }
    }
  }
}

// == EXTRACT POST DATA ==
function extractPostData(postEl) {
  const link = postEl.closest(MATCH_STRING);
  if (!link) return null;
  const href = link.getAttribute("href");
  const id = href.split("/posts/")[1];

  const titleEl = postEl.querySelector(".hl-text-lg-medium");
  const title = titleEl ? titleEl.innerText.trim() : "";

  const contentEl = postEl.querySelector(".content-description");
  const content = contentEl ? contentEl.innerText.trim() : "";

  const authorEl = postEl.querySelector('.user-profile a[href*="/users/"] div');
  const author = authorEl ? authorEl.innerText.trim() : "";

  const channelEl = postEl.querySelector('a[href*="/channels/"] div');
  const channel = channelEl ? channelEl.innerText.trim() : "";

  const timeEl = postEl.querySelector(
    ".text-communities-font-secondary.hl-text-sm-normal"
  );
  const timestamp = timeEl ? timeEl.innerText.trim() : "";

  const imgEl = postEl.querySelector('img[alt="Thumbnail"]');
  const image = imgEl ? imgEl.src : "";

  return { id, title, content, author, channel, timestamp, image };
}

// == ADD ADMIN BUTTON ==
function addAdminButton(postEl, isApproved) {
  const actionsContainer = postEl.querySelector(".response-content");
  if (!actionsContainer) return;
  if (postEl.querySelector(".admin-approve-btn")) return;

  const btn = document.createElement("button");
  btn.className =
    "admin-approve-btn ml-2 px-3 py-1 rounded text-sm font-medium border transition-colors";
  btn.style.backgroundColor = isApproved ? "#ef4444" : "#10b981";
  btn.style.color = "white";
  btn.style.border = "none";
  btn.style.cursor = "pointer";
  btn.innerText = isApproved ? "Disapprove" : "Approve";

  btn.onclick = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    const postData = extractPostData(postEl);
    if (!postData) return;

    const newStatus = !isApproved;
    const confirmMsg = newStatus
      ? "Approve this post? It will be visible to all users."
      : "Disapprove this post? It will be hidden from non-admin users.";

    if (!confirm(confirmMsg)) return;

    try {
      if (newStatus) {
        await callApi("add", "POST", { post: postData });
        approvedIds.add(postData.id);
        approvedPosts.push(postData);
      } else {
        await callApi("delete", "POST", { postId: postData.id });
        approvedIds.delete(postData.id);
        approvedPosts = approvedPosts.filter((p) => p.ID !== postData.id);
      }
      btn.innerText = newStatus ? "Disapprove" : "Approve";
      btn.style.backgroundColor = newStatus ? "#ef4444" : "#10b981";
      localStorage.setItem(
        "approvedPosts",
        JSON.stringify({ timestamp: Date.now(), data: approvedPosts })
      );
    } catch (err) {
      alert("Failed to update. Check console.");
      console.error(err);
    }
  };

  actionsContainer.appendChild(btn);
}

// == PROCESS A POST ==
function processPost(postEl) {
  
  if (postEl.dataset.processedByScript) return;
  postEl.dataset.processedByScript = "true";

  const postData = extractPostData(postEl);
  if (!postData) return;

  const isApproved = approvedIds.has(postData.id);

  if (isAdmin) {
    addAdminButton(postEl, isApproved);
  } else {
    postEl.style.display = isApproved ? "" : "none";
  }
}

// == OBSERVER ==
function startObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mut) => {
      mut.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          if (node.matches && node.matches('a[href*="/posts/"]')) {
            processPost(node);
          }
          const posts = node.querySelectorAll
            ? node.querySelectorAll('a[href*="/posts/"]')
            : [];
          posts.forEach(processPost);
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
  console.log("Observer started");
}


// == CHECK ADMIN ==
async function checkAdmin() {
  return new Promise((resolve) => {
    const emailEl = document.querySelector(
      "div.max-w-\\[280px\\].truncate.text-center.text-sm.font-normal.text-communities-font-primary.hl-text-sm-regular"
    );
    if (emailEl && emailEl.innerText.trim() === ADMIN_EMAIL) {
      resolve(true);
      return;
    }

    const avatarBtn = document.querySelector(
      "#pg-afcp-navbar__navigation-page-img-avatar-profile-btn"
    );
    if (!avatarBtn) {
      console.warn("Avatar button not found, assuming non-admin");
      resolve(false);
      return;
    }

    avatarBtn.click();

    const maxWait = 3000;
    const start = Date.now();
    const interval = setInterval(() => {
      const emailEl = document.querySelector(
        "div.max-w-\\[280px\\].truncate.text-center.text-sm.font-normal.text-communities-font-primary.hl-text-sm-regular"
      );
      if (emailEl) {
        clearInterval(interval);
        const email = emailEl.innerText.trim();
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
        resolve(email === ADMIN_EMAIL);
      } else if (Date.now() - start > maxWait) {
        clearInterval(interval);
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
        resolve(false);
      }
    }, 200);
  });
}

// == INIT ==
async function init() {
  console.log("Initializing...");
  isAdmin = await checkAdmin();
  console.log("Admin status:", isAdmin);
  await fetchApprovedPosts();
  document.querySelectorAll(MATCH_STRING).forEach(processPost);
  startObserver();
}

init();
