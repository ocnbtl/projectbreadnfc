(() => {
  const root = document.documentElement;
  const studioHeader = document.querySelector(".studio-header");
  const studioMenuButton = document.querySelector(".studio-menu-button");
  const studioTabs = [...document.querySelectorAll("[data-view]")];
  const viewPanels = [...document.querySelectorAll("[data-view-panel]")];
  const directionNames = {
    "signal-ledger": "Signal Ledger",
    "copper-circuit": "Copper Circuit",
    "civic-current": "Civic Current",
  };

  const setView = (viewName, shouldFocus = false) => {
    const nextTab = studioTabs.find((tab) => tab.dataset.view === viewName);
    const nextPanel = viewPanels.find((panel) => panel.dataset.viewPanel === viewName);

    if (!nextTab || !nextPanel) {
      return;
    }

    studioTabs.forEach((tab) => {
      const isActive = tab === nextTab;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });

    viewPanels.forEach((panel) => {
      panel.hidden = panel !== nextPanel;
    });

    studioHeader?.classList.remove("is-menu-open");
    studioMenuButton?.setAttribute("aria-expanded", "false");

    if (shouldFocus) {
      nextPanel.setAttribute("tabindex", "-1");
      nextPanel.focus({ preventScroll: true });
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  studioTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => setView(tab.dataset.view));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
        return;
      }

      event.preventDefault();
      let nextIndex = index;

      if (event.key === "ArrowRight") {
        nextIndex = (index + 1) % studioTabs.length;
      } else if (event.key === "ArrowLeft") {
        nextIndex = (index - 1 + studioTabs.length) % studioTabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = studioTabs.length - 1;
      }

      setView(studioTabs[nextIndex].dataset.view);
      studioTabs[nextIndex].focus();
    });
  });

  studioMenuButton?.addEventListener("click", () => {
    const willOpen = !studioHeader.classList.contains("is-menu-open");
    studioHeader.classList.toggle("is-menu-open", willOpen);
    studioMenuButton.setAttribute("aria-expanded", String(willOpen));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && studioHeader?.classList.contains("is-menu-open")) {
      studioHeader.classList.remove("is-menu-open");
      studioMenuButton?.setAttribute("aria-expanded", "false");
      studioMenuButton?.focus();
    }
  });

  const setDirection = (direction) => {
    if (!directionNames[direction]) {
      return;
    }

    root.dataset.direction = direction;
    document.querySelectorAll("[data-direction-card]").forEach((card) => {
      const isActive = card.dataset.directionCard === direction;
      card.classList.toggle("is-previewing", isActive);
    });
    document.querySelectorAll("[data-set-direction]").forEach((button) => {
      const isActive = button.dataset.setDirection === direction;
      button.classList.toggle("button--primary", isActive);
      button.classList.toggle("button--secondary", !isActive);
      button.setAttribute("aria-pressed", String(isActive));
      button.textContent = isActive ? "Previewing this direction" : "Preview this direction";
    });

    const label = document.querySelector("#active-direction-label");
    if (label) {
      label.textContent = `Previewing ${directionNames[direction]}`;
    }
  };

  document.querySelectorAll("[data-set-direction]").forEach((button) => {
    button.addEventListener("click", () => setDirection(button.dataset.setDirection));
  });
  setDirection(root.dataset.direction);

  const businessNameInput = document.querySelector("#business-name");
  businessNameInput?.addEventListener("input", () => {
    const nextName = businessNameInput.value.trim() || "Your business";
    document.querySelectorAll(".js-business-name").forEach((element) => {
      element.textContent = nextName;
    });
  });

  document.querySelectorAll("[data-product-color]").forEach((button) => {
    button.addEventListener("click", () => {
      const isDark = button.dataset.productColor === "dark";
      document.querySelectorAll("[data-product-color]").forEach((choice) => {
        const isActive = choice === button;
        choice.classList.toggle("is-active", isActive);
        choice.setAttribute("aria-pressed", String(isActive));
      });
      document.querySelectorAll("[data-product-face]").forEach((face) => {
        face.classList.toggle("is-dark", isDark);
      });
    });
  });

  const journeyScreens = [...document.querySelectorAll("[data-journey-screen]")];
  const showJourneyScreen = (name) => {
    journeyScreens.forEach((screen) => {
      screen.hidden = screen.dataset.journeyScreen !== name;
    });

    const activeScreen = journeyScreens.find((screen) => screen.dataset.journeyScreen === name);
    const firstControl = activeScreen?.querySelector("button");
    if (name !== "landing") {
      firstControl?.focus();
    }
  };

  document.querySelectorAll("[data-journey-choice]").forEach((button) => {
    button.addEventListener("click", () => showJourneyScreen(button.dataset.journeyChoice));
  });

  document.querySelectorAll("[data-journey-back]").forEach((button) => {
    button.addEventListener("click", () => showJourneyScreen("landing"));
  });

  document.querySelectorAll("[data-journey-complete]").forEach((button) => {
    button.addEventListener("click", () => {
      const completionCopy = document.querySelector("#journey-complete-copy");
      if (completionCopy) {
        completionCopy.textContent =
          button.dataset.journeyComplete === "review"
            ? "The public-review handoff was simulated. No provider page opened and no review was completed."
            : "The direct-support handoff was simulated. No call, email, or message was sent.";
      }
      showJourneyScreen("complete");
    });
  });

  document.querySelector("[data-journey-reset]")?.addEventListener("click", () => {
    showJourneyScreen("landing");
  });

  const dashboard = document.querySelector("#dashboard-prototype");
  const dashboardMenuButton = dashboard?.querySelector(".dashboard-mobile-menu");
  const dashboardLiveContent = dashboard?.querySelector(".dashboard-live-content");
  const setupPanel = dashboard?.querySelector(".setup-panel");
  const dashboardStatePanels = [...(dashboard?.querySelectorAll("[data-dashboard-panel]") || [])];
  const dashboardStateButtons = [
    ...document.querySelectorAll("[data-set-dashboard-state]"),
  ];

  const setDashboardState = (state) => {
    if (!dashboard) {
      return;
    }

    const isLiveState = state === "active" || state === "setup";
    dashboard.dataset.dashboardState = state;
    if (dashboardLiveContent) {
      dashboardLiveContent.hidden = !isLiveState;
    }
    if (setupPanel) {
      setupPanel.hidden = state !== "setup";
    }
    dashboardStatePanels.forEach((panel) => {
      panel.hidden = panel.dataset.dashboardPanel !== state;
    });
    dashboardStateButtons.forEach((button) => {
      const isActive = button.dataset.setDashboardState === state;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  };

  dashboardStateButtons.forEach((button) => {
    button.addEventListener("click", () => setDashboardState(button.dataset.setDashboardState));
  });
  setDashboardState(dashboard?.dataset.dashboardState || "active");

  dashboardMenuButton?.addEventListener("click", () => {
    const willOpen = !dashboard.classList.contains("is-dashboard-nav-open");
    dashboard.classList.toggle("is-dashboard-nav-open", willOpen);
    dashboardMenuButton.setAttribute("aria-expanded", String(willOpen));
    dashboardMenuButton.setAttribute(
      "aria-label",
      willOpen ? "Close dashboard navigation" : "Open dashboard navigation",
    );
  });

  dashboard?.querySelectorAll(".dashboard-nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      dashboard.classList.remove("is-dashboard-nav-open");
      dashboardMenuButton?.setAttribute("aria-expanded", "false");
      dashboardMenuButton?.setAttribute("aria-label", "Open dashboard navigation");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dashboard?.classList.contains("is-dashboard-nav-open")) {
      dashboard.classList.remove("is-dashboard-nav-open");
      dashboardMenuButton?.setAttribute("aria-expanded", "false");
      dashboardMenuButton?.setAttribute("aria-label", "Open dashboard navigation");
      dashboardMenuButton?.focus();
    }
  });
})();
