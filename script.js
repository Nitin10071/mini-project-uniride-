$(document).ready(function () {

  // ---------------- DARK/LIGHT MODE ----------------
  let savedMode = localStorage.getItem("uniRideMode");

  if (savedMode === "light") {
    $("body").addClass("light-mode");
    $("#modeToggle").text("☀️ Light Mode");
  }

  $("#modeToggle").click(function () {
    $("body").toggleClass("light-mode");

    if ($("body").hasClass("light-mode")) {
      localStorage.setItem("uniRideMode", "light");
      $("#modeToggle").text("☀️ Light Mode");
    } else {
      localStorage.setItem("uniRideMode", "dark");
      $("#modeToggle").text("🌙 Dark Mode");
    }
  });

  // ---------------- LOGIN SYSTEM ----------------
  function checkLogin() {
    let user = JSON.parse(localStorage.getItem("uniRideUser"));

    if (user) {
      $("#loginSection").hide();
      $("#mainApp").fadeIn();

      $("#welcomeName").text(user.name);
      $("#welcomeID").text(user.id);

      loadRides();
      loadBookings();
    }
  }

  $("#loginBtn").click(function () {
    let name = $("#studentName").val().trim();
    let id = $("#studentID").val().trim();

    if (name === "" || id === "") {
      alert("Please enter Name and Student ID!");
      return;
    }

    let user = { name: name, id: id };
    localStorage.setItem("uniRideUser", JSON.stringify(user));

    alert("Login Successful!");
    checkLogin();
  });

  $("#logoutBtn").click(function () {
    localStorage.removeItem("uniRideUser");
    location.reload();
  });

  checkLogin();

  // ---------------- TAB SYSTEM ----------------
  $(".tabBtn").click(function () {
    $(".tabBtn").removeClass("active");
    $(this).addClass("active");

    $(".tabContent").hide();
    $("#" + $(this).data("tab")).fadeIn();
  });

  // ---------------- OFFER RIDE ----------------
  $("#postRideBtn").click(function () {
    let user = JSON.parse(localStorage.getItem("uniRideUser"));

    let vehicle = $("#vehicleType").val();
    let startLoc = $("#startLocation").val();
    let seats = parseInt($("#availableSeats").val());
    let time = $("#departureTime").val();
    let price = parseInt($("#pricePerSeat").val());

    if (!time) {
      alert("Please select departure time!");
      return;
    }

    let ride = {
      driver: user.name,
      studentID: user.id,
      vehicle: vehicle,
      startLocation: startLoc,
      destination: "Chandigarh University",
      seats: seats,
      time: time,
      price: price,
      id: Date.now()
    };

    let rides = JSON.parse(localStorage.getItem("uniRideRides")) || [];
    rides.push(ride);

    localStorage.setItem("uniRideRides", JSON.stringify(rides));

    $("#postMessage").html("<p style='color:lime;'>Ride Posted Successfully!</p>").hide().fadeIn();

    loadRides();
  });

  // ---------------- LOAD RIDES ----------------
  function loadRides() {
    let rides = JSON.parse(localStorage.getItem("uniRideRides")) || [];
    $("#ridesList").html("");

    if (rides.length === 0) {
      $("#ridesList").html("<p>No rides available right now.</p>");
      return;
    }

    rides.reverse().forEach(ride => {
      $("#ridesList").append(`
        <div class="rideCard">
          <h3>${ride.vehicle} Ride by ${ride.driver}</h3>
          <small>Pickup: ${ride.startLocation}</small><br>
          <small>Destination: ${ride.destination} (Campus Only)</small><br>
          <small>Seats: ${ride.seats} | Time: ${ride.time}</small><br>
          <small>Price per seat: ₹${ride.price}</small>

          <button class="bookBtn" data-id="${ride.id}">Book Ride</button>
        </div>
      `);
    });
  }

  // ---------------- BOOK RIDE ----------------
  $(document).on("click", ".bookBtn", function () {
    let rideID = $(this).data("id");

    let rides = JSON.parse(localStorage.getItem("uniRideRides")) || [];
    let bookings = JSON.parse(localStorage.getItem("uniRideBookings")) || [];

    let user = JSON.parse(localStorage.getItem("uniRideUser"));
    let selectedRide = rides.find(r => r.id == rideID);

    if (!selectedRide) {
      alert("Ride not found!");
      return;
    }

    let booking = {
      bookedBy: user.name,
      studentID: user.id,
      driver: selectedRide.driver,
      pickup: selectedRide.startLocation,
      destination: selectedRide.destination,
      vehicle: selectedRide.vehicle,
      price: selectedRide.price,
      time: selectedRide.time,
      bookingTime: new Date().toLocaleString(),
      bookingID: Date.now(),
      rating: "Not Rated"
    };

    bookings.push(booking);
    localStorage.setItem("uniRideBookings", JSON.stringify(bookings));

    alert("Ride Booked Successfully!");
    loadBookings();
  });

  // ---------------- FIND MATCHED RIDES ----------------
  $("#findRideBtn").click(function () {
    let pickup = $("#pickupLocation").val();
    let seatsNeeded = parseInt($("#seatsNeeded").val());

    let rides = JSON.parse(localStorage.getItem("uniRideRides")) || [];
    $("#matchResults").html("");

    let matches = rides.filter(r => r.startLocation === pickup && r.seats >= seatsNeeded);

    if (matches.length === 0) {
      $("#matchResults").html("<p style='color:orange;'>No matching rides found.</p>");
      return;
    }

    matches.reverse().forEach(ride => {
      $("#matchResults").append(`
        <div class="rideCard">
          <h3>Matched Ride: ${ride.vehicle} 🚕</h3>
          <small>Driver: ${ride.driver}</small><br>
          <small>Pickup: ${ride.startLocation}</small><br>
          <small>Seats Available: ${ride.seats}</small><br>
          <small>Time: ${ride.time}</small><br>
          <small>Price per seat: ₹${ride.price}</small>
          <button class="bookBtn" data-id="${ride.id}">Book Now</button>
        </div>
      `);
    });

    $("#matchResults").hide().fadeIn();
  });

  // ---------------- LOAD BOOKINGS ----------------
  function loadBookings() {
    let bookings = JSON.parse(localStorage.getItem("uniRideBookings")) || [];
    let user = JSON.parse(localStorage.getItem("uniRideUser"));

    $("#bookingList").html("");

    let userBookings = bookings.filter(b => b.studentID === user.id);

    if (userBookings.length === 0) {
      $("#bookingList").html("<p>No bookings found.</p>");
      return;
    }

    userBookings.reverse().forEach(booking => {
      $("#bookingList").append(`
        <div class="rideCard">
          <h3>Ride Booked ✅</h3>
          <small>Driver: ${booking.driver}</small><br>
          <small>Pickup: ${booking.pickup}</small><br>
          <small>Destination: ${booking.destination}</small><br>
          <small>Vehicle: ${booking.vehicle}</small><br>
          <small>Time: ${booking.time}</small><br>
          <small>Price: ₹${booking.price}</small><br>
          <small>Booked On: ${booking.bookingTime}</small><br>
          <small><b>Rating:</b> ${booking.rating}</small>

          <div class="ratingBox">
            <label>Rate Driver</label>
            <select class="rateSelect" data-bookingid="${booking.bookingID}">
              <option value="">Select Rating</option>
              <option value="⭐ 1">⭐ 1</option>
              <option value="⭐ 2">⭐ 2</option>
              <option value="⭐ 3">⭐ 3</option>
              <option value="⭐ 4">⭐ 4</option>
              <option value="⭐ 5">⭐ 5</option>
            </select>
          </div>
        </div>
      `);
    });
  }

  // ---------------- SAVE RATING ----------------
  $(document).on("change", ".rateSelect", function () {
    let bookingID = $(this).data("bookingid");
    let ratingValue = $(this).val();

    let bookings = JSON.parse(localStorage.getItem("uniRideBookings")) || [];

    bookings = bookings.map(b => {
      if (b.bookingID == bookingID) {
        b.rating = ratingValue;
      }
      return b;
    });

    localStorage.setItem("uniRideBookings", JSON.stringify(bookings));

    alert("Rating Submitted!");
    loadBookings();
  });

  loadRides();

});