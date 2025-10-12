// js/google-map.js
(function () {
  "use strict";

  window.initMap = function () {
    var el = document.getElementById("map");
    if (!el) return;

    // อย่าลืมกำหนดความสูงให้ #map ใน CSS เช่น height: 300px
    var center = { lat: 13.8800, lng: 100.5840 };

    var map = new google.maps.Map(el, {
      zoom: 15,
      center: center,
      scrollwheel: false
    });

    new google.maps.Marker({
      position: center,
      map: map,
      title: "SRIPATUM UNIVERSITY"
    });
  };
})();
