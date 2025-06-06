document.addEventListener("DOMContentLoaded", () => {
  const videosContainer = document.getElementById("videos");
  const fileInput = document.getElementById("video-upload");
  const fileNameDisplay = document.getElementById("file-name-display");
  const uploadForm = document.getElementById("upload-form");
  const uploadProgressContainer = document.getElementById(
    "upload-progress-container"
  );
  const uploadProgressBar = document.getElementById("upload-progress-bar");
  const uploadProgressText = document.getElementById("upload-progress-text");

  // Handle file input change
  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      fileNameDisplay.textContent = fileInput.files[0].name;
    } else {
      fileNameDisplay.textContent = "No file chosen";
    }
  });

  // Handle form submission with progress tracking
  uploadForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!fileInput.files.length) {
      alert("Please select a video file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("video", fileInput.files[0]);

    const xhr = new XMLHttpRequest();

    // Show progress container
    uploadProgressContainer.style.display = "block";

    // Track upload progress
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        uploadProgressBar.style.width = percentComplete + "%";
        uploadProgressText.textContent = percentComplete + "%";
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        // Success - reset form and reload videos
        uploadForm.reset();
        fileNameDisplay.textContent = "No file chosen";
        uploadProgressContainer.style.display = "none";
        uploadProgressBar.style.width = "0%";
        uploadProgressText.textContent = "0%";

        // Reload the videos after a short delay
        setTimeout(() => {
          loadVideos();
        }, 1000);
      } else {
        // Error
        alert("Upload failed. Please try again.");
        uploadProgressContainer.style.display = "none";
      }
    });

    xhr.addEventListener("error", () => {
      alert("Upload failed. Please check your connection and try again.");
      uploadProgressContainer.style.display = "none";
    });

    xhr.open("POST", "/api/v1/upload", true);
    xhr.send(formData);
  });

  // Create loading indicator
  const loadingIndicator = document.createElement("div");
  loadingIndicator.id = "loading";

  const spinner = document.createElement("div");
  spinner.className = "loading-spinner";

  const loadingText = document.createElement("div");
  loadingText.textContent = "Loading videos...";

  loadingIndicator.appendChild(spinner);
  loadingIndicator.appendChild(loadingText);

  // Function to load videos
  function loadVideos() {
    // Clear the container and show loading
    videosContainer.innerHTML = "";
    videosContainer.appendChild(loadingIndicator);

    fetch("/api/v1/videos")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch videos");
        return res.json();
      })
      .then((videos) => {
        if (videosContainer.contains(loadingIndicator)) {
          videosContainer.removeChild(loadingIndicator);
        }

        if (!videos.length) {
          const noVideos = document.createElement("div");
          noVideos.className = "no-videos";
          noVideos.textContent = "No videos uploaded yet";
          videosContainer.appendChild(noVideos);
          return;
        }

        videos.forEach((url, index) => {
          const videoContainer = document.createElement("div");
          videoContainer.className = "video-container";

          // Create player container
          const playerContainer = document.createElement("div");
          playerContainer.className = "video-player";

          // Create video element
          const videoElement = document.createElement("video");
          videoElement.controls = true;
          videoElement.playsInline = true;
          videoElement.preload = "metadata";
          videoElement.id = `video-${index}`;

          // If HLS.js is available, use it
          if (typeof Hls !== "undefined" && Hls.isSupported()) {
            const hls = new Hls({
              maxBufferLength: 30,
              maxMaxBufferLength: 600,
            });
            hls.loadSource(url);
            hls.attachMedia(videoElement);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
              // Video ready to be played
              console.log("Video manifest loaded:", url);
            });

            // Handle HLS.js errors
            hls.on(Hls.Events.ERROR, function (event, data) {
              console.warn("HLS error:", data);
            });
          }
          // For browsers with native HLS support
          else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
            videoElement.src = url;
          } else {
            console.warn("Neither HLS.js nor native HLS support available");
            // Create a fallback message
            const fallbackMessage = document.createElement("div");
            fallbackMessage.className = "error-message";
            fallbackMessage.textContent =
              "Your browser doesn't support HLS video playback.";
            playerContainer.appendChild(fallbackMessage);
          }

          playerContainer.appendChild(videoElement);
          videoContainer.appendChild(playerContainer);
          videosContainer.appendChild(videoContainer);
        });
      })
      .catch((error) => {
        console.error("Error:", error);
        if (videosContainer.contains(loadingIndicator)) {
          videosContainer.removeChild(loadingIndicator);
        }

        const errorMessage = document.createElement("div");
        errorMessage.className = "error-message";
        errorMessage.textContent =
          "Error loading videos. Please try again later.";
        videosContainer.appendChild(errorMessage);
      });
  }

  // Initial load of videos
  loadVideos();
});
