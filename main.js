import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getDatabase, ref, set, get, push } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-database.js";

const dishes = {
    "Marco": "Starters 🍲",
    "Marian": "Snacks 🥨",
    "Carlos": "Mains 🍖",
    "Lucas": "Desserts 🍰"
}

const firebaseConfig = {
    apiKey: "AIzaSyCw7Rw4e9oYwHqWJvcC_pjobhd7cGevufI",
    authDomain: "christmas-menu-generator.firebaseapp.com",
    projectId: "christmas-menu-generator",
    storageBucket: "christmas-menu-generator.appspot.com",
    messagingSenderId: "117110620118",
    appId: "1:117110620118:web:382ff103cf684f9548ae77"
};

function checkLockedUser() {
    try {
        // Get localStorage data
        const metadata = window.localStorage.getItem('user');
        const { username, token, suggestions } = JSON.parse(metadata);

        const dish = dishes[username];
        injectSuggestions(dish, suggestions);
    } catch {
        alert("Read the instructions!");
    }
}

async function submitForm() {
    // Get and validate form values
    let username, token;
    try {
        username = document.querySelector('input[name="user"]:checked').value || null;
        token = document.getElementById('token').value || null;
        if (!username || username == '' || !token || token == '') throw ''; 
    } catch {
        alert("Complete with your name and identity token.");
        return;
    }
    
    // Generate and inject suggestions to the view
    const suggestions = await generateSuggestions(username, token);
    const dish = dishes[username];
    injectSuggestions(dish, suggestions);
    
    // Lock user suggestions
    lockUser(username, token, suggestions);
}

function generateSuggestions(username, token) {
    return new Promise(resolve => {
        // Get suggestions from database
        const db = getDatabase(app);
        get(ref(db, `suggestions/${username}`)).then(snapshot => {
            const options = [...snapshot.val()];
            
            // Get three random options by username
            const suggestions = [];
            while (suggestions.length !== 3) {
                let rnd = parseInt(Math.random() * options.length);
                const suggestion = options[rnd];
                if (!suggestions.includes(suggestion)) suggestions.push(suggestion);
            }

            // Return generated options
            resolve(suggestions);
        });
    });
}

function injectSuggestions(dish, suggestions) {
    // Hide form
    const form = document.getElementById("form");
    form.parentElement.removeChild(form);

    // Update dish type
    document.getElementById('dish').innerHTML = dish;

    // Get parent element
    const listParent = document.getElementById('suggestions');
    listParent.innerHTML = '';

    // Iterate over suggestions inject each one
    suggestions.forEach(suggestion => listParent.innerHTML += `<li>${suggestion}</li>`);

}

function lockUser(username, token, suggestions) {
    // Track data
    const date = new Date().toISOString();
    const db = getDatabase(app);
    const users = ref(db, 'users');
    const newUser = push(users);
    set(newUser, { username, token, suggestions, date });
    
    // Store username and token on localStorage
    const metadata = JSON.stringify({ username, token, suggestions })
    window.localStorage.setItem('user', metadata);
}

function main() {
    const form = document.getElementById('form');
    form.addEventListener('submit', e => {
        e.preventDefault();
        submitForm();
    });

    checkLockedUser();
}

const app = initializeApp(firebaseConfig);
main();