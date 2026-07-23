const STORAGE_KEY = "tennisPracticeLog";

const welcomeSection = document.getElementById("welcomeSection");
const newPracticeBtn = document.getElementById("newPracticeBtn");
const addAnotherBtn = document.getElementById("addAnotherBtn");
const practiceForm = document.getElementById("practiceForm");
const practiceLog = document.getElementById("practiceLog");
const logList = document.getElementById("logList");

let practices = [];
let editingIndex = null;

function normalizePractice(practice) {
  if (Array.isArray(practice.skills)) {
    return practice;
  }

  if (practice.skill) {
    practice.skills = [practice.skill];
    delete practice.skill;
  } else {
    practice.skills = [];
  }

  return practice;
}

function loadPractices() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return;
  }

  try {
    const loaded = JSON.parse(saved);
    practices = loaded.map(normalizePractice);
  } catch (error) {
    practices = [];
  }
}

function getSelectedSkills() {
  const checkboxes = document.querySelectorAll('input[name="skills"]:checked');
  const skills = [];

  checkboxes.forEach(function (checkbox) {
    skills.push(checkbox.value);
  });

  return skills;
}

function formatSkills(practice) {
  return practice.skills.join(", ");
}

function savePractices() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(practices));
}

function fillForm(practice) {
  document.getElementById("practiceDate").value = practice.date;
  document.getElementById("duration").value = practice.duration;
  document.getElementById("notes").value = practice.notes || "";

  document.querySelectorAll('input[name="skills"]').forEach(function (checkbox) {
    checkbox.checked = practice.skills.includes(checkbox.value);
  });
}

function showForm() {
  editingIndex = null;
  welcomeSection.classList.add("hidden");
  practiceLog.classList.add("hidden");
  practiceForm.classList.remove("hidden");
  practiceForm.reset();
  document.getElementById("skillError").classList.add("hidden");
  document.getElementById("practiceDate").value = new Date().toISOString().split("T")[0];
}

function editPractice(index) {
  editingIndex = index;
  welcomeSection.classList.add("hidden");
  practiceLog.classList.add("hidden");
  practiceForm.classList.remove("hidden");
  document.getElementById("skillError").classList.add("hidden");
  fillForm(practices[index]);
}

function hideForm() {
  practiceForm.classList.add("hidden");
  practiceForm.reset();
  document.getElementById("skillError").classList.add("hidden");
  editingIndex = null;
}

function formatDate(dateString) {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function renderLog() {
  logList.innerHTML = "";

  if (practices.length === 0) {
    practiceLog.classList.add("hidden");
    welcomeSection.classList.remove("hidden");
    return;
  }

  practices.forEach(function (practice, index) {
    const entry = document.createElement("li");
    entry.className = "log-entry";

    const header = document.createElement("div");
    header.className = "log-entry-header";

    const dateLine = document.createElement("p");
    dateLine.className = "log-date";
    dateLine.textContent = formatDate(practice.date);

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn edit-btn";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", function () {
      editPractice(index);
    });

    header.appendChild(dateLine);
    header.appendChild(editBtn);
    entry.appendChild(header);

    const details = document.createElement("p");
    details.className = "log-details";
    details.textContent = `${formatSkills(practice)} · ${practice.duration} min`;
    entry.appendChild(details);

    if (practice.notes) {
      const notes = document.createElement("p");
      notes.className = "log-notes";
      notes.textContent = practice.notes;
      entry.appendChild(notes);
    }

    logList.appendChild(entry);
  });

  welcomeSection.classList.add("hidden");
  practiceLog.classList.remove("hidden");
}

newPracticeBtn.addEventListener("click", showForm);
addAnotherBtn.addEventListener("click", showForm);

practiceForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const skills = getSelectedSkills();
  const skillError = document.getElementById("skillError");

  if (skills.length === 0) {
    skillError.classList.remove("hidden");
    return;
  }

  skillError.classList.add("hidden");

  const practice = {
    date: document.getElementById("practiceDate").value,
    duration: document.getElementById("duration").value,
    skills: skills,
    notes: document.getElementById("notes").value.trim(),
  };

  if (editingIndex !== null) {
    practices[editingIndex] = practice;
  } else {
    practices.unshift(practice);
  }

  savePractices();
  hideForm();
  renderLog();
});

loadPractices();
renderLog();
