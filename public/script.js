const apiBase = '';   // same domain, no CORS worries

function qs(sel, parent = document) {
  return parent.querySelector(sel);
}

let cachedCats = null;
let currentPage = 1;
let currentTag = null;
let token = localStorage.getItem("token");
let user = localStorage.getItem("user");

function debounce(fn, wait = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

// --- Auth ---

function updateAuthUI() {
  const isLoggedIn = !!token;
  if (isLoggedIn) {
    qs("#open-login").classList.add("hidden");
    qs("#logout").classList.remove("hidden");
    qs("#open-add").classList.remove("hidden");
  } else {
    qs("#open-login").classList.remove("hidden");
    qs("#logout").classList.add("hidden");
    qs("#open-add").classList.add("hidden");
  }
  render(); // Re-render to show/hide edit/delete buttons
}

function logout() {
  token = null;
  user = null;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  updateAuthUI();
  showToast("Logged out");
}

function openAuthModal(isRegister = false) {
  const modal = qs("#auth-modal");
  modal.classList.remove("hidden");
  qs("#auth-title").textContent = isRegister ? "Register" : "Login";
  qs("#auth-submit").textContent = isRegister ? "Register" : "Login";
  qs("#toggle-auth-mode").textContent = isRegister
    ? "Already have an account? Login"
    : "Need an account? Register";
  qs("#toggle-auth-mode").dataset.mode = isRegister ? "register" : "login";
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const mode = qs("#toggle-auth-mode").dataset.mode; // 'login' or 'register'
  const username = qs("#auth-username").value;
  const password = qs("#auth-password").value;

  const endpoint = mode === "register" ? "/register" : "/login";

  try {
    const res = await fetch(`${apiBase}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Auth failed");

    if (mode === "login") {
      token = data.token;
      user = data.username;
      localStorage.setItem("token", token);
      localStorage.setItem("user", user);
      qs("#auth-modal").classList.add("hidden");
      updateAuthUI();
      showToast("Logged in successfully");
    } else {
      // After register, switch to login or auto-login
      showToast("Registration successful! Please login.");
      openAuthModal(false);
    }
  } catch (err) {
    showToast(err.message);
  }
}

// --- Data ---

async function fetchTags() {
  try {
    const res = await fetch(`${apiBase}/tags`);
    if (!res.ok) throw new Error("Failed to fetch tags");
    const tags = await res.json();
    renderTags(tags);
  } catch (err) {
    console.error(err);
  }
}

function renderTags(tags) {
  const select = qs("#filter-tag");
  if (!select) return;
  select.innerHTML = '<option value="">All Tags</option>';
  tags.forEach((tag) => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    if (currentTag === tag) option.selected = true;
    select.appendChild(option);
  });
}

async function fetchCats() {
  let url = `${apiBase}/cats?page=${currentPage}&limit=8`; // Limit 5 as requested
  if (currentTag) url += `&tag=${encodeURIComponent(currentTag)}`;

  const search = qs("#search").value.trim();
  if (search) url += `&q=${encodeURIComponent(search)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load cats");
  return await res.json();
}

// --- UI ---

function showConfirm(message) {
  return new Promise((resolve) => {
    const modal = qs("#confirm-modal");
    const msg = qs(".confirm-message", modal);
    msg.textContent = message;
    modal.classList.remove("hidden");

    const yes = qs(".confirm-yes", modal);
    const no = qs(".confirm-no", modal);

    function cleanup(result) {
      modal.classList.add("hidden");
      yes.removeEventListener("click", onYes);
      no.removeEventListener("click", onNo);
      resolve(result);
    }

    function onYes() {
      cleanup(true);
    }
    function onNo() {
      cleanup(false);
    }

    yes.addEventListener("click", onYes);
    no.addEventListener("click", onNo);
  });
}

function showToast(msg, timeout = 3000) {
  const t = qs("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.remove("hidden");
  t.classList.add("show");
  clearTimeout(t._timeout);
  t._timeout = setTimeout(() => {
    t.classList.remove("show");
    t.classList.add("hidden");
  }, timeout);
}

function createCard(cat) {
  const el = document.createElement("div");
  el.className = "card";
  el.innerHTML = `
    <img src="${cat.img || "https://placekitten.com/300/200"}" alt="${
    cat.name
  }">
    <div class="card-body">
      <h3>${cat.name}</h3>
      <p class="tag">${cat.tag || ""}</p>
      <p class="descr">${cat.descrpt || ""}</p>
      <div class="actions ${!token ? "hidden" : ""}">
        <button class="edit">Edit</button>
        <button class="delete">Delete</button>
      </div>
    </div>
  `;

  if (token) {
    qs(".delete", el).addEventListener("click", async () => {
      const ok = await showConfirm(`Delete ${cat.name}?`);
      if (!ok) return;
      await fetch(`${apiBase}/cats/${cat.id}`, { method: "DELETE" });
      render();
      fetchTags();
    });

    qs(".edit", el).addEventListener("click", () => openForm(cat));
  }

  return el;
}

function renderPagination(pagination) {
  const container = qs("#pagination");
  container.innerHTML = "";

  if (pagination.totalPages <= 1) return;

  // Prev Button
  const prev = document.createElement("button");
  prev.textContent = "Prev";
  prev.disabled = pagination.page === 1;
  prev.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      render();
    }
  });
  container.appendChild(prev);

  // Page Numbers
  for (let i = 1; i <= pagination.totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = i === pagination.page ? "active" : "";
    btn.addEventListener("click", () => {
      currentPage = i;
      render();
    });
    container.appendChild(btn);
  }

  // Next Button
  const next = document.createElement("button");
  next.textContent = "Next";
  next.disabled = pagination.page === pagination.totalPages;
  next.addEventListener("click", () => {
    if (currentPage < pagination.totalPages) {
      currentPage++;
      render();
    }
  });
  container.appendChild(next);
}

async function render() {
  const container = qs("#cards");
  container.innerHTML = "<p>Loading...</p>";
  try {
    const response = await fetchCats();
    const cats = response.data;
    const pagination = response.pagination;

    container.innerHTML = "";
    if (!cats || cats.length === 0) {
      container.innerHTML = "<p>No cats found.</p>";
      qs("#pagination").innerHTML = "";
      return;
    }

    cats.forEach((c) => container.appendChild(createCard(c)));

    renderPagination(pagination);
  } catch (err) {
    container.innerHTML = `<p class=error>${err.message}</p>`;
  }
}

function openForm(cat = null) {
  const modal = qs("#add-modal");
  modal.classList.remove("hidden");
  qs("#cat-id").value = cat ? cat.id : "";
  qs("#name").value = cat ? cat.name : "";
  qs("#tag").value = cat ? cat.tag || "" : "";
  qs("#descrpt").value = cat ? cat.descrpt || "" : "";
  qs("#img").value = cat ? cat.img || "" : "";
}

function closeForm() {
  qs("#add-modal").classList.add("hidden");
}

async function saveForm(e) {
  e.preventDefault();
  const id = qs("#cat-id").value;
  const payload = {
    name: qs("#name").value.trim(),
    tag: qs("#tag").value.trim() || null,
    descrpt: qs("#descrpt").value.trim() || null,
    img: qs("#img").value.trim() || null,
  };

  if (!payload.name) {
    showToast("Name is required");
    return;
  }

  const method = id ? "PUT" : "POST";
  const url = id ? `${apiBase}/cats/${id}` : `${apiBase}/cats`;

  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  closeForm();
  render();
  fetchTags();
}

document.addEventListener("DOMContentLoaded", () => {
  updateAuthUI();
  fetchTags();
  render();

  qs("#open-add").addEventListener("click", () => openForm());
  qs("#cancel").addEventListener("click", closeForm);
  qs("#add-form").addEventListener("submit", saveForm);

  qs("#open-login").addEventListener("click", () => openAuthModal(false));
  qs("#logout").addEventListener("click", logout);

  qs("#auth-cancel").addEventListener("click", () =>
    qs("#auth-modal").classList.add("hidden")
  );
  qs("#auth-form").addEventListener("submit", handleAuthSubmit);

  qs("#toggle-auth-mode").addEventListener("click", (e) => {
    e.preventDefault();
    // If current mode is 'register', we want to go to 'login' (false)
    // If current mode is 'login', we want to go to 'register' (true)
    const currentMode = e.target.dataset.mode;
    const isRegister = currentMode === "login";
    openAuthModal(isRegister);
  });

  // Filter Dropdown
  const filterSelect = qs("#filter-tag");
  if (filterSelect) {
    filterSelect.addEventListener("change", (e) => {
      currentTag = e.target.value || null;
      currentPage = 1;
      render();
    });
  }
  // Search input
  const searchEl = qs("#search");
  if (searchEl) {
    searchEl.addEventListener(
      "input",
      debounce(() => {
        currentPage = 1;
        render();
      }, 300)
    );
  }
});
