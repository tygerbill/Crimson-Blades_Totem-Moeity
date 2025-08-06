// Global variables to manage the quiz state
let quizData = [];
let currentQuestionIndex = 0;
let userModality = '';
let scores = {
    extraversion: 0,
    agreeableness: 0,
    conscientiousness: 0,
    neuroticism: 0,
    openness: 0
};

// HTML elements
const appContainer = document.getElementById('app-container');

// --- Main Functions ---

// 1. Load the quiz data from the JSON file
async function loadQuiz() {
    try {
        const response = await fetch('quizData.json');
        quizData = await response.json();
        showWelcomeScreen();
    } catch (error) {
        console.error('Error loading quiz data:', error);
        appContainer.innerHTML = '<p>An error occurred. Please try again later.</p>';
    }
}

// 2. Display the initial welcome and modality selection screen
function showWelcomeScreen() {
    appContainer.innerHTML = `
        <div class="welcome-screen">
            <h1>Commander's Compass</h1>
            <p>Welcome, Commander. Before we begin, a choice must be made.</p>
            <p>Will you lead as a **Hero**, or contribute as a key part of the **Team**?</p>
            <div class="modalities-container">
                <button class="modality-button" onclick="startQuiz('hero')">Hero</button>
                <button class="modality-button" onclick="startQuiz('team')">Team</button>
            </div>
        </div>
    `;
}

// 3. Start the quiz and set the chosen modality
function startQuiz(modality) {
    userModality = modality;
    currentQuestionIndex = 0;
    scores = {
        extraversion: 0,
        agreeableness: 0,
        conscientiousness: 0,
        neuroticism: 0,
        openness: 0
    };
    displayQuestion();
}

// 4. Dynamically display the current question and its choices
function displayQuestion() {
    if (currentQuestionIndex < quizData.length) {
        const question = quizData[currentQuestionIndex];
        appContainer.innerHTML = `
            <div class="quiz-container">
                <h2>Question ${currentQuestionIndex + 1} of ${quizData.length}</h2>
                <p class="quiz-question">${question.question}</p>
                <div class="choices-container">
                    ${question.choices.map((choice, index) => `
                        <button class="choice-button" onclick="handleAnswer(${index})">${choice.text}</button>
                    `).join('')}
                </div>
                <div class="navigation-container">
                    ${currentQuestionIndex > 0 ? `<button class="nav-button" onclick="goBack()">Back</button>` : ''}
                </div>
            </div>
        `;
    } else {
        showResults();
    }
}

// 5. Handle the user's answer and update scores
function handleAnswer(choiceIndex) {
    const question = quizData[currentQuestionIndex];
    const choice = question.choices[choiceIndex];

    // Add scores for each trait from the selected choice
    scores.extraversion += choice.scores.extraversion || 0;
    scores.agreeableness += choice.scores.agreeableness || 0;
    scores.conscientiousness += choice.scores.conscientiousness || 0;
    scores.neuroticism += choice.scores.neuroticism || 0;
    scores.openness += choice.scores.openness || 0;

    currentQuestionIndex++;
    displayQuestion();
}

// 6. Go back to the previous question (for a better user experience)
function goBack() {
    if (currentQuestionIndex > 0) {
        // This is a simple back function. A more complex one would reverse the score change.
        // For this project, we'll keep it simple and just go back visually.
        currentQuestionIndex--;
        displayQuestion();
    }
}

// 7. Calculate and display the final results
function showResults() {
    const maxScores = {
        extraversion: 40,
        agreeableness: 45,
        conscientiousness: 45,
        neuroticism: 45,
        openness: 45
    };
    
    // Normalize scores to a percentage
    let normalizedScores = {};
    for (const trait in scores) {
        normalizedScores[trait] = Math.round((scores[trait] / maxScores[trait]) * 100);
    }
    
    // Apply modality weighting (this is where the choice matters!)
    if (userModality === 'hero') {
        normalizedScores.extraversion = Math.min(100, normalizedScores.extraversion + 5);
        normalizedScores.conscientiousness = Math.min(100, normalizedScores.conscientiousness + 5);
    } else if (userModality === 'team') {
        normalizedScores.agreeableness = Math.min(100, normalizedScores.agreeableness + 5);
        normalizedScores.conscientiousness = Math.min(100, normalizedScores.conscientiousness + 5);
    }

    // Determine the top personality trait
    const topTrait = Object.keys(normalizedScores).reduce((a, b) => normalizedScores[a] > normalizedScores[b] ? a : b);

    // Display the results screen with the final scores
    appContainer.innerHTML = `
        <div class="results-container">
            <h1>The Commander's Compass</h1>
            <p>Your journey is complete, Commander. Your results are in:</p>
            <div class="compass-container">
                <h3>Your Primary Trait: ${topTrait.charAt(0).toUpperCase() + topTrait.slice(1)}</h3>
                <ul>
                    <li>Extraversion: ${normalizedScores.extraversion}%</li>
                    <li>Agreeableness: ${normalizedScores.agreeableness}%</li>
                    <li>Conscientiousness: ${normalizedScores.conscientiousness}%</li>
                    <li>Neuroticism: ${normalizedScores.neuroticism}%</li>
                    <li>Openness: ${normalizedScores.openness}%</li>
                </ul>
            </div>
            <p>Based on your profile, you are a natural-born ${userModality}.</p>
            <p>A true ${topTrait.charAt(0).toUpperCase() + topTrait.slice(1)} leads the charge with conviction. Use this knowledge to your advantage.</p>
            <button onclick="showWelcomeScreen()">Start Over</button>
        </div>
    `;
}

// --- Start the App ---
document.addEventListener('DOMContentLoaded', loadQuiz);
