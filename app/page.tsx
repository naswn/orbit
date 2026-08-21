"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CSSProperties } from "react";
import { supabase } from "./lib/supabase";
import { useRouter } from "next/navigation";

type PlanetCategory =
  | "Project"
  | "Learning"
  | "Creative";

type Priority =
  | "Low"
  | "Medium"
  | "High";

type Task = {
  id: string;
  title: string;
  category: string;
  done: boolean;
  created_at: string;
  user_id: string;
  completed_at: string | null;
  priority: Priority;
  due_date: string | null;
};

type Profile = {
  name: string;
  avatar: string;
};

const planetInfo: Record<
  PlanetCategory,
  {
    icon: string;
    name: string;
    description: string;
    color: string;
  }
> = {
  Project: {
    icon: "🎯",
    name: "Projects",
    description: "Things you're building",
    color: "blue",
  },
  Learning: {
    icon: "📚",
    name: "Learning",
    description: "Skills you're developing",
    color: "emerald",
  },
  Creative: {
    icon: "🎨",
    name: "Creative",
    description: "Your creative universe",
    color: "orange",
  },
};

function formatDate(date: string | null) {
  if (!date) return "No due date";

  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getTodayString() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isOverdue(task: Task) {
  if (!task.due_date || task.done) {
    return false;
  }

  return (
    task.due_date < getTodayString()
  );
}

function isDueSoon(task: Task) {
  if (!task.due_date || task.done) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(
    `${task.due_date}T00:00:00`
  );

  const difference =
    (due.getTime() -
      today.getTime()) /
    (1000 * 60 * 60 * 24);

  return (
    difference >= 0 &&
    difference <= 2
  );
}

export default function Home() {
  const router = useRouter();

  // =========================
  // STATE
  // =========================

  const [tasks, setTasks] = useState<
    Task[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [userEmail, setUserEmail] =
    useState("");

  const [userId, setUserId] =
    useState("");

  const [adding, setAdding] =
    useState(false);

  const [newTitle, setNewTitle] =
    useState("");

  const [newCategory, setNewCategory] =
    useState<PlanetCategory>(
      "Project"
    );

  const [newPriority, setNewPriority] =
    useState<Priority>("Medium");

  const [newDueDate, setNewDueDate] =
    useState("");

  const [selectedPlanet, setSelectedPlanet] =
    useState<PlanetCategory | null>(
      null
    );

  const [hoveredPlanet, setHoveredPlanet] =
    useState<PlanetCategory | null>(
      null
    );

  const [editingTask, setEditingTask] =
    useState<Task | null>(null);

  const [editTitle, setEditTitle] =
    useState("");

  const [editCategory, setEditCategory] =
    useState<PlanetCategory>(
      "Project"
    );

  const [editPriority, setEditPriority] =
    useState<Priority>("Medium");

  const [editDueDate, setEditDueDate] =
    useState("");

  const [savingEdit, setSavingEdit] =
    useState(false);

  const [deletingTaskId, setDeletingTaskId] =
    useState<string | null>(null);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [
    notificationsOpen,
    setNotificationsOpen,
  ] = useState(false);

  const [
    analyticsOpen,
    setAnalyticsOpen,
  ] = useState(false);

  const [
    calendarOpen,
    setCalendarOpen,
  ] = useState(false);

  const [
    settingsOpen,
    setSettingsOpen,
  ] = useState(false);

  const [search, setSearch] =
    useState("");

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState("All");

  const [
    priorityFilter,
    setPriorityFilter,
  ] = useState("All");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("All");

  const [
    overdueOnly,
    setOverdueOnly,
  ] = useState(false);

  const [selectedDate, setSelectedDate] =
    useState(getTodayString());

  const [profile, setProfile] =
    useState<Profile>({
      name: "",
      avatar: "",
    });

  const [profileName, setProfileName] =
    useState("");

  const [
    profileAvatar,
    setProfileAvatar,
  ] = useState("");

  const [
    savingProfile,
    setSavingProfile,
  ] = useState(false);

  const [
    notificationsEnabled,
    setNotificationsEnabled,
  ] = useState(false);

  const [darkMode, setDarkMode] =
    useState(true);

  // =========================
  // THEME
  // =========================

  const themeStyle = {
    "--orbit-bg": darkMode
      ? "#070812"
      : "#f1f5f9",

    "--orbit-card": darkMode
      ? "#0d1020"
      : "#ffffff",

    "--orbit-card-soft": darkMode
      ? "#101426"
      : "#f8fafc",

    "--orbit-input": darkMode
      ? "rgba(0,0,0,0.20)"
      : "#f8fafc",

    "--orbit-border": darkMode
      ? "rgba(255,255,255,0.10)"
      : "rgba(15,23,42,0.10)",

    "--orbit-border-strong":
      darkMode
        ? "rgba(255,255,255,0.16)"
        : "rgba(15,23,42,0.16)",

    "--orbit-text": darkMode
      ? "#ffffff"
      : "#0f172a",

    "--orbit-muted": darkMode
      ? "rgba(255,255,255,0.45)"
      : "rgba(15,23,42,0.55)",

    "--orbit-subtle": darkMode
      ? "rgba(255,255,255,0.30)"
      : "rgba(15,23,42,0.40)",
  } as CSSProperties;

  const pageClass =
    "min-h-screen overflow-x-hidden bg-[var(--orbit-bg)] text-[var(--orbit-text)] transition-colors duration-300";

  const cardClass =
    "rounded-3xl border border-[var(--orbit-border)] bg-[var(--orbit-card)] transition-colors duration-300";

  const softCardClass =
    "rounded-2xl border border-[var(--orbit-border)] bg-[var(--orbit-card-soft)]";

  const inputClass =
    "w-full rounded-xl border border-[var(--orbit-border)] bg-[var(--orbit-input)] px-4 py-3 text-sm text-[var(--orbit-text)] outline-none transition placeholder:text-[var(--orbit-muted)] focus:border-violet-400";

  const selectClass =
    "rounded-xl border border-[var(--orbit-border)] bg-[var(--orbit-card-soft)] px-3 py-3 text-sm text-[var(--orbit-text)] outline-none";

  // =========================
  // AUTH
  // =========================

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    setLoading(true);

    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    if (!user) {
      router.replace("/auth");
      return;
    }

    setUserId(user.id);
    setUserEmail(user.email || "");

    const savedName =
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Explorer";

    const savedAvatar =
      user.user_metadata?.avatar || "";

    const savedNotifications =
      localStorage.getItem(
        "orbit_notifications"
      );

    const savedTheme =
      localStorage.getItem(
        "orbit_theme"
      );

    setProfile({
      name: savedName,
      avatar: savedAvatar,
    });

    setProfileName(savedName);
    setProfileAvatar(savedAvatar);

    setNotificationsEnabled(
      savedNotifications === "true"
    );

    setDarkMode(
      savedTheme !== "light"
    );

    await loadTasks(user.id);

    setLoading(false);
  }

  // =========================
  // LOAD TASKS
  // =========================

  async function loadTasks(
    currentUserId: string
  ) {
    const { data, error } =
      await supabase
        .from("tasks")
        .select(
          "id, title, category, done, created_at, user_id, completed_at, priority, due_date"
        )
        .eq(
          "user_id",
          currentUserId
        )
        .order("created_at", {
          ascending: true,
        });

    if (error) {
      console.error(
        "Error loading tasks:",
        error
      );
      return;
    }

    setTasks(
      (data || []).map((task) => ({
        ...task,
        priority:
          task.priority || "Medium",
      }))
    );
  }

  // =========================
  // ADD TASK
  // =========================

  async function addTask() {
    if (!newTitle.trim()) return;

    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    if (!user) {
      router.replace("/auth");
      return;
    }

    const { data, error } =
      await supabase
        .from("tasks")
        .insert({
          title: newTitle.trim(),
          category: newCategory,
          priority: newPriority,
          due_date:
            newDueDate || null,
          done: false,
          user_id: user.id,
          completed_at: null,
        })
        .select(
          "id, title, category, done, created_at, user_id, completed_at, priority, due_date"
        )
        .single();

    if (error) {
      console.error(
        "Error adding task:",
        error
      );

      alert(
        "Could not add mission. Check your Supabase columns."
      );

      return;
    }

    if (data) {
      setTasks((current) => [
        ...current,
        {
          ...data,
          priority:
            data.priority || "Medium",
        },
      ]);
    }

    setNewTitle("");
    setNewCategory("Project");
    setNewPriority("Medium");
    setNewDueDate("");
    setAdding(false);
  }

  // =========================
  // TOGGLE TASK
  // =========================

  async function toggleTask(
    task: Task
  ) {
    const newDone = !task.done;

    const completedAt = newDone
      ? new Date().toISOString()
      : null;

    setTasks((current) =>
      current.map((item) =>
        item.id === task.id
          ? {
              ...item,
              done: newDone,
              completed_at:
                completedAt,
            }
          : item
      )
    );

    const { error } =
      await supabase
        .from("tasks")
        .update({
          done: newDone,
          completed_at: completedAt,
        })
        .eq("id", task.id);

    if (error) {
      console.error(
        "Error updating task:",
        error
      );

      setTasks((current) =>
        current.map((item) =>
          item.id === task.id
            ? task
            : item
        )
      );

      return;
    }

    if (newDone) {
      sendBrowserNotification(
        "Mission completed 🎉",
        `"${task.title}" has been completed.`
      );
    }
  }

  // =========================
  // EDIT
  // =========================

  function startEditing(
    task: Task
  ) {
    setEditingTask(task);
    setEditTitle(task.title);

    setEditCategory(
      task.category as PlanetCategory
    );

    setEditPriority(
      task.priority || "Medium"
    );

    setEditDueDate(
      task.due_date || ""
    );
  }

  function cancelEditing() {
    setEditingTask(null);
    setEditTitle("");
    setEditCategory("Project");
    setEditPriority("Medium");
    setEditDueDate("");
  }

  async function saveEdit() {
    if (!editingTask) return;

    if (!editTitle.trim()) return;

    setSavingEdit(true);

    const { data, error } =
      await supabase
        .from("tasks")
        .update({
          title: editTitle.trim(),
          category: editCategory,
          priority: editPriority,
          due_date:
            editDueDate || null,
        })
        .eq(
          "id",
          editingTask.id
        )
        .select(
          "id, title, category, done, created_at, user_id, completed_at, priority, due_date"
        )
        .single();

    if (error) {
      console.error(
        "Error editing task:",
        error
      );

      alert(
        "Failed to update mission."
      );

      setSavingEdit(false);
      return;
    }

    if (data) {
      setTasks((current) =>
        current.map((item) =>
          item.id ===
          editingTask.id
            ? {
                ...data,
                priority:
                  data.priority ||
                  "Medium",
              }
            : item
        )
      );
    }

    cancelEditing();
    setSavingEdit(false);
  }

  // =========================
  // DELETE
  // =========================

  async function deleteTask(
    task: Task
  ) {
    const confirmed =
      window.confirm(
        `Delete "${task.title}"?`
      );

    if (!confirmed) return;

    setDeletingTaskId(task.id);

    const { error } =
      await supabase
        .from("tasks")
        .delete()
        .eq("id", task.id);

    if (error) {
      console.error(
        "Error deleting task:",
        error
      );

      alert(
        "Failed to delete mission."
      );

      setDeletingTaskId(null);
      return;
    }

    setTasks((current) =>
      current.filter(
        (item) =>
          item.id !== task.id
      )
    );

    if (
      editingTask?.id === task.id
    ) {
      cancelEditing();
    }

    setDeletingTaskId(null);
  }

  // =========================
  // PROFILE
  // =========================

  async function saveProfile() {
    setSavingProfile(true);

    const newName =
      profileName.trim() ||
      userEmail.split("@")[0];

    const newAvatar =
      profileAvatar.trim();

    const { error } =
      await supabase.auth.updateUser({
        data: {
          name: newName,
          avatar: newAvatar,
        },
      });

    if (error) {
      console.error(
        "Profile update error:",
        error
      );

      alert(
        "Could not save profile."
      );

      setSavingProfile(false);
      return;
    }

    setProfile({
      name: newName,
      avatar: newAvatar,
    });

    setProfileName(newName);
    setProfileAvatar(newAvatar);

    setSavingProfile(false);

    alert(
      "Profile updated successfully."
    );
  }

  // =========================
  // NOTIFICATIONS
  // =========================

  function sendBrowserNotification(
    title: string,
    body: string
  ) {
    if (
      notificationsEnabled &&
      "Notification" in window &&
      Notification.permission ===
        "granted"
    ) {
      new Notification(title, {
        body,
      });
    }
  }

  async function enableNotifications() {
    if (
      !("Notification" in window)
    ) {
      alert(
        "Your browser does not support notifications."
      );
      return;
    }

    const permission =
      await Notification.requestPermission();

    if (permission === "granted") {
      setNotificationsEnabled(true);

      localStorage.setItem(
        "orbit_notifications",
        "true"
      );

      new Notification(
        "ORBIT notifications enabled 🚀",
        {
          body:
            "You will receive mission reminders.",
        }
      );
    } else {
      setNotificationsEnabled(false);

      localStorage.setItem(
        "orbit_notifications",
        "false"
      );
    }
  }

  // =========================
  // LOGOUT
  // =========================

  async function logout() {
    setLoggingOut(true);

    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        "Logout error:",
        error
      );

      setLoggingOut(false);
      return;
    }

    router.replace("/auth");
  }

  // =========================
  // STREAK
  // =========================

  const streak = useMemo(() => {
    const completedDates =
      new Set(
        tasks
          .filter(
            (task) =>
              task.done &&
              task.completed_at
          )
          .map((task) =>
            task.completed_at!.slice(
              0,
              10
            )
          )
      );

    let count = 0;

    const date = new Date();

    date.setHours(
      0,
      0,
      0,
      0
    );

    while (true) {
      const dateString =
        date.toISOString().slice(
          0,
          10
        );

      if (
        !completedDates.has(
          dateString
        )
      ) {
        break;
      }

      count++;

      date.setDate(
        date.getDate() - 1
      );
    }

    return count;
  }, [tasks]);

  // =========================
  // ANALYTICS
  // =========================

  const completed =
    tasks.filter(
      (task) => task.done
    ).length;

  const pending =
    tasks.length - completed;

  const progress =
    tasks.length > 0
      ? Math.round(
          (completed /
            tasks.length) *
            100
        )
      : 0;

  const overdueCount =
    tasks.filter(
      isOverdue
    ).length;

  const dueSoonCount =
    tasks.filter(
      isDueSoon
    ).length;

  const categoryStats =
    (
      [
        "Project",
        "Learning",
        "Creative",
      ] as PlanetCategory[]
    ).map((category) => {
      const categoryTasks =
        tasks.filter(
          (task) =>
            task.category ===
            category
        );

      const categoryCompleted =
        categoryTasks.filter(
          (task) => task.done
        ).length;

      return {
        category,
        total:
          categoryTasks.length,
        completed:
          categoryCompleted,
        progress:
          categoryTasks.length >
          0
            ? Math.round(
                (categoryCompleted /
                  categoryTasks.length) *
                  100
              )
            : 0,
      };
    });

  // =========================
  // FILTERS
  // =========================

  const visibleTasks = useMemo(
    () => {
      return tasks.filter(
        (task) => {
          if (
            selectedPlanet &&
            task.category !==
              selectedPlanet
          ) {
            return false;
          }

          if (
            search &&
            !task.title
              .toLowerCase()
              .includes(
                search.toLowerCase()
              )
          ) {
            return false;
          }

          if (
            categoryFilter !==
              "All" &&
            task.category !==
              categoryFilter
          ) {
            return false;
          }

          if (
            priorityFilter !==
              "All" &&
            task.priority !==
              priorityFilter
          ) {
            return false;
          }

          if (
            statusFilter ===
              "Completed" &&
            !task.done
          ) {
            return false;
          }

          if (
            statusFilter ===
              "Pending" &&
            task.done
          ) {
            return false;
          }

          if (
            overdueOnly &&
            !isOverdue(task)
          ) {
            return false;
          }

          return true;
        }
      );
    },
    [
      tasks,
      selectedPlanet,
      search,
      categoryFilter,
      priorityFilter,
      statusFilter,
      overdueOnly,
    ]
  );

  // =========================
  // CALENDAR
  // =========================

  const calendarTasks =
    tasks.filter(
      (task) =>
        task.due_date ===
        selectedDate
    );

  // =========================
  // PLANET PROGRESS
  // =========================

  function getPlanetProgress(
    category: PlanetCategory
  ) {
    const categoryTasks =
      tasks.filter(
        (task) =>
          task.category ===
          category
      );

    if (!categoryTasks.length) {
      return 0;
    }

    const finished =
      categoryTasks.filter(
        (task) => task.done
      ).length;

    return Math.round(
      (finished /
        categoryTasks.length) *
        100
    );
  }

  function selectPlanet(
    category: PlanetCategory
  ) {
    setSelectedPlanet(
      (current) =>
        current === category
          ? null
          : category
    );
  }

  // =========================
  // THEME
  // =========================

  function toggleTheme() {
    const newValue = !darkMode;

    setDarkMode(newValue);

    localStorage.setItem(
      "orbit_theme",
      newValue
        ? "dark"
        : "light"
    );
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070812] text-white">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-violet-500 text-2xl shadow-[0_0_50px_rgba(139,92,246,0.6)]">
            ✦
          </div>

          <p className="text-sm text-white/40">
            Entering your universe...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className={pageClass}
      style={themeStyle}
    >
      {/* =========================
          NAVBAR
      ========================== */}

      <nav className="sticky top-0 z-[100] flex items-center justify-between border-b border-[var(--orbit-border)] bg-[var(--orbit-bg)]/90 px-4 py-4 backdrop-blur-xl transition-colors duration-300 md:px-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            ORBIT
            <span className="text-violet-400">
              .
            </span>
          </h1>

          <p className="text-[10px] tracking-wider text-[var(--orbit-muted)]">
            YOUR PERSONAL UNIVERSE
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* NOTIFICATIONS */}

          <div className="relative">
            <button
              onClick={() =>
                setNotificationsOpen(
                  !notificationsOpen
                )
              }
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--orbit-border)] text-lg transition hover:bg-black/5 dark:hover:bg-white/5"
              title="Notifications"
            >
              🔔

              {(overdueCount > 0 ||
                dueSoonCount > 0) && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-12 z-[200] w-80 rounded-2xl border border-[var(--orbit-border)] bg-[var(--orbit-card-soft)] p-4 text-[var(--orbit-text)] shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold">
                    Notifications
                  </h3>

                  <button
                    onClick={() =>
                      setNotificationsOpen(
                        false
                      )
                    }
                    className="text-[var(--orbit-muted)] hover:text-[var(--orbit-text)]"
                  >
                    ✕
                  </button>
                </div>

                {overdueCount >
                  0 && (
                  <div className="mb-3 rounded-xl border border-red-400/20 bg-red-500/10 p-3">
                    <p className="text-sm font-medium text-red-500">
                      ⚠️ Overdue missions
                    </p>

                    <p className="mt-1 text-xs text-[var(--orbit-muted)]">
                      You have{" "}
                      {overdueCount}{" "}
                      overdue mission
                      {overdueCount !==
                      1
                        ? "s"
                        : ""}
                      .
                    </p>
                  </div>
                )}

                {dueSoonCount >
                  0 && (
                  <div className="mb-3 rounded-xl border border-yellow-400/20 bg-yellow-500/10 p-3">
                    <p className="text-sm font-medium text-yellow-600">
                      ⏰ Due soon
                    </p>

                    <p className="mt-1 text-xs text-[var(--orbit-muted)]">
                      {dueSoonCount}{" "}
                      mission
                      {dueSoonCount !==
                      1
                        ? "s are"
                        : " is"}{" "}
                      due soon.
                    </p>
                  </div>
                )}

                {overdueCount ===
                  0 &&
                  dueSoonCount ===
                    0 && (
                    <div className="py-6 text-center text-sm text-[var(--orbit-muted)]">
                      ✨ All clear.
                      <br />
                      No urgent missions.
                    </div>
                  )}

                <button
                  onClick={
                    enableNotifications
                  }
                  className="mt-2 w-full rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-400"
                >
                  {notificationsEnabled
                    ? "Notifications enabled"
                    : "Enable browser notifications"}
                </button>
              </div>
            )}
          </div>

          {/* PROFILE */}

          <div className="relative">
            <button
              onClick={() =>
                setProfileOpen(
                  !profileOpen
                )
              }
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-violet-500 font-bold text-white shadow-[0_0_25px_rgba(139,92,246,0.5)]"
              title="Profile"
            >
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                profile.name
                  .charAt(0)
                  .toUpperCase() ||
                "N"
              )}
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 z-[200] w-80 rounded-2xl border border-[var(--orbit-border)] bg-[var(--orbit-card-soft)] p-5 text-[var(--orbit-text)] shadow-2xl">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-violet-500 text-lg font-bold text-white">
                    {profile.avatar ? (
                      <img
                        src={
                          profile.avatar
                        }
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      profile.name
                        .charAt(0)
                        .toUpperCase()
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold">
                      {profile.name}
                    </p>

                    <p className="truncate text-xs text-[var(--orbit-muted)]">
                      {userEmail}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs text-[var(--orbit-muted)]">
                    Profile name
                  </label>

                  <input
                    value={
                      profileName
                    }
                    onChange={(e) =>
                      setProfileName(
                        e.target.value
                      )
                    }
                    className={inputClass}
                  />

                  <label className="block text-xs text-[var(--orbit-muted)]">
                    Avatar URL
                  </label>

                  <input
                    value={
                      profileAvatar
                    }
                    onChange={(e) =>
                      setProfileAvatar(
                        e.target.value
                      )
                    }
                    placeholder="https://..."
                    className={inputClass}
                  />

                  <button
                    onClick={
                      saveProfile
                    }
                    disabled={
                      savingProfile
                    }
                    className="w-full rounded-xl bg-violet-500 py-2 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:opacity-50"
                  >
                    {savingProfile
                      ? "Saving..."
                      : "Save profile"}
                  </button>

                  {/* LOGOUT — moved inside the dropdown so it's always
                      reachable, including on mobile where the old
                      navbar-only button was hidden by "sm:block" */}

                  <button
                    onClick={logout}
                    disabled={loggingOut}
                    className="w-full rounded-xl bg-red-500/10 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-500/20 disabled:opacity-50"
                  >
                    {loggingOut
                      ? "Logging out..."
                      : "Logout"}
                  </button>

                  <button
                    onClick={() =>
                      setProfileOpen(
                        false
                      )
                    }
                    className="w-full rounded-xl border border-[var(--orbit-border)] py-2 text-sm text-[var(--orbit-muted)] hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* LOGOUT (desktop shortcut, unchanged for sm+ screens) */}

          <button
            onClick={logout}
            disabled={
              loggingOut
            }
            className="hidden rounded-xl border border-[var(--orbit-border)] px-4 py-2 text-sm text-[var(--orbit-muted)] transition hover:bg-black/5 hover:text-[var(--orbit-text)] dark:hover:bg-white/5 sm:block"
          >
            {loggingOut
              ? "..."
              : "Logout"}
          </button>
        </div>
      </nav>

      {/* =========================
          CONTENT
      ========================== */}

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-10 md:py-10">
        {/* WELCOME */}

        <section className="mb-8">
          <p className="mb-2 text-sm text-violet-500">
            YOUR ORBIT
          </p>

          <h2 className="text-4xl font-bold tracking-tight md:text-6xl">
            Welcome back,
            <br />

            <span className="text-[var(--orbit-muted)]">
              {profile.name}.
            </span>
          </h2>

          <p className="mt-4 max-w-xl text-[var(--orbit-muted)]">
            Your universe is moving.
            Keep your planets aligned
            and make progress today.
          </p>
        </section>

        {/* QUICK STATS */}

        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div
            className={`${softCardClass} p-4`}
          >
            <p className="text-xs text-[var(--orbit-muted)]">
              TOTAL
            </p>

            <p className="mt-1 text-2xl font-bold">
              {tasks.length}
            </p>
          </div>

          <div
            className={`${softCardClass} p-4`}
          >
            <p className="text-xs text-[var(--orbit-muted)]">
              COMPLETED
            </p>

            <p className="mt-1 text-2xl font-bold">
              {completed}
            </p>
          </div>

          <div
            className={`${softCardClass} p-4`}
          >
            <p className="text-xs text-[var(--orbit-muted)]">
              PROGRESS
            </p>

            <p className="mt-1 text-2xl font-bold">
              {progress}%
            </p>
          </div>

          <div
            className={`${softCardClass} p-4`}
          >
            <p className="text-xs text-[var(--orbit-muted)]">
              STREAK
            </p>

            <p className="mt-1 text-2xl font-bold">
              {streak} 🔥
            </p>
          </div>
        </div>

        {/* ACTIONS */}

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() =>
              setAnalyticsOpen(
                !analyticsOpen
              )
            }
            className="rounded-xl border border-[var(--orbit-border)] px-4 py-2 text-sm text-[var(--orbit-muted)] transition hover:bg-black/5 hover:text-[var(--orbit-text)] dark:hover:bg-white/5"
          >
            📊 Analytics
          </button>

          <button
            onClick={() =>
              setCalendarOpen(
                !calendarOpen
              )
            }
            className="rounded-xl border border-[var(--orbit-border)] px-4 py-2 text-sm text-[var(--orbit-muted)] transition hover:bg-black/5 hover:text-[var(--orbit-text)] dark:hover:bg-white/5"
          >
            📅 Calendar
          </button>

          <button
            onClick={() =>
              setSettingsOpen(
                !settingsOpen
              )
            }
            className="rounded-xl border border-[var(--orbit-border)] px-4 py-2 text-sm text-[var(--orbit-muted)] transition hover:bg-black/5 hover:text-[var(--orbit-text)] dark:hover:bg-white/5"
          >
            ⚙️ Settings
          </button>
        </div>

        {/* ANALYTICS */}

        {analyticsOpen && (
          <section
            className={`${cardClass} mb-6 p-6`}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-violet-500">
                  INSIGHTS
                </p>

                <h3 className="text-2xl font-semibold">
                  Analytics
                </h3>
              </div>

              <button
                onClick={() =>
                  setAnalyticsOpen(
                    false
                  )
                }
                className="text-[var(--orbit-muted)] hover:text-[var(--orbit-text)]"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div
                className={`${softCardClass} p-5`}
              >
                <p className="text-xs text-[var(--orbit-muted)]">
                  COMPLETED
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {completed}
                </p>

                <p className="mt-1 text-xs text-[var(--orbit-subtle)]">
                  missions completed
                </p>
              </div>

              <div
                className={`${softCardClass} p-5`}
              >
                <p className="text-xs text-[var(--orbit-muted)]">
                  PENDING
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {pending}
                </p>

                <p className="mt-1 text-xs text-[var(--orbit-subtle)]">
                  missions remaining
                </p>
              </div>

              <div
                className={`${softCardClass} p-5`}
              >
                <p className="text-xs text-[var(--orbit-muted)]">
                  OVERDUE
                </p>

                <p className="mt-2 text-3xl font-bold text-red-500">
                  {overdueCount}
                </p>

                <p className="mt-1 text-xs text-[var(--orbit-subtle)]">
                  need attention
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {categoryStats.map(
                (item) => (
                  <div
                    key={
                      item.category
                    }
                  >
                    <div className="mb-2 flex justify-between text-sm">
                      <span>
                        {
                          planetInfo[
                            item
                              .category
                          ]
                            .icon
                        }{" "}
                        {
                          item.category
                        }
                      </span>

                      <span className="text-[var(--orbit-muted)]">
                        {
                          item.completed
                        }
                        /
                        {
                          item.total
                        }
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-violet-500 transition-all duration-700"
                        style={{
                          width: `${item.progress}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        )}

        {/* CALENDAR */}

        {calendarOpen && (
          <section
            className={`${cardClass} mb-6 p-6`}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-violet-500">
                  MISSIONS BY DATE
                </p>

                <h3 className="text-2xl font-semibold">
                  Calendar
                </h3>
              </div>

              <button
                onClick={() =>
                  setCalendarOpen(
                    false
                  )
                }
                className="text-[var(--orbit-muted)] hover:text-[var(--orbit-text)]"
              >
                ✕
              </button>
            </div>

            <input
              type="date"
              value={
                selectedDate
              }
              onChange={(e) =>
                setSelectedDate(
                  e.target.value
                )
              }
              className={selectClass}
            />

            <div className="mt-5">
              <p className="mb-3 text-sm text-[var(--orbit-muted)]">
                Missions for{" "}
                {formatDate(
                  selectedDate
                )}
              </p>

              {calendarTasks.length ===
              0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--orbit-border)] p-6 text-center text-sm text-[var(--orbit-muted)]">
                  No missions scheduled
                  for this date.
                </div>
              ) : (
                <div className="space-y-2">
                  {calendarTasks.map(
                    (task) => (
                      <div
                        key={task.id}
                        className={softCardClass +
                          " p-4"}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {
                              task.title
                            }
                          </span>

                          <span
                            className={
                              task.done
                                ? "text-emerald-500"
                                : isOverdue(
                                    task
                                  )
                                ? "text-red-500"
                                : "text-[var(--orbit-muted)]"
                            }
                          >
                            {task.done
                              ? "Completed"
                              : isOverdue(
                                  task
                                )
                              ? "Overdue"
                              : "Pending"}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* SETTINGS */}

        {settingsOpen && (
          <section
            className={`${cardClass} mb-6 p-6`}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-violet-500">
                  ORBIT CONFIGURATION
                </p>

                <h3 className="text-2xl font-semibold">
                  Settings
                </h3>
              </div>

              <button
                onClick={() =>
                  setSettingsOpen(
                    false
                  )
                }
                className="text-[var(--orbit-muted)] hover:text-[var(--orbit-text)]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div
                className={`${softCardClass} flex items-center justify-between p-4`}
              >
                <div>
                  <p className="font-medium">
                    Browser notifications
                  </p>

                  <p className="text-xs text-[var(--orbit-muted)]">
                    Receive mission reminders.
                  </p>
                </div>

                <button
                  onClick={
                    enableNotifications
                  }
                  className={`rounded-xl px-4 py-2 text-sm ${
                    notificationsEnabled
                      ? "bg-emerald-500/20 text-emerald-600"
                      : "bg-violet-500 text-white"
                  }`}
                >
                  {notificationsEnabled
                    ? "Enabled"
                    : "Enable"}
                </button>
              </div>

              <div
                className={`${softCardClass} flex items-center justify-between p-4`}
              >
                <div>
                  <p className="font-medium">
                    Theme
                  </p>

                  <p className="text-xs text-[var(--orbit-muted)]">
                    Switch between dark
                    and light mode.
                  </p>
                </div>

                <button
                  onClick={
                    toggleTheme
                  }
                  className="rounded-xl border border-[var(--orbit-border)] px-4 py-2 text-sm"
                >
                  {darkMode
                    ? "🌙 Dark"
                    : "☀️ Light"}
                </button>
              </div>

              <div
                className={`${softCardClass} p-4`}
              >
                <p className="font-medium">
                  Account
                </p>

                <p className="mt-1 text-xs text-[var(--orbit-muted)]">
                  {userEmail}
                </p>

                <p className="mt-1 break-all text-[10px] text-[var(--orbit-subtle)]">
                  ID: {userId}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* =========================
            MAIN DASHBOARD
        ========================== */}

        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* UNIVERSE */}

          <div className="relative min-h-[520px] overflow-hidden rounded-3xl border border-[var(--orbit-border)] bg-[var(--orbit-card)] transition-colors duration-300">
            <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/5 blur-3xl" />

            <div className="absolute left-6 top-6 z-40">
              <p className="text-sm text-[var(--orbit-muted)]">
                YOUR UNIVERSE
              </p>

              <h3 className="mt-1 text-2xl font-semibold">
                Goals
              </h3>
            </div>

            {/* STARS */}

            <span className="star left-[12%] top-[20%]" />
            <span className="star left-[25%] top-[72%]" />
            <span className="star left-[35%] top-[15%]" />
            <span className="star left-[48%] top-[85%]" />
            <span className="star left-[62%] top-[18%]" />
            <span className="star left-[75%] top-[70%]" />
            <span className="star left-[87%] top-[35%]" />
            <span className="star left-[82%] top-[82%]" />
            <span className="star left-[15%] top-[48%]" />
            <span className="star left-[92%] top-[18%]" />

            {/* RINGS */}

            <div className="orbit-ring ring-large" />
            <div className="orbit-ring ring-medium" />
            <div className="orbit-ring ring-small" />

            {/* SUN */}

            <div className="absolute left-1/2 top-1/2 z-20 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
              <div className="absolute inset-0 animate-pulse rounded-full bg-violet-500/30 blur-xl" />

              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-violet-500 shadow-[0_0_70px_rgba(139,92,246,0.8)]">
                <span className="text-3xl">
                  ✦
                </span>
              </div>
            </div>

            {/* PROJECT */}

            <div className="planet-orbit orbit-blue">
              <div
                className="relative"
                onMouseEnter={() =>
                  setHoveredPlanet(
                    "Project"
                  )
                }
                onMouseLeave={() =>
                  setHoveredPlanet(
                    null
                  )
                }
              >
                {hoveredPlanet ===
                  "Project" && (
                  <div className="absolute -top-14 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-xl border border-blue-400/20 bg-[var(--orbit-card-soft)] px-3 py-2 text-xs text-[var(--orbit-text)] shadow-xl backdrop-blur-xl">
                    🎯 Projects{" "}
                    <span className="ml-2 text-[var(--orbit-muted)]">
                      {getPlanetProgress(
                        "Project"
                      )}
                      %
                    </span>
                  </div>
                )}

                <button
                  onClick={() =>
                    selectPlanet(
                      "Project"
                    )
                  }
                  className={`planet planet-blue transition-all ${
                    selectedPlanet ===
                    "Project"
                      ? "scale-125 ring-4 ring-blue-300/50 shadow-[0_0_60px_rgba(59,130,246,0.9)]"
                      : ""
                  } ${
                    getPlanetProgress(
                      "Project"
                    ) > 0
                      ? "brightness-125"
                      : "opacity-60 grayscale"
                  }`}
                >
                  🎯
                </button>
              </div>
            </div>

            {/* LEARNING */}

            <div className="planet-orbit orbit-green">
              <div
                className="relative"
                onMouseEnter={() =>
                  setHoveredPlanet(
                    "Learning"
                  )
                }
                onMouseLeave={() =>
                  setHoveredPlanet(
                    null
                  )
                }
              >
                {hoveredPlanet ===
                  "Learning" && (
                  <div className="absolute -top-14 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-xl border border-emerald-400/20 bg-[var(--orbit-card-soft)] px-3 py-2 text-xs text-[var(--orbit-text)] shadow-xl backdrop-blur-xl">
                    📚 Learning{" "}
                    <span className="ml-2 text-[var(--orbit-muted)]">
                      {getPlanetProgress(
                        "Learning"
                      )}
                      %
                    </span>
                  </div>
                )}

                <button
                  onClick={() =>
                    selectPlanet(
                      "Learning"
                    )
                  }
                  className={`planet planet-green transition-all ${
                    selectedPlanet ===
                    "Learning"
                      ? "scale-125 ring-4 ring-emerald-300/50 shadow-[0_0_60px_rgba(16,185,129,0.9)]"
                      : ""
                  } ${
                    getPlanetProgress(
                      "Learning"
                    ) > 0
                      ? "brightness-125"
                      : "opacity-60 grayscale"
                  }`}
                >
                  📚
                </button>
              </div>
            </div>

            {/* CREATIVE */}

            <div className="planet-orbit orbit-orange">
              <div
                className="relative"
                onMouseEnter={() =>
                  setHoveredPlanet(
                    "Creative"
                  )
                }
                onMouseLeave={() =>
                  setHoveredPlanet(
                    null
                  )
                }
              >
                {hoveredPlanet ===
                  "Creative" && (
                  <div className="absolute -top-14 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-xl border border-orange-400/20 bg-[var(--orbit-card-soft)] px-3 py-2 text-xs text-[var(--orbit-text)] shadow-xl backdrop-blur-xl">
                    🎨 Creative{" "}
                    <span className="ml-2 text-[var(--orbit-muted)]">
                      {getPlanetProgress(
                        "Creative"
                      )}
                      %
                    </span>
                  </div>
                )}

                <button
                  onClick={() =>
                    selectPlanet(
                      "Creative"
                    )
                  }
                  className={`planet planet-orange transition-all ${
                    selectedPlanet ===
                    "Creative"
                      ? "scale-125 ring-4 ring-orange-300/50 shadow-[0_0_60px_rgba(249,115,22,0.9)]"
                      : ""
                  } ${
                    getPlanetProgress(
                      "Creative"
                    ) > 0
                      ? "brightness-125"
                      : "opacity-60 grayscale"
                  }`}
                >
                  🎨
                </button>
              </div>
            </div>

            {/* STATS */}

            <div className="absolute bottom-6 left-6 right-6 z-40 flex justify-between rounded-2xl border border-[var(--orbit-border)] bg-[var(--orbit-card-soft)]/80 p-4 backdrop-blur-xl">
              <div>
                <p className="text-xs text-[var(--orbit-muted)]">
                  ACTIVE
                </p>

                <p className="mt-1 text-xl font-bold">
                  {pending}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--orbit-muted)]">
                  COMPLETION
                </p>

                <p className="mt-1 text-xl font-bold">
                  {progress}%
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--orbit-muted)]">
                  STREAK
                </p>

                <p className="mt-1 text-xl font-bold">
                  {streak} 🔥
                </p>
              </div>
            </div>
          </div>

          {/* MISSIONS */}

          <div
            className={`${cardClass} p-5 md:p-6`}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--orbit-muted)]">
                  {selectedPlanet
                    ? `${planetInfo[
                        selectedPlanet
                      ].name.toUpperCase()} PLANET`
                    : "TODAY"}
                </p>

                <h3 className="text-2xl font-semibold">
                  {selectedPlanet
                    ? planetInfo[
                        selectedPlanet
                      ].name
                    : "Missions"}
                </h3>
              </div>

              <button
                onClick={() =>
                  setAdding(true)
                }
                className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white transition hover:scale-105 hover:bg-violet-400"
              >
                + Add
              </button>
            </div>

            {/* SEARCH */}

            <div className="mb-4">
              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="🔎 Search missions..."
                className={inputClass}
              />
            </div>

            {/* FILTERS */}

            <div className="mb-5 grid grid-cols-2 gap-2">
              <select
                value={
                  categoryFilter
                }
                onChange={(e) =>
                  setCategoryFilter(
                    e.target.value
                  )
                }
                className={
                  selectClass
                }
              >
                <option>
                  All
                </option>

                <option>
                  Project
                </option>

                <option>
                  Learning
                </option>

                <option>
                  Creative
                </option>
              </select>

              <select
                value={
                  priorityFilter
                }
                onChange={(e) =>
                  setPriorityFilter(
                    e.target.value
                  )
                }
                className={
                  selectClass
                }
              >
                <option>
                  All
                </option>

                <option>
                  High
                </option>

                <option>
                  Medium
                </option>

                <option>
                  Low
                </option>
              </select>

              <select
                value={
                  statusFilter
                }
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className={
                  selectClass
                }
              >
                <option>
                  All
                </option>

                <option>
                  Pending
                </option>

                <option>
                  Completed
                </option>
              </select>

              <button
                onClick={() =>
                  setOverdueOnly(
                    !overdueOnly
                  )
                }
                className={`rounded-xl border px-3 py-2 text-xs transition ${
                  overdueOnly
                    ? "border-red-400/30 bg-red-500/10 text-red-500"
                    : "border-[var(--orbit-border)] text-[var(--orbit-muted)] hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                ⚠️ Overdue
              </button>
            </div>

            {/* ADD */}

            {adding && (
              <div
                className={`${softCardClass} mb-5 p-4`}
              >
                <input
                  value={newTitle}
                  onChange={(e) =>
                    setNewTitle(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key ===
                      "Enter"
                    ) {
                      addTask();
                    }
                  }}
                  placeholder="What do you want to accomplish?"
                  className={
                    inputClass
                  }
                  autoFocus
                />

                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <select
                    value={
                      newCategory
                    }
                    onChange={(e) =>
                      setNewCategory(
                        e.target
                          .value as PlanetCategory
                      )
                    }
                    className={
                      selectClass
                    }
                  >
                    <option>
                      Project
                    </option>

                    <option>
                      Learning
                    </option>

                    <option>
                      Creative
                    </option>
                  </select>

                  <select
                    value={
                      newPriority
                    }
                    onChange={(e) =>
                      setNewPriority(
                        e.target
                          .value as Priority
                      )
                    }
                    className={
                      selectClass
                    }
                  >
                    <option>
                      High
                    </option>

                    <option>
                      Medium
                    </option>

                    <option>
                      Low
                    </option>
                  </select>

                  <input
                    type="date"
                    value={
                      newDueDate
                    }
                    onChange={(e) =>
                      setNewDueDate(
                        e.target.value
                      )
                    }
                    className={
                      selectClass
                    }
                  />
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={
                      addTask
                    }
                    disabled={
                      !newTitle.trim()
                    }
                    className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
                  >
                    Add mission
                  </button>

                  <button
                    onClick={() => {
                      setAdding(
                        false
                      );
                      setNewTitle(
                        ""
                      );
                    }}
                    className="rounded-xl border border-[var(--orbit-border)] px-4 py-2 text-sm text-[var(--orbit-muted)] hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* EDIT */}

            {editingTask && (
              <div className="mb-5 rounded-2xl border border-violet-400/20 bg-violet-500/[0.04] p-4">
                <div className="mb-4">
                  <p className="text-sm font-semibold">
                    Edit mission
                  </p>

                  <p className="mt-1 text-xs text-[var(--orbit-muted)]">
                    Update your mission
                    details.
                  </p>
                </div>

                <input
                  value={
                    editTitle
                  }
                  onChange={(e) =>
                    setEditTitle(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key ===
                      "Enter"
                    ) {
                      saveEdit();
                    }
                  }}
                  className={
                    inputClass
                  }
                  autoFocus
                />

                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <select
                    value={
                      editCategory
                    }
                    onChange={(e) =>
                      setEditCategory(
                        e.target
                          .value as PlanetCategory
                      )
                    }
                    className={
                      selectClass
                    }
                  >
                    <option>
                      Project
                    </option>

                    <option>
                      Learning
                    </option>

                    <option>
                      Creative
                    </option>
                  </select>

                  <select
                    value={
                      editPriority
                    }
                    onChange={(e) =>
                      setEditPriority(
                        e.target
                          .value as Priority
                      )
                    }
                    className={
                      selectClass
                    }
                  >
                    <option>
                      High
                    </option>

                    <option>
                      Medium
                    </option>

                    <option>
                      Low
                    </option>
                  </select>

                  <input
                    type="date"
                    value={
                      editDueDate
                    }
                    onChange={(e) =>
                      setEditDueDate(
                        e.target.value
                      )
                    }
                    className={
                      selectClass
                    }
                  />
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={
                      saveEdit
                    }
                    disabled={
                      savingEdit ||
                      !editTitle.trim()
                    }
                    className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
                  >
                    {savingEdit
                      ? "Saving..."
                      : "Save changes"}
                  </button>

                  <button
                    onClick={
                      cancelEditing
                    }
                    className="rounded-xl border border-[var(--orbit-border)] px-4 py-2 text-sm text-[var(--orbit-muted)] hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* TASKS */}

            {visibleTasks.length ===
            0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--orbit-border)] p-8 text-center">
                <div className="mb-3 text-3xl">
                  🪐
                </div>

                <p className="text-sm text-[var(--orbit-muted)]">
                  No missions found.
                </p>

                <button
                  onClick={() =>
                    setAdding(true)
                  }
                  className="mt-4 text-sm text-violet-500 hover:text-violet-400"
                >
                  + Create one
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleTasks.map(
                  (task) => (
                    <div
                      key={task.id}
                      className={`group rounded-2xl border p-4 transition hover:-translate-y-1 ${
                        isOverdue(
                          task
                        )
                          ? "border-red-400/20 bg-red-500/[0.03]"
                          : "border-[var(--orbit-border)] bg-black/[0.02] dark:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* COMPLETE */}

                        <button
                          onClick={() =>
                            toggleTask(
                              task
                            )
                          }
                          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                            task.done
                              ? "border-violet-400 bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                              : "border-[var(--orbit-border-strong)] hover:border-violet-400"
                          }`}
                          title={
                            task.done
                              ? "Mark incomplete"
                              : "Mark complete"
                          }
                        >
                          {task.done &&
                            "✓"}
                        </button>

                        {/* INFO */}

                        <div className="min-w-0 flex-1">
                          <button
                            onClick={() =>
                              toggleTask(
                                task
                              )
                            }
                            className="block w-full text-left"
                          >
                            <p
                              className={
                                task.done
                                  ? "truncate text-sm text-[var(--orbit-subtle)] line-through"
                                  : "truncate text-sm font-medium"
                              }
                            >
                              {
                                task.title
                              }
                            </p>
                          </button>

                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-lg bg-black/5 px-2 py-1 text-[10px] text-[var(--orbit-muted)] dark:bg-white/5">
                              {
                                task.category
                              }
                            </span>

                            <span
                              className={`rounded-lg px-2 py-1 text-[10px] ${
                                task.priority ===
                                "High"
                                  ? "bg-red-500/10 text-red-500"
                                  : task.priority ===
                                    "Medium"
                                  ? "bg-yellow-500/10 text-yellow-600"
                                  : "bg-emerald-500/10 text-emerald-600"
                              }`}
                            >
                              {
                                task.priority
                              }
                            </span>

                            {task.due_date && (
                              <span
                                className={`rounded-lg px-2 py-1 text-[10px] ${
                                  isOverdue(
                                    task
                                  )
                                    ? "bg-red-500/10 text-red-500"
                                    : isDueSoon(
                                        task
                                      )
                                    ? "bg-yellow-500/10 text-yellow-600"
                                    : "bg-black/5 text-[var(--orbit-muted)] dark:bg-white/5"
                                }`}
                              >
                                📅{" "}
                                {formatDate(
                                  task.due_date
                                )}
                              </span>
                            )}

                            {isOverdue(
                              task
                            ) && (
                              <span className="rounded-lg bg-red-500/10 px-2 py-1 text-[10px] text-red-500">
                                OVERDUE
                              </span>
                            )}

                            {isDueSoon(
                              task
                            ) && (
                              <span className="rounded-lg bg-yellow-500/10 px-2 py-1 text-[10px] text-yellow-600">
                                DUE SOON
                              </span>
                            )}
                          </div>
                        </div>

                        {/* EDIT */}

                        <button
                          onClick={() =>
                            startEditing(
                              task
                            )
                          }
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--orbit-border)] text-[var(--orbit-muted)] transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-500 sm:opacity-0 sm:group-hover:opacity-100"
                          title="Edit mission"
                        >
                          ✏️
                        </button>

                        {/* DELETE */}

                        <button
                          onClick={() =>
                            deleteTask(
                              task
                            )
                          }
                          disabled={
                            deletingTaskId ===
                            task.id
                          }
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-400/10 text-red-500/60 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100"
                          title="Delete mission"
                        >
                          {deletingTaskId ===
                          task.id
                            ? "..."
                            : "🗑️"}
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* CLEAR FILTER */}

            {(selectedPlanet ||
              search ||
              categoryFilter !==
                "All" ||
              priorityFilter !==
                "All" ||
              statusFilter !==
                "All" ||
              overdueOnly) && (
              <button
                onClick={() => {
                  setSelectedPlanet(
                    null
                  );

                  setSearch("");

                  setCategoryFilter(
                    "All"
                  );

                  setPriorityFilter(
                    "All"
                  );

                  setStatusFilter(
                    "All"
                  );

                  setOverdueOnly(
                    false
                  );
                }}
                className="mt-5 w-full rounded-xl border border-[var(--orbit-border)] py-2 text-xs text-[var(--orbit-muted)] transition hover:bg-black/5 hover:text-[var(--orbit-text)] dark:hover:bg-white/5"
              >
                Clear all filters
              </button>
            )}

            {/* PROGRESS */}

            <div className="mt-8">
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-[var(--orbit-muted)]">
                  Daily progress
                </span>

                <span>
                  {progress}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-violet-500 transition-all duration-700"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}