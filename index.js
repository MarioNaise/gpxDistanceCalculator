const fs = require("fs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter the path to the GPX file: ", (filePath) => {
  calculateGPXDistance(filePath);
  rl.close();
});

// calculates the distance between two coordinates (haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // radius of the earth in kilometers
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const centralAngle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = centralAngle * R;

  return distance;
}

function degreesToRadians(deg) {
  return deg * (Math.PI / 180);
}

function calculateGPXDistance(filePath) {
  let totalDistance = 0;
  let prevLat, prevLon;

  const lineReader = readline.createInterface({
    input: fs.createReadStream(filePath),
  });

  lineReader.on("line", (line) => {
    if (line.includes("<trkpt")) {
      const latMatch = line.match(/lat="([-+]?[0-9]*\.?[0-9]+)"/);
      const lonMatch = line.match(/lon="([-+]?[0-9]*\.?[0-9]+)"/);

      if (latMatch && lonMatch) {
        const lat = parseFloat(latMatch[1]);
        const lon = parseFloat(lonMatch[1]);

        if (prevLat && prevLon) {
          const distance = calculateDistance(prevLat, prevLon, lat, lon);
          totalDistance += distance;
        }

        prevLat = lat;
        prevLon = lon;
      }
    }
  });

  lineReader.on("close", () => {
    console.log("Total Distance:", totalDistance.toFixed(2), "km");
  });
}
