    document.addEventListener('DOMContentLoaded', function() {
    // Arrays to hold the selections
    let selectedProvinces = [];
    let selectedCharacteristics = [];

    // Function to update the selection arrays
    function updateSelections() {
        selectedProvinces = []; // Reset the array
        document.querySelectorAll('.province-checkbox:checked').forEach(function(checkbox) {
            selectedProvinces.push(checkbox.value);
        });

        selectedCharacteristics = []; // Reset the array
        document.querySelectorAll('.characteristic-checkbox:checked').forEach(function(checkbox) {
            selectedCharacteristics.push(checkbox.value);
        });

        // Update button colors based on selected characteristics
        var colorMapping = {
            "Perceived Good Health": "#5C3E23",
            "Perceived Poor Health": "#2A3A92",
            "Percieved good mental health": "#02692B",
            "Percieved poor mental health": "#1388E7",
            "Obese": "#E00400",
            "Diabetes": "#A637F6",
            "High blood pressure": "#C72486",
            "Mood disorder": "#DD7703"
        };

        document.querySelectorAll('.characteristic-checkbox').forEach(function(checkbox) {
            if (checkbox.checked) {

                checkbox.style.border = '3px solid'; // Highlight selected buttons
                checkbox.style.borderColor = colorMapping[checkbox.value] || '#000000'; // Set color based on value
                
            } else {
                checkbox.style.border = ''; // Reset to default color
            }
        });
    

        // AJAX request to fetch filtered data
        fetch('../filter_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                provinces: selectedProvinces,
                characteristics: selectedCharacteristics,
            }),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data)
            updateCircleChartProvince(data['provinces'])
            updateLineChart(data); // Call function to update the chart with new data
        })
        .catch(error => console.error('Error fetching data:', error));
    }
    

    // Add event listeners to checkboxes to trigger updateSelections
    document.querySelectorAll('.province-checkbox').forEach(function(checkbox) {
        checkbox.addEventListener('change', updateSelections);
    });
    document.querySelectorAll('.characteristic-checkbox').forEach(function(checkbox) {
        checkbox.addEventListener('change', updateSelections);
    });
});