const { google } = require("googleapis");
const analyticsData = google.analyticsdata("v1beta");

// Google Analytics Service Account Key
const SERVICE_ACCOUNT_KEY = "/home/miracle/Downloads/API.json"; // Replace with your JSON file path
const GA4_PROPERTY_ID = "properties/469095014"; // Replace with your GA4 property ID

async function getAnalyticsData() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_KEY,
      scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
    });

    const analytics = await analyticsData.properties.runReport({
      auth,
      property: GA4_PROPERTY_ID,
      requestBody: {
        dimensions: [
          { name: "eventName" },
          { name: "pagePath" },
          { name: "city" },
        ],
        metrics: [
          { name: "eventCount" },
          { name: "activeUsers" },
          { name: "screenPageViews" },
          { name: "eventCountPerUser" },
        ],
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      },
    });

    const data = analytics.data.rows;

    // Separate data by eventName (event like scroll, consult an agent, etc.)
    const eventsData = data.reduce((acc, row) => {
      const eventName = row.dimensionValues[0]?.value;
      if (!acc[eventName]) {
        acc[eventName] = [];
      }
      acc[eventName].push({
        key: row.dimensionValues[0]?.value + row.dimensionValues[1]?.value,
        city: row.dimensionValues[2]?.value || "N/A",
        pagePath: row.dimensionValues[1]?.value || "N/A",
        eventCount: row.metricValues[0]?.value || "N/A",
        activeUsers: row.metricValues[1]?.value || "N/A",
        screenPageViews: row.metricValues[2]?.value || "N/A",
        eventCountPerUser: row.metricValues[3]?.value || "N/A",
      });
      return acc;
    }, {});

    return eventsData;
  } catch (error) {
    console.error("Error fetching Google Analytics data:", error.name);
    console.error("Error fetching Google Analytics data:", error);
    throw error;
  }
}

async function getTopEventsData() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_KEY,
      scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
    });

    const analytics = await analyticsData.properties.runReport({
      auth,
      property: GA4_PROPERTY_ID,
      requestBody: {
        dimensions: [{ name: "eventName" }], // Dimension for event names
        metrics: [{ name: "eventCount" }], // Metric for event counts
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }], // Date range
        orderBys: [
          {
            desc: false, // Sort in descending order
            metric: {
              metricName: "eventCount", // Sort by eventCount metric
            },
          },
        ],
        limit: 30, // Limit to top 10 results
      },
    });

    return analytics.data.rows;
  } catch (error) {
    console.error("Error fetching top events data:", error);
    throw error;
  }
}

async function getDemographicsByCountry() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_KEY,
      scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
    });

    const analytics = await analyticsData.properties.runReport({
      auth,
      property: GA4_PROPERTY_ID,
      requestBody: {
        dimensions: [
          { name: "country" }, // Break down by country
          { name: "date" }, // Include the date dimension for daily data
        ],
        metrics: [
          { name: "activeUsers" }, // Active users metric
        ],
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }], // Adjust date range as needed
        orderBys: [
          {
            desc: true,
            metric: { metricName: "activeUsers" }, // Sort by active users
          },
        ],
      },
    });

    // Process the results
    const data = analytics.data.rows.map((row) => ({
      date: row.dimensionValues[1]?.value || "N/A", // Date
      country: row.dimensionValues[0]?.value || "N/A", // Country
      activeUsers: row.metricValues[0]?.value || "N/A", // Active users
    }));

    return data;
  } catch (error) {
    console.error("Error fetching demographic data by country:", error);
    throw error;
  }
}

async function getPageViewsByProperty(propertyId) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_KEY,
      scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
    });

    const analytics = await analyticsData.properties.runReport({
      auth,
      property: GA4_PROPERTY_ID,
      requestBody: {
        dimensions: [
          { name: "pagePath" }, // Page path as dimension
        ],
        metrics: [
          { name: "screenPageViews" }, // Metric for page views
        ],
        dimensionFilter: {
          filter: {
            fieldName: "pagePath",
            stringFilter: { matchType: "EXACT", value: propertyId }, // Match property ID exactly
          },
        },
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      },
    });

    // Process and return data
    const data = analytics.data.rows.map((row) => ({
      pagePath: row.dimensionValues[0]?.value || "N/A",
      pageViews: row.metricValues[0]?.value || "N/A",
    }));

    return data;
  } catch (error) {
    console.error("Error fetching page views by property:", error);
    throw error;
  }
}

module.exports = {
  getAnalyticsData,
  getTopEventsData,
  getDemographicsByCountry,
  getPageViewsByProperty,
};
