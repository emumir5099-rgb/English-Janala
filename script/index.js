// ১. এলিমেন্ট সিলেকশন
const lessonContainer = document.getElementById('lesson-container');
const displayBox = document.getElementById('display-box');
const searchInput = document.getElementById('search-input');

const loadLevels = async () => {
    try {
        const res = await fetch('https://openapi.programming-hero.com/api/levels/all');
        const data = await res.json();
        
        console.log("API Data received:", data); 
        if (data.status && data.data) {
            displayLessons(data.data);
        } else {
            lessonContainer.innerHTML = `<p class="text-error">ডাটা পাওয়া যায়নি!</p>`;
        }
    } catch (err) {
        console.error("Fetch Error:", err);
        lessonContainer.innerHTML = `<p class="text-error">সার্ভার কানেকশন ফেইলড!</p>`;
    }
};

const displayLessons = (lessons) => {
    lessonContainer.innerHTML = ''; 
    
    lessons.forEach(lesson => {
        const btn = document.createElement('button');
       
        btn.className = "btn btn-outline border-indigo-500 text-indigo-600 hover:bg-indigo-600 hover:text-white gap-2 lesson-btn transition-all duration-300 rounded-xl px-6 py-2 shadow-sm";
        
        
        const title = lesson.level_name || `Lesson ${lesson.level_no}`;
        
        btn.innerHTML = `
            <i class="fa-solid fa-book-open text-xs"></i> 
            <span class="font-semibold">${title}</span>
        `;

        btn.onclick = () => {
            
            document.querySelectorAll('.lesson-btn').forEach(b => {
                b.classList.remove('bg-indigo-600', 'text-white');
            });
            btn.classList.add('bg-indigo-600', 'text-white');
            
            
            loadWords(lesson.level_no);
        };
        lessonContainer.appendChild(btn);
    });
};

const loadWords = async (levelNo) => {
    displayBox.innerHTML = `<div class="flex flex-col items-center"><span class="loading loading-spinner loading-lg text-indigo-600"></span><p class="mt-2 text-gray-500">শব্দ লোড হচ্ছে...</p></div>`;
    
    try {
        const res = await fetch(`https://openapi.programming-hero.com/api/level/${levelNo}`);
        const data = await res.json();
        renderCards(data.data);
    } catch (err) {
        displayBox.innerHTML = `<h3 class="text-xl text-red-400 font-bangla">এই লেসনে কোনো শব্দ পাওয়া যায়নি।</h3>`;
    }
};

const renderCards = (words) => {
    displayBox.className = "w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-10 px-4";
    displayBox.innerHTML = '';

    if (!words || words.length === 0) {
        displayBox.innerHTML = `<h3 class="col-span-full text-2xl text-gray-400 font-bangla text-center">দুঃখিত, কোনো শব্দ নেই।</h3>`;
        return;
    }

    words.forEach(item => {
        const card = document.createElement('div');
        card.className = "bg-white p-6 rounded-2xl border border-gray-100 shadow-md text-left flex flex-col justify-between hover:shadow-xl transition-all border-b-4 border-b-indigo-500";
        card.innerHTML = `
            <div>
                <div class="flex justify-between items-center mb-2">
                    <h3 class="text-2xl font-bold text-indigo-700">${item.word}</h3>
                    <button onclick="saveWord('${item.word}')" class="text-gray-300 hover:text-red-500 text-xl transition-colors">
                        <i class="fa-solid fa-heart"></i>
                    </button>
                </div>
                <p class="text-gray-400 italic mb-2 font-medium">${item.pronunciation || '/.../'}</p>
                <p class="font-bangla text-gray-700 mb-6 text-lg leading-relaxed">${item.meaning}</p>
            </div>
            <div class="flex gap-2 border-t border-gray-50 pt-4 mt-auto">
                <button onclick="pronounceWord('${item.word}')" class="btn btn-sm btn-circle btn-ghost border-indigo-100 hover:bg-indigo-50">
                    <i class="fa-solid fa-volume-high text-indigo-600"></i>
                </button>
                <button onclick="showDetails('${item.id}')" class="btn btn-sm bg-indigo-50 text-indigo-700 flex-grow border-none hover:bg-indigo-600 hover:text-white font-bold transition-colors">Details</button>
            </div>
        `;
        displayBox.appendChild(card);
    });
};


function pronounceWord(word) {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
}

async function showDetails(id) {
    const res = await fetch(`https://openapi.programming-hero.com/api/word/${id}`);
    const data = await res.json();
    const info = data.data;
    document.getElementById('modal-content').innerHTML = `
        <h3 class="text-3xl font-extrabold text-indigo-600">${info.word}</h3>
        <p class="text-xl font-bangla text-gray-700 mt-4">অর্থ: ${info.meaning}</p>
        <div class="bg-indigo-50 p-4 rounded-lg mt-4">
            <p class="text-gray-600 italic">" ${info.example || 'No example available' } "</p>
        </div>
    `;
    document.getElementById('details_modal').showModal();
}

function saveWord(word) {
    let savedWords = JSON.parse(localStorage.getItem('saved_vocab')) || [];
    if (!savedWords.includes(word)) {
        savedWords.push(word);
        localStorage.setItem('saved_vocab', JSON.stringify(savedWords));
        alert(`"${word}" সেভ করা হয়েছে!`);
    } else {
        alert("এটি আগেই সেভ করা আছে।");
    }
}


searchInput.addEventListener('input', async (e) => {
    const val = e.target.value.toLowerCase();
    
    if (val === "") {
        displayBox.innerHTML = `<h3 class="col-span-full font-bangla text-2xl text-gray-400 text-center py-10">একটি Lesson Select করুন অথবা শব্দ সার্চ করুন।</h3>`;
        return;
    }

    try {
        const res = await fetch('https://openapi.programming-hero.com/api/words/all');
        const data = await res.json();
        const filtered = data.data.filter(item => item.word.toLowerCase().includes(val));
        renderCards(filtered);
    } catch (err) {
        console.error("Search error:", err);
    }
});

loadLevels();