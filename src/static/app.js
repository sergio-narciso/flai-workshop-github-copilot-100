document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        const participantList = document.createElement("ul");
        participantList.className = "participants-list";

        if (details.participants.length > 0) {
          details.participants.forEach((p) => {
            const li = document.createElement("li");

            const emailSpan = document.createElement("span");
            emailSpan.className = "participant-email";
            emailSpan.textContent = p;

            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-participant";
            deleteButton.dataset.activity = name;
            deleteButton.dataset.email = p;
            deleteButton.title = "Unregister participant";
            deleteButton.textContent = "🗑";

            li.appendChild(emailSpan);
            li.appendChild(deleteButton);
            participantList.appendChild(li);
          });
        } else {
          const li = document.createElement("li");
          li.className = "no-participants";
          li.textContent = "No participants yet";
          participantList.appendChild(li);
        }

        // Build activity card content safely using DOM APIs
        const titleEl = document.createElement("h4");
        titleEl.textContent = name;

        const descriptionEl = document.createElement("p");
        descriptionEl.textContent = details.description;

        const scheduleEl = document.createElement("p");
        const scheduleStrong = document.createElement("strong");
        scheduleStrong.textContent = "Schedule:";
        scheduleEl.appendChild(scheduleStrong);
        scheduleEl.appendChild(document.createTextNode(" " + details.schedule));

        const availabilityEl = document.createElement("p");
        const availabilityStrong = document.createElement("strong");
        availabilityStrong.textContent = "Availability:";
        availabilityEl.appendChild(availabilityStrong);
        availabilityEl.appendChild(
          document.createTextNode(" " + spotsLeft + " spots left")
        );

        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";

        const participantsTitle = document.createElement("p");
        participantsTitle.className = "participants-title";
        participantsTitle.textContent =
          "Participants (" +
          details.participants.length +
          "/" +
          details.max_participants +
          ")";

        participantsSection.appendChild(participantsTitle);
        participantsSection.appendChild(participantList);

        activityCard.appendChild(titleEl);
        activityCard.appendChild(descriptionEl);
        activityCard.appendChild(scheduleEl);
        activityCard.appendChild(availabilityEl);
        activityCard.appendChild(participantsSection);
        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Handle participant deletion (event delegation on the whole page)
  document.addEventListener("click", async (event) => {
    const btn = event.target.closest(".delete-participant");
    if (!btn) return;

    const activity = btn.dataset.activity;
    const email = btn.dataset.email;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message || "Participant successfully unregistered.";
        messageDiv.className = "success";
        messageDiv.classList.remove("hidden");
        setTimeout(() => {
          messageDiv.classList.add("hidden");
        }, 5000);
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "Failed to unregister participant.";
        messageDiv.className = "error";
        messageDiv.classList.remove("hidden");
        // Hide message after 5 seconds
        setTimeout(() => {
          messageDiv.classList.add("hidden");
        }, 5000);
      }
    } catch (error) {
      console.error("Error unregistering participant:", error);
      messageDiv.textContent = "Failed to unregister participant. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    }
  });

  // Initialize app
  fetchActivities();
});
