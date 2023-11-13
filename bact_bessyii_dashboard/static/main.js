    // JavaScript code to handle button click and chart rendering based on dropdown selections
    document.getElementById("executeBtn").addEventListener("click", function() {
        // Fetch selected values
        const measurementType = document.getElementById("measurementType").value;
        const configuration = document.getElementById("configuration").value;
  
        // Display output in the measurementResult div
        document.getElementById("measurementResult").innerText = `Measurement ID: ${measurementType}, Configuration: ${configuration}`;
      });
  
      // Add an event listener to the dropdown to render the chart on change
      document.getElementById("analyzeChart").addEventListener("change", function() {
        const selectedValue = this.value;
        renderChart(selectedValue);
      });
  
  
  
  document.addEventListener("DOMContentLoaded", function() {
    const submitBtn = document.querySelector("#submitBtn");
    const responseDiv = document.querySelector("#response");
  
    submitBtn.addEventListener("click", function() {
      const machineId = document.querySelector("#machineId").value;
      fetch(`/machine/${machineId}`)
        .then(function(response) {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Response not OK");
          }
        })
        .then(function(data) {
          let html = "";
          for (const [key, value] of Object.entries(data)) {
            html += `${key}: ${JSON.stringify(value)}<br>`;
          }
          responseDiv.innerHTML = html;
        })
        .catch(function(error) {
          console.error(error);
        });
    });
  });
  
  
  
  function loadMainJS() {
    document.addEventListener("DOMContentLoaded", function() {
      // Load the Plotly library dynamically
      function loadPlotlyLibrary() {
        const plotlyScript = document.createElement("script");
        plotlyScript.src = "https://cdn.plot.ly/plotly-latest.min.js";
        plotlyScript.defer = true; // Ensure the script loads before DOMContentLoaded
        plotlyScript.onload = renderInitialChart; // Render the initial chart after script loads
        document.head.appendChild(plotlyScript);
      }
  
      // Load the Plotly library before rendering the initial chart
      loadPlotlyLibrary();
  
      // JavaScript code to handle button click and chart rendering based on dropdown selections
      document.getElementById("executeBtn").addEventListener("click", function() {
        // Fetch value or output of the button
        const outputValue = "Example Output";
  
        // Display output in the output div
        document.getElementById("output").innerText = outputValue;
      });
  
      // Add an event listener to the dropdown items to render the chart on click
      const dropdownItems = document.querySelectorAll(".dropdown-item");
      dropdownItems.forEach(item => {
        item.addEventListener("click", function(event) {
          const selectedValue = event.target.innerText;
          renderChart(selectedValue);
        });
      });
    });
  }
  