// API Configuration
const API_BASE_URL = 'https://fedskillstest.coalitiontechnologies.workers.dev';
const API_USERNAME = 'coalition';
const API_PASSWORD = 'skills-test';

// Global variables
let patientsData = [];
let jessicaData = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    fetchPatientData();
});

// Fetch patient data from API
async function fetchPatientData() {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + btoa(API_USERNAME + ':' + API_PASSWORD)
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        patientsData = await response.json();
        console.log('Patients Data:', patientsData);

        // Find Jessica Taylor's data
        jessicaData = patientsData.find(patient => patient.name === 'Jessica Taylor');
        
        if (jessicaData) {
            console.log('Jessica Taylor Data:', jessicaData);
            populatePatientsList();
            populateJessicaProfile();
            populateDiagnosisHistory();
            createBloodPressureChart();
        } else {
            console.error('Jessica Taylor not found in patient data');
        }

    } catch (error) {
        console.error('Error fetching patient data:', error);
        alert('Failed to load patient data. Please check console for details.');
    }
}

// Populate the patients list in the sidebar
function populatePatientsList() {
    const patientsList = document.getElementById('patientsList');
    patientsList.innerHTML = '';

    patientsData.forEach(patient => {
        const listItem = document.createElement('li');
        listItem.className = 'patient-item';
        
        // Highlight Jessica Taylor
        if (patient.name === 'Jessica Taylor') {
            listItem.classList.add('active');
        }

        listItem.innerHTML = `
            <img src="${patient.profile_picture}" alt="${patient.name}" class="patient-avatar">
            <div class="patient-details">
                <h3>${patient.name}</h3>
                <p>${patient.gender}, ${patient.age}</p>
            </div>
            <button class="patient-more"><img src="img/more_horiz_FILL0_wght300_GRAD0_opsz24.svg" alt="More"></button>
        `;

        patientsList.appendChild(listItem);
    });
}

// Populate Jessica Taylor's profile information
function populateJessicaProfile() {
    if (!jessicaData) return;

    // Profile image and name
    document.getElementById('patientImage').src = jessicaData.profile_picture;
    document.getElementById('patientName').textContent = jessicaData.name;

    // Date of birth
    document.getElementById('dob').textContent = jessicaData.date_of_birth;

    // Gender
    document.getElementById('gender').textContent = jessicaData.gender;

    // Phone number
    document.getElementById('phone').textContent = jessicaData.phone_number;

    // Emergency contact
    document.getElementById('emergencyContact').textContent = jessicaData.emergency_contact;

    // Insurance provider
    document.getElementById('insurance').textContent = jessicaData.insurance_type;
}

// Populate diagnosis history (vital signs)
function populateDiagnosisHistory() {
    if (!jessicaData || !jessicaData.diagnosis_history || jessicaData.diagnosis_history.length === 0) {
        console.error('No diagnosis history available');
        return;
    }

    // Get the most recent diagnosis
    const latestDiagnosis = jessicaData.diagnosis_history[0];

    // Respiratory Rate
    const respiratoryRate = latestDiagnosis.respiratory_rate;
    document.getElementById('respiratoryRate').textContent = `${respiratoryRate.value} bpm`;

    // Temperature
    const temperature = latestDiagnosis.temperature;
    document.getElementById('temperature').textContent = `${temperature.value}°F`;

    // Heart Rate
    const heartRate = latestDiagnosis.heart_rate;
    document.getElementById('heartRate').textContent = `${heartRate.value} bpm`;

    // Blood Pressure (for legend)
    const bloodPressure = latestDiagnosis.blood_pressure;
    document.getElementById('systolicValue').textContent = bloodPressure.systolic.value;
    document.getElementById('diastolicValue').textContent = bloodPressure.diastolic.value;
}

// Create blood pressure chart using Chart.js
function createBloodPressureChart() {
    if (!jessicaData || !jessicaData.diagnosis_history) {
        console.error('No diagnosis history for chart');
        return;
    }

    // Get last 6 months of data (reverse to show oldest first)
    const chartData = jessicaData.diagnosis_history.slice(0, 6).reverse();

    // Extract labels (months/years)
    const labels = chartData.map(item => {
        const date = new Date(item.month + ' ' + item.year);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });

    // Extract systolic and diastolic values
    const systolicData = chartData.map(item => item.blood_pressure.systolic.value);
    const diastolicData = chartData.map(item => item.blood_pressure.diastolic.value);

    // Get canvas context
    const ctx = document.getElementById('bloodPressureChart').getContext('2d');

    // Create the chart
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Systolic',
                    data: systolicData,
                    borderColor: '#C26EB4',
                    backgroundColor: 'rgba(194, 110, 180, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#C26EB4',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 8
                },
                {
                    label: 'Diastolic',
                    data: diastolicData,
                    borderColor: '#7E6CAB',
                    backgroundColor: 'rgba(126, 108, 171, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#7E6CAB',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#ddd',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 60,
                    max: 180,
                    ticks: {
                        stepSize: 20,
                        color: '#072635',
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        color: '#072635',
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}