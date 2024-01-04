const seatGeekClientId = 'MzkwNzkxODN8MTcwMzMyNDg3Ni4zMDQzNTE4';

function fetchSeatGeekData(query, isEventId = false) { 
    let url;
    if (isEventId) {
        url = `https://api.seatgeek.com/2/events/${query}?client_id=${seatGeekClientId}`;
    } else {
        url = `https://api.seatgeek.com/2/events?q=${query}&client_id=${seatGeekClientId}`;
    }

    // return fetch(url)
    //     .then(response => {
    //         if (!response.ok) {
    //             throw new Error(`HTTP error! Status: ${response.status}`);
    //         }
    //         return response.json();
    //     })
    //     .catch(error => {
    //         console.error("Network error:", error);
    //     });
}

const searchBtn = document.getElementById('search-btn'); 
const eventList = document.getElementById('event-list');  
const eventDetailsContent = document.querySelector('.event-details-content'); 
const eventCloseBtn = document.getElementById('event-close-btn'); 

searchBtn.addEventListener('click', getEventList);
eventList.addEventListener('click', getEventDetails);
eventCloseBtn.addEventListener('click', () => {
    eventDetailsContent.parentElement.classList.remove('showEvent');
});

function getEventList() { 
    let searchInputTxt = document.getElementById('search-input').value.trim();
    if (searchInputTxt === '') {
        alert("You should enter an event!");
        return;
    }
    fetchSeatGeekData(searchInputTxt)
        .then(data => {
            let html = "";
            if (data && data.events && data.events.length > 0) {
                data.events.forEach(event => {
                    const eventDate = new Date(event.datetime_local).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });

                    let eventPrice = 'Price not available';
                    if (event.stats.lowest_price) {
                        const currencySymbol = '$';
                        eventPrice = `${currencySymbol}${event.stats.lowest_price}`;
                    }

                    html += `
                    <div class = "event-item" data-aos="fade-up" data-aos-duration="1000" data-id = "${event.id}">
                        <div class = "event-img">
                            <img src="${event.performers[0].image}" alt="Event Image"> 
                        </div>
                        <div class = "event-name">
                            <h3>${event.title}</h3>
                            <p><i class = "fas fa-calendar-day"></i> ${eventDate}</p>
                            <p>Price: ${eventPrice}</p>
                            <a href = "#" class = "event-btn">Get Tickets</a>
                        </div>
                    </div>
                `;
                });
                eventList.classList.remove('notFound');
            } else {
                html = "Sorry, we didn't find any events!";
                eventList.classList.add('notFound');
            }
            eventList.innerHTML = html;
        });
}

function getEventDetails(e) { 
    e.preventDefault(); 
    if (e.target.classList.contains('event-btn')) {
        let eventItem = e.target.parentElement.parentElement; 
        const eventId = eventItem.dataset.id;
        fetchSeatGeekData(eventId, true)
            .then(data => {
                console.log("API Response:", data);
                if (data) {
                    eventModal(data);
                } else {
                    console.error('Event details not found');
                }
            })
            .catch(error => {
                console.error("Error fetching event details:", error);
            });
    }
}

function eventModal(event) { 

    const eventDateTime = new Date(event.datetime_local).toLocaleString("en-US", 
    { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }); 

    let venueDetails = event.venue ? `<p><strong>Location:</strong> ${event.venue.name}, 
    ${event.venue.address}, ${event.venue.city}, ${event.venue.state}</p>` : '<p>Venue details not available</p>';

    let eventPrice = 'Not available';
    if (event.stats.lowest_price) {
        const currencySymbol = '$';
        eventPrice = `${currencySymbol}${event.stats.lowest_price}`;
    }

    let html = `
        <h2 class="event-title">${event.title}</h2>
        <img src="${event.performers[0].image}" alt="Event Image"> 
        <p><strong>Date and Time:</strong> ${eventDateTime}</p>
        ${venueDetails}
        <p><strong>Performers:</strong> ${event.performers.map(performer => performer.name).join(', ')}</p>
        <p><strong>Price:</strong> ${eventPrice}</p>
        <div class="social-share">
        <a href="https://www.facebook.com/sharer/sharer.php?u=${(event.url)}" target="_blank" class="social-icon">
            <i class="fab fa-facebook-f"></i>
        </a>
        <a href="#" class="social-icon">
            <i class="fab fa-instagram"></i>
        </a>
        <a href="#" class="social-icon">
            <i class="fab fa-tiktok"></i>
        </a>
    </div>
        <div class="event-link">
            <a href="${event.url || '#'}" class="event-btn" target="_blank">Save your spot</a>
        </div>
    `;
    eventDetailsContent.innerHTML = html; 
    eventDetailsContent.parentElement.classList.add('showEvent'); 
}
