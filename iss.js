const request = require("request");
// Fetches user IP using Ipify API
const fetchMyIP = function(callback) {
  request("https://api.ipify.org?format=json", (error, response, body) => {
    if (error == true) return callback(error, undefined);

    if (response.statusCode !== 200) {
      callback(
        Error(`Status Code ${response.statusCode} when fetching IP: ${body}`),
        undefined
      );
      return;
    }

    const ip = JSON.parse(body).ip;
    callback(undefined, ip);
  });
};

// ____________________________________________________________________________
// Fetch Longitude/Latitude using IP Vigilante api
const fetchCoordsByIP = function(ip, callback) {
  request(`https://ipvigilante.com/json/${ip}`, (error, response, body) => {
    if (error) {
      callback(error, undefined);
      return;
    }
    // 200 Status Code ===  Succes!
    if (response.statusCode !== 200) {
      callback(
        Error(
          `Status Code ${
            response.statusCode
          } when fetching Coordinates for IP: ${body}`
        ),
        undefined
      );
      return;
    }

    const { latitude, longitude } = JSON.parse(body).data;

    callback(undefined, { latitude, longitude });
  });
};
// ____________________________________________________________________________
// Uses Iss-Pass Api to determine ISS Location
const fetchISSFlyOverTimes = function(coords, callback) {
  const url = `http://api.open-notify.org/iss-pass.json?lat=${
    coords.latitude
  }&lon=${coords.longitude}`;

  request(url, (error, response, body) => {
    if (error) {
      callback(error, undefined);
      return;
    }

    if (response.statusCode !== 200) {
      callback(
        Error(
          `Status Code ${
            response.statusCode
          } when fetching ISS pass times: ${body}`
        ),
        undefined
      );
      return;
    }

    const passes = JSON.parse(body).response;
    callback(undefined, passes);
  });
};
// ____________________________________________________________________________
// Uses previous functions to determine ISS Pass Time for the given IP Location
const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, undefined);
    }

    fetchCoordsByIP(ip, (error, loc) => {
      if (error) {
        return callback(error, undefined);
      }

      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if (error) {
          return callback(error, undefined);
        }

        callback(undefined, nextPasses);
      });
    });
  });
};
module.exports = { nextISSTimesForMyLocation };
