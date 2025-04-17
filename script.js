// DOM Elements
const robotSpeech = document.getElementById('speech-text');
const speechBubble = document.getElementById('speech-bubble');
const waterRequest = document.querySelector('.water-request');
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const pumpToggle = document.getElementById('pump-toggle');
const pumpStatus = document.getElementById('pump-status');
const pumpAnimation = document.getElementById('pump-animation');
const moisturePercentage = document.getElementById('moisture-percentage');
const moistureFill = document.querySelector('.moisture-fill');
const moistureStatus = document.getElementById('moisture-status');
const setScheduleBtn = document.getElementById('set-schedule');
const dayElements = document.querySelectorAll('.day');
const historyList = document.getElementById('history-list');
const pumpButton = document.getElementById('pump-button');

// State variables
let currentMoisture = 65;
let isThirsty = false;
let isPumpOn = false;
let selectedDays = [];
let isWatering = false; // Flag to track watering state

// Robot Interaction - Remove initial greeting
window.addEventListener('DOMContentLoaded', () => {
    // Make sure UI elements are in correct state
    pumpAnimation.classList.add('hidden');
    
    // Instead of thirsty message, welcome the user
    /*
    // Old thirsty message - removed
    const randomTime = Math.floor(Math.random() * 8000) + 5000; // 5-13 seconds
    
    setTimeout(() => {
        speechBubble.classList.remove('hidden');
        typeText(robotSpeech, "Em đang khát nước. Bạn có thể cho em uống được không?", 50, () => {
            waterRequest.classList.remove('hidden');
            isThirsty = true;
            updateMoisture(30);
        });
    }, randomTime);
    */
    
    // Initial moisture value should be between 60-65%
    const initialMoisture = Math.floor(Math.random() * 6) + 60;
    updateMoisture(initialMoisture);
});

// Text typing animation
function typeText(element, text, speed, callback) {
    let i = 0;
    element.textContent = '';
    
    function typing() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(typing, speed);
        } else if (callback) {
            callback();
        }
    }
    
    typing();
}

// Moisture functionality
function updateMoisture(value) {
    currentMoisture = value;
    moisturePercentage.textContent = `${value}%`;
    moistureFill.style.width = `${value}%`;
    
    if (value < 40) {
        moistureStatus.textContent = 'Thấp';
        moistureStatus.style.color = 'var(--danger-color)';
    } else if (value < 60) {
        moistureStatus.textContent = 'Trung bình';
        moistureStatus.style.color = 'var(--warning-color)';
    } else {
        moistureStatus.textContent = 'Tốt';
        moistureStatus.style.color = 'var(--success-color)';
    }
}

// Function to show the watering animation
function showWateringAnimation() {
    console.log("Calling showWateringAnimation");
    // Call the main animation trigger function to ensure consistency
    triggerWateringAnimation();
}

// Simulate moisture fluctuations
function simulateMoistureChange() {
    if (!isPumpOn && !isThirsty) {
        // Normal fluctuation
        let change = Math.random() * 4 - 2; // -2 to +2
        let newValue = Math.min(Math.max(currentMoisture + change, 40), 75);
        updateMoisture(Math.round(newValue));
    } else if (isPumpOn) {
        // Increasing when pump is on
        let newValue = Math.min(currentMoisture + 1, 95);
        updateMoisture(Math.round(newValue));
        
        if (currentMoisture >= 80) {
            // Auto turn off pump when moisture is high
            pumpToggle.checked = false;
            isPumpOn = false;
            updatePumpStatus();
            
            // Add to history if pump was on for watering
            if (isThirsty) {
                addWateringHistory('Tưới tự động (độ ẩm phục hồi)');
                isThirsty = false;
            }
        }
    } else if (isThirsty) {
        // Slowly decreasing when thirsty
        let newValue = Math.max(currentMoisture - 0.5, 20);
        updateMoisture(Math.round(newValue));
    }
}

// Run moisture simulation every 2 seconds
setInterval(simulateMoistureChange, 2000);

// Water Request Buttons
// yesBtn.addEventListener('click', () => {
//     // Prevent multiple clicks
//     if (isWatering) return;
//     
//     waterRequest.classList.add('hidden');
//     typeText(robotSpeech, "Cảm ơn bạn! Em sẽ uống ngay.", 50);
//     
//     // Show watering animation
//     showWateringAnimation();
//     
//     // Update after watering
//     setTimeout(() => {
//         updateMoisture(75);
//         typeText(robotSpeech, "Ahhh, tuyệt quá!", 50, () => {
//             setTimeout(() => {
//                 speechBubble.classList.add('hidden');
//             }, 2000);
//         });
//         addWateringHistory('Tưới thủ công');
//         isThirsty = false;
//     }, 5000);
// });
// 
// noBtn.addEventListener('click', () => {
//     waterRequest.classList.add('hidden');
//     typeText(robotSpeech, "Em hiểu rồi. Em sẽ đợi thêm chút nữa.", 50, () => {
//         setTimeout(() => {
//             speechBubble.classList.add('hidden');
//         }, 2000);
//     });
// });

// Pump Toggle
pumpToggle.addEventListener('change', updatePumpStatus);

function updatePumpStatus() {
    isPumpOn = pumpToggle.checked;
    pumpStatus.textContent = isPumpOn ? 'BẬT' : 'TẮT';
    
    if (isPumpOn) {
        // If turning on manually, add to history
        addWateringHistory('Kích hoạt máy bơm thủ công');
        
        // Show watering animation when turning on pump
        showWateringAnimation();
    }
}

// Schedule Functionality
setScheduleBtn.addEventListener('click', () => {
    const scheduleTime = document.getElementById('schedule-time').value;
    
    if (scheduleTime && selectedDays.length > 0) {
        const daysText = selectedDays.join(', ');
        addWateringHistory(`Đặt lịch: ${daysText} lúc ${scheduleTime}`);
        
        // Confirm message
        speechBubble.classList.remove('hidden');
        typeText(robotSpeech, `Đã đặt lịch cho ${daysText} lúc ${scheduleTime}!`, 50, () => {
            setTimeout(() => {
                speechBubble.classList.add('hidden');
            }, 3000);
        });
        
        // Show watering animation for scheduled watering
        showWateringAnimation();
    } else {
        alert('Vui lòng chọn thời gian và ít nhất một ngày');
    }
});

// Day selection
dayElements.forEach(day => {
    day.addEventListener('click', () => {
        day.classList.toggle('active');
        
        const dayValue = day.textContent;
        if (day.classList.contains('active')) {
            selectedDays.push(dayValue);
        } else {
            selectedDays = selectedDays.filter(d => d !== dayValue);
        }
    });
});

// History functionality
function addWateringHistory(text) {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const li = document.createElement('li');
    li.innerHTML = `<span class="date">Hôm nay, ${timeString}</span> - ${text}`;
    
    // Prepend to put newest at top
    historyList.insertBefore(li, historyList.firstChild);
    
    // Limit history items
    if (historyList.children.length > 6) {
        historyList.removeChild(historyList.lastChild);
    }
}

// Function to periodically make the robot thirsty
/*
function makeRobotThirsty() {
    // Only make thirsty if not already thirsty and moisture is good
    if (!isThirsty && currentMoisture > 45 && speechBubble.classList.contains('hidden')) {
        const randomTime = Math.floor(Math.random() * 30000) + 30000; // 30-60 seconds
        
        setTimeout(() => {
            isThirsty = true;
            updateMoisture(35);  // Reduce moisture
            
            // Show speech bubble if hidden
            speechBubble.classList.remove('hidden');
            typeText(robotSpeech, "Em đang khát nước lại rồi. Cho em uống chút nước nhé?", 50, () => {
                waterRequest.classList.remove('hidden');
            });
        }, randomTime);
    }
}

// Run thirsty check every minute
setInterval(makeRobotThirsty, 60000);
*/

// Weather forecast data (fake)
// This would normally come from an API
const weatherData = {
    today: {
        temp: 28,
        condition: 'sunny',
        humidity: 45
    },
    forecast: [
        { day: 'T2', temp: 26, condition: 'partly-cloudy' },
        { day: 'T3', temp: 25, condition: 'rainy' },
        { day: 'T4', temp: 24, condition: 'cloudy' }
    ]
};

// Update weather periodically to simulate real data
function updateWeather() {
    // Slight temperature variations
    weatherData.today.temp = Math.round((weatherData.today.temp + (Math.random() * 2 - 1)) * 10) / 10;
    weatherData.today.humidity = Math.min(Math.max(weatherData.today.humidity + (Math.random() * 6 - 3), 30), 80);
    
    // Update DOM
    document.querySelector('.temp').textContent = `${weatherData.today.temp.toFixed(1)}°C`;
    document.querySelector('.humidity').textContent = `Độ ẩm: ${Math.round(weatherData.today.humidity)}%`;
    
    // If it's raining in the forecast, sometimes make it rain today (just to add some variety)
    if (Math.random() > 0.9) {
        const conditions = ['sunny', 'partly-cloudy', 'cloudy', 'rainy'];
        const newCondition = conditions[Math.floor(Math.random() * conditions.length)];
        
        weatherData.today.condition = newCondition;
        
        // Update icon
        const icon = document.querySelector('.weather-icon i');
        icon.className = '';
        
        switch(newCondition) {
            case 'sunny':
                icon.className = 'fas fa-sun';
                break;
            case 'partly-cloudy':
                icon.className = 'fas fa-cloud-sun';
                break;
            case 'cloudy':
                icon.className = 'fas fa-cloud';
                break;
            case 'rainy':
                icon.className = 'fas fa-cloud-rain';
                break;
        }
    }
}

// Update weather every 5 minutes
setInterval(updateWeather, 300000);

// Fix for pump animation - ensure it's properly hidden on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded");
    
    // Initialize
    updateMoistureReadings();
    initWeatherForecast();
    
    // Debug - log DOM elements
    console.log("Pump Animation:", pumpAnimation);
    console.log("Pump Button:", pumpButton);
    console.log("Speech Bubble:", speechBubble);
    console.log("Yes Button:", yesBtn);
    
    // TEST: Force add global click handlers for debugging
    document.body.addEventListener('click', function(e) {
        if (e.target.id === 'pump-button' || e.target.closest('#pump-button')) {
            console.log("Global pump button click detected");
            triggerWateringAnimation();
            addWateringHistory('Tưới thủ công', '250ml');
        }
        
        if (e.target.id === 'yes-btn' || e.target.closest('#yes-btn')) {
            console.log("Global yes button click detected");
            if (speechBubble) speechBubble.classList.add('hidden');
            triggerWateringAnimation();
            addWateringHistory('Tưới theo yêu cầu', '250ml');
        }
    });
    
    // Ensure pump animation is initially hidden but properly set up
    if (pumpAnimation) {
        pumpAnimation.classList.add('hidden');
        pumpAnimation.style.display = 'none';
    }
    
    // Water Pump Button
    if (pumpButton) {
        console.log("Adding pump button event listener");
        pumpButton.addEventListener('click', function(e) {
            console.log("Pump button clicked");
            e.stopPropagation(); // Prevent event bubbling
            triggerWateringAnimation();
            addWateringHistory('Tưới thủ công', '250ml');
        });
    } else {
        console.error("Pump button not found!");
    }
    
    // Water Request Buttons
    if (yesBtn) {
        console.log("Adding yes button event listener");
        yesBtn.addEventListener('click', function(e) {
            console.log("Yes button clicked");
            e.stopPropagation(); // Prevent event bubbling
            if (speechBubble) speechBubble.classList.add('hidden');
            triggerWateringAnimation();
            addWateringHistory('Tưới theo yêu cầu', '250ml');
        });
    } else {
        console.error("Yes button not found!");
    }
    
    if (noBtn) {
        console.log("Adding no button event listener");
        noBtn.addEventListener('click', function(e) {
            console.log("No button clicked");
            e.stopPropagation(); // Prevent event bubbling
            if (speechBubble) speechBubble.classList.add('hidden');
        });
    } else {
        console.error("No button not found!");
    }
    
    // Date navigation for weather forecast
    const prevDate = document.getElementById('prev-date');
    const nextDate = document.getElementById('next-date');
    
    if (prevDate) {
        prevDate.addEventListener('click', function() {
            navigateDate(-1);
        });
    }
    
    if (nextDate) {
        nextDate.addEventListener('click', function() {
            navigateDate(1);
        });
    }
    
    // Schedule Functionality
    const setScheduleBtn = document.getElementById('set-schedule');
    const waterTimeInput = document.getElementById('water-time');
    const dayElements = document.querySelectorAll('.day');
    
    if (setScheduleBtn && dayElements.length > 0) {
        // Day selection
        dayElements.forEach(day => {
            day.addEventListener('click', () => {
                day.classList.toggle('active');
                
                const dayValue = day.getAttribute('data-day');
                if (day.classList.contains('active')) {
                    if (!selectedDays.includes(dayValue)) {
                        selectedDays.push(dayValue);
                    }
                } else {
                    selectedDays = selectedDays.filter(d => d !== dayValue);
                }
            });
        });
        
        // Set Schedule Button
        setScheduleBtn.addEventListener('click', () => {
            const scheduleTime = waterTimeInput.value;
            
            if (scheduleTime && selectedDays.length > 0) {
                // Create schedule entry in history
                const daysText = selectedDays.join(', ');
                addWateringHistory('Lịch tưới', `${daysText} lúc ${scheduleTime}`);
                
                // Show confirmation
                alert(`Đã đặt lịch tưới cho ${daysText} lúc ${scheduleTime}`);
                
                // Show watering animation as a preview
                triggerWateringAnimation();
            } else {
                alert('Vui lòng chọn thời gian và ít nhất một ngày');
            }
        });
    }
    
    // Show robot notification after a delay
    setTimeout(() => {
        showRobotNotification();
    }, 5000);
});

// Fix watering animation with more direct approach
function triggerWateringAnimation() {
    console.log("Triggering watering animation");
    
    // Get the animation element by ID to ensure we have the right reference
    const pumpAnim = document.getElementById('pump-animation');
    
    if (!pumpAnim) {
        console.error("Pump animation element not found!");
        return;
    }
    
    console.log("Found pump animation, showing it");
    
    // Force display the animation with multiple approaches
    pumpAnim.classList.remove('hidden');
    pumpAnim.classList.add('show-animation'); // Add our override class
    pumpAnim.style.display = 'flex';
    pumpAnim.style.visibility = 'visible';
    pumpAnim.style.opacity = '1';
    
    console.log("Animation should be visible now");
    
    // Hide after delay
    setTimeout(() => {
        console.log("Hiding animation");
        pumpAnim.classList.add('hidden');
        pumpAnim.classList.remove('show-animation'); // Remove our override class
        pumpAnim.style.display = 'none';
        pumpAnim.style.visibility = 'hidden';
        pumpAnim.style.opacity = '0';
    }, 5000);
}

// Automatic Updates
checkMoistureAndNotify();
setInterval(checkMoistureAndNotify, 60000); // Check every minute

// Water Pump Functions
// function activateWaterPump() {
//     // Show the pump animation
//     pumpAnimation.classList.remove('hidden');
//     pumpAnimation.style.display = 'flex';
//     
//     // Simulate pump operation
//     setTimeout(function() {
//         // Hide the animation after 3 seconds
//         pumpAnimation.classList.add('hidden');
//         
//         // Add watering entry to history
//         addWateringHistory('Tưới thủ công', '250ml');
//     }, 3000);
// }

// Moisture Functions
function updateMoistureReadings() {
    // Simulate moisture sensor readings (in a real app, this would fetch from API)
    const randomMoisture = Math.floor(Math.random() * 40) + 30; // Random between 30-70%
    document.getElementById('moisture-fill').style.width = randomMoisture + '%';
    document.getElementById('moisture-percentage').textContent = randomMoisture + '%';
    
    // Update status text based on moisture level
    const moistureStatus = document.getElementById('moisture-status');
    if (randomMoisture < 40) {
        moistureStatus.textContent = 'Khô';
        moistureStatus.style.color = 'var(--danger-color)';
    } else if (randomMoisture < 70) {
        moistureStatus.textContent = 'Ổn định';
        moistureStatus.style.color = 'var(--success-color)';
    } else {
        moistureStatus.textContent = 'Quá ẩm';
        moistureStatus.style.color = 'var(--warning-color)';
    }
}

// Check moisture level and show robot notification if needed
function checkMoistureAndNotify() {
    const moistureValue = parseInt(document.getElementById('moisture-percentage').textContent);
    if (moistureValue < 40) {
        showRobotNotification();
    }
}

// Last Watered Functions
function updateLastWatered() {
    // This would be implemented with actual data in a production app
}

// Add watering entry to history
function addWateringHistory(type, amount) {
    const historyList = document.getElementById('history-list');
    const now = new Date();
    const dateStr = `${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()}, ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const newItem = document.createElement('li');
    newItem.innerHTML = `<span class="date">${dateStr}</span> - ${type}: ${amount}`;
    
    // Add to the top of the list
    historyList.insertBefore(newItem, historyList.firstChild);
}

// Weather Forecast Functions
function initWeatherForecast() {
    // Set current date for forecast
    const today = new Date();
    updateDateDisplay(today);
    
    // Load hourly forecast data
    loadHourlyForecast(today);
}

function updateDateDisplay(date) {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const day = days[date.getDay()];
    const dateStr = `${day}, ${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;
    
    document.querySelector('.current-date').textContent = dateStr;
    document.querySelector('.current-date').setAttribute('data-date', date.toISOString());
}

function navigateDate(direction) {
    const currentDateElem = document.querySelector('.current-date');
    const currentDate = new Date(currentDateElem.getAttribute('data-date'));
    
    // Add or subtract one day
    currentDate.setDate(currentDate.getDate() + direction);
    
    // Update date display
    updateDateDisplay(currentDate);
    
    // Load new forecast
    loadHourlyForecast(currentDate);
}

function loadHourlyForecast(date) {
    const forecastContainer = document.querySelector('.hourly-forecast-scroll');
    forecastContainer.innerHTML = '';
    
    // Generate random forecast data based on the date
    const isToday = new Date().toDateString() === date.toDateString();
    const isSunny = date.getDay() % 2 === 0; // Even days are sunny, odd days have more clouds/rain
    
    for (let h = 6; h <= 23; h++) {
        const hourStr = h.toString().padStart(2, '0') + ':00';
        
        // Temperature follows a curve during the day
        let baseTemp;
        if (h < 10) baseTemp = 22 + (h - 6) * 1.5; // Morning warming
        else if (h < 16) baseTemp = 28 + (h - 10) * 0.8; // Afternoon peak
        else baseTemp = 32 - (h - 16) * 1.2; // Evening cooling
        
        // Adjust base temperature by date
        const dayOffset = Math.abs((date.getDate() % 5) - 2); // 0-2 range
        baseTemp += (dayOffset - 1) * 2; // -2 to +2 adjustment based on date
        
        const temp = Math.round(baseTemp);
        
        // Determine weather icon and precipitation
        let icon, precip;
        
        if (isSunny) {
            if (h < 8 || h > 18) {
                icon = h < 8 ? 'fa-cloud-sun' : 'fa-cloud-moon';
                precip = (5 + Math.floor(Math.random() * 10)) + '%';
            } else {
                icon = 'fa-sun';
                precip = '0%';
            }
        } else {
            // More variable weather on odd days
            const timeOfDay = h < 12 ? 0 : (h < 18 ? 1 : 2); // morning, afternoon, evening
            const random = Math.random();
            
            if (timeOfDay === 1 && random < 0.7) { // Afternoon storms more likely
                icon = random < 0.4 ? 'fa-cloud-rain' : 'fa-cloud-showers-heavy';
                precip = (30 + Math.floor(Math.random() * 50)) + '%';
            } else if (random < 0.4) {
                icon = h < 8 || h > 18 ? 'fa-cloud-moon' : 'fa-cloud';
                precip = (10 + Math.floor(Math.random() * 20)) + '%';
            } else {
                icon = h < 8 ? 'fa-cloud-sun' : (h > 18 ? 'fa-cloud-moon' : 'fa-cloud-sun');
                precip = (5 + Math.floor(Math.random() * 15)) + '%';
            }
        }
        
        // Create the hourly item element
        const hourlyItem = document.createElement('div');
        hourlyItem.className = 'hourly-item';
        hourlyItem.innerHTML = `
            <div class="hour">${hourStr}</div>
            <i class="fas ${icon} hourly-icon"></i>
            <div class="hourly-temp">${temp}°C</div>
            <div class="hourly-precip">${precip}</div>
        `;
        
        forecastContainer.appendChild(hourlyItem);
    }
    
    // Update weather details
    updateWeatherDetails(date);
}

function updateWeatherDetails(date) {
    const isSunny = date.getDay() % 2 === 0;
    
    // Generate realistic weather details based on the sunny/cloudy pattern
    const humidity = isSunny ? 
        Math.floor(Math.random() * 20 + 50) : // 50-70% on sunny days
        Math.floor(Math.random() * 20 + 65); // 65-85% on cloudy/rainy days
    
    const wind = isSunny ?
        Math.floor(Math.random() * 8 + 5) : // 5-13 km/h on sunny days
        Math.floor(Math.random() * 12 + 8); // 8-20 km/h on cloudy/rainy days
    
    // Update the weather details in the card
    document.querySelector('.detail-item:nth-child(4) div').textContent = `Độ ẩm: ${humidity}%`;
    document.querySelector('.detail-item:nth-child(3) div').textContent = `Gió: ${wind}km/h`;
}

// Function to show robot notification
function showRobotNotification() {
    if (robotSpeech && speechBubble) {
        robotSpeech.textContent = "Em khát nước, chủ nhân có thể cho em uống nước không ạ";
        speechBubble.classList.remove('hidden');
    }
}