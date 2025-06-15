document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (menuToggle) {
      menuToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        mainNav.classList.toggle('active');
      });
    }
    
    // Smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80, // Adjust for header height
            behavior: 'smooth'
          });
          
          // Close mobile menu if open
          if (menuToggle && menuToggle.classList.contains('active')) {
            menuToggle.click();
          }
        }
      });
    });
    
        // Initialize Quiz
    initQuiz();
    
    // Initialize Song Request System
    initSongRequests();
    
    // Initialize Marriage Advice Cards
    initAdviceCards();
  });

  // Quiz
  function initQuiz() {
    const quizContainer = document.getElementById('quiz-container');
    
    if (!quizContainer) return;
    
    let currentQuestion = 0;
    let score = 0;
    let questions = [];
    
    // Fetch questions from JSON file
    fetch('/data/quiz.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        questions = data;
        showQuestion();
      })
      .catch(error => {
        console.error('Error loading quiz:', error);
        quizContainer.innerHTML = 
          '<p class="error">Perdão, tente novamente</p>';
      });
    
    function showQuestion() {
      if (currentQuestion >= questions.length) {
        showResults();
        return;
      }
      
      const question = questions[currentQuestion];
      
      let optionsHTML = '';
      question.options.forEach((option, index) => {
        optionsHTML += `
          <div class="quiz-option">
            <input type="radio" name="quiz" id="option${index}" value="${index}">
            <label for="option${index}">${option}</label>
          </div>
        `;
      });
      
      quizContainer.innerHTML = `
        <div class="quiz-question">
          <h3>Pergunta ${currentQuestion + 1}/${questions.length}</h3>
          <p>${question.question}</p>
          <div class="quiz-options">
            ${optionsHTML}
          </div>
          <button id="submit-answer" class="btn">Enviar resposta</button>
        </div>
      `;
      
      document.getElementById('submit-answer').addEventListener('click', checkAnswer);
    }
    
    function checkAnswer() {
      const selectedOption = document.querySelector('input[name="quiz"]:checked');
      
      if (!selectedOption) {
        alert('Por favor escolha uma resposta!');
        return;
      }
      
      const answer = parseInt(selectedOption.value);
      const correctAnswer = questions[currentQuestion].correctAnswer;
      
      if (answer === correctAnswer) {
        score++;
      }
      
      // Show fun fact
      const funFact = questions[currentQuestion].funFact;
      
      quizContainer.innerHTML += `
        <div class="fun-fact">
          <p class="${answer === correctAnswer ? 'correct-answer' : 'wrong-answer'}">
            ${answer === correctAnswer ? '✓ Correto!' : '✗ Não exatamente!'}
          </p>
          <p>${funFact}</p>
          <button id="next-question" class="btn">Próxima</button>
        </div>
      `;
      
      document.getElementById('next-question').addEventListener('click', () => {
        currentQuestion++;
        showQuestion();
      });
    }
    
    function showResults() {
      quizContainer.innerHTML = `
        <div class="quiz-results">
          <h3>Resultado do Quiz</h3>
          <p class="score">Você acertou ${score} de ${questions.length}!</p>
          <p>${score >= questions.length/2 ? 'Você nos conhece bem!' : 'É... ainda tem muito o que aprender sobre a gente!'}</p>
          <button id="restart-quiz" class="btn">Fazer novamente</button>
        </div>
      `;
      
      document.getElementById('restart-quiz').addEventListener('click', () => {
        currentQuestion = 0;
        score = 0;
        showQuestion();
      });
      
      // Save results to MongoDB (optional)
      /* const guestName = localStorage.getItem('guestName') || 'Anonymous';
      

   
        fetch('/api/quiz-results',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({
          name: guestName,
          score: score,
          total: questions.length
        })
      }).catch(error => console.error('Erro ao salvar seu resultado:', error)); */
    }
  }
  
  // Song Request System
  function initSongRequests() {
    const songForm = document.getElementById('songRequestForm');
   
    
    if (!songForm) return;
        
    songForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(songForm);
      const songData = {
        songTitle: formData.get('songTitle'),
        youtubeLink: formData.get('youtubeLink'),
        requestedBy: 'Anônimo'
      };
      
      // Validate YouTube link if provided
      if (songData.youtubeLink && 
          !songData.youtubeLink.includes('youtube.com') && 
          !songData.youtubeLink.includes('youtu.be')) {
        alert('Por favor, insira um link aceitável ou deixe em branco.');
        return;
      }
      
      // Show loading state
      document.getElementById('songSubmitBtn').textContent = 'Enviando...';
      document.getElementById('songSubmitBtn').disabled = true;
      
      
    fetch('/api/song-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        
        body: JSON.stringify(songData)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Reset button text
        document.getElementById('songSubmitBtn').textContent = 'Enviar música';
        document.getElementById('songSubmitBtn').disabled = false;
        
        // Show confirmation and reset form
        document.getElementById('songRequestConfirmation').style.display = 'block';
        songForm.reset();
                
        // Hide confirmation after 3 seconds
        setTimeout(() => {
          document.getElementById('songRequestConfirmation').style.display = 'none';
        }, 3000);
        
        // Refresh playlist if it exists on the page
        loadPlaylist();
      })
      .catch(error => {
        console.error('Error:', error);
        document.getElementById('songSubmitBtn').textContent = 'Enviar música';
        document.getElementById('songSubmitBtn').disabled = false;
        alert('Poxa, não deu certo. Tente novamente!');
      });
    });
    
    
    loadPlaylist();
    
    
    // Function to load and display the YouTube playlist
    function loadPlaylist() {
      const playlistContainer = document.getElementById('youtube-playlist');
      if (!playlistContainer) return;
      
      // Show loading state
      playlistContainer.innerHTML = '<p class="loading">Carregando playlist...</p>';
    
      
      fetch('/api/song-requests')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          if (data.length === 0) {
            playlistContainer.innerHTML = '<p>Nenhuma música foi sugerida ainda. Seja o primeiro!</p>';
            return;
          }
          
          let playlistHTML = '<p>Lista de músicas já sugeridas:</p>';
          
          // Display featured video (most recent request)
          const featuredSong = data[0];
          const featuredVideoId = extractYouTubeId(featuredSong.youtubeLink);
          
          if (featuredVideoId) {
            playlistHTML += `
            <p class="now-playing" id="now-playing">
                  Tocando agora: <strong>${featuredSong.songTitle}</strong>
                  
            </p>  
            <div class="featured-video">
                <iframe 
                  width="320"
                  height="240" 
                  src="https://www.youtube.com/embed/${featuredVideoId}" 
                  frameborder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowfullscreen>
                </iframe>
                
              </div>
            `;
          }
          
          // List all requested songs
          playlistHTML += '<ul class="song-list">';
          
          data.forEach((song, index) => {
            const videoId = extractYouTubeId(song.youtubeLink);
            
            playlistHTML += `
              <li class="song-item ${index === 0 ? 'active' : ''}" data-video-id="${videoId || ''}">
                <div class="song-info" >
                  ${videoId ? 
                  `<button class="play-button" data-video-id="${videoId}">
                    <span class="play-icon">▶</span>
                  </button>` 
                  : ''}
                  <p class="song-title" id="song-title">${song.songTitle}</p>
                </div>
                
              </li>
            `;
          });
          
          playlistHTML += '</ul>';
          playlistContainer.innerHTML = playlistHTML;
          
          // Add click handlers to play buttons
          document.querySelectorAll('.play-button').forEach(button => {
            button.addEventListener('click', function() {
              const videoId = this.getAttribute('data-video-id');
              if (videoId && document.querySelector('.featured-video iframe')) {
                document.querySelector('.featured-video iframe').src = 
                  `https://www.youtube.com/embed/${videoId}`;
                
                // Update now playing text
                const songItem = this.closest('.song-item');
                const title = songItem.querySelector('.song-title').textContent;
                const requester = songItem.querySelector('.song-requester').textContent;
                
                document.querySelector('.now-playing').innerHTML = 
                  `Tocando agora: <strong>${title}</strong>
                  <small>${requester}</small>`;
                
                // Update active class
                document.querySelectorAll('.song-item').forEach(item => {
                  item.classList.remove('active');
                });
                songItem.classList.add('active');
              }
            });
          });
        })
        .catch(error => {
          console.error('Erro ao carregar playlist:', error);
          playlistContainer.innerHTML = 
            '<p class="error">Perdão, tente novamente mais tarde.</p>';
        });
    }
  }
  
  // Marriage Advice Cards
function initAdviceCards() {
    const adviceForm = document.getElementById('adviceForm');
    
    if (!adviceForm) return;
    
    // Load existing advice when page loads
    loadAdvice();
    
    adviceForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(adviceForm);
      const adviceData = {
        guestName: 'Anônimo',
        yearsMarried: parseInt(formData.get('yearsMarried')) || 0,
        advice: formData.get('advice'),
        isAnonymous: true
      };
      
      // Show loading state
      document.getElementById('adviceSubmitBtn').textContent = 'Enviando...';
      document.getElementById('adviceSubmitBtn').disabled = true;
      
      fetch('/api/advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adviceData)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Reset button
        document.getElementById('adviceSubmitBtn').textContent = 'Enviar';
        document.getElementById('adviceSubmitBtn').disabled = false;
        
        // Show confirmation
        document.getElementById('adviceConfirmation').style.display = 'block';
        adviceForm.reset();
        
        // Hide confirmation after 3 seconds
        setTimeout(() => {
          document.getElementById('adviceConfirmation').style.display = 'none';
        }, 3000);
        
        // Refresh advice display
        loadAdvice();
      })
      .catch(error => {
        console.error('Error:', error);
        document.getElementById('adviceSubmitBtn').textContent = 'Enviar';
        document.getElementById('adviceSubmitBtn').disabled = false;
        alert('Houve um erro ao enviar seu conselho. Tente novamente.');
      });
    });
    
    // Function to load and display advice
    function loadAdvice() {
      const adviceContainer = document.getElementById('advice-container');
      if (!adviceContainer) return;
      
      // Show loading state
      adviceContainer.innerHTML = '<p class="loading">Carregando conselhos...</p>';
      
      fetch('/api/advice')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          if (data.length === 0) {
            adviceContainer.innerHTML = '<p>Nenhum conselho foi compartilhado ainda. Seja o primeiro!</p>';
            return;
          }
          
          let adviceHTML = '<p>Lista de conselhos já compartilhados:</p><div class="advice-cards">';
          
          data.forEach(advice => {
            adviceHTML += `
              <div class="advice-card">
                <div class="advice-content">
                  <p class="advice-text">"${advice.advice}"</p>
                  <p class="advice-author">
                    — ${advice.isAnonymous ? 'Anônimo' : advice.guestName}
                    ${advice.yearsMarried > 0 ? `(${advice.yearsMarried} anos de casado)` : ''}
                  </p>
                </div>
              </div>
            `;
          });
          
          adviceHTML += '</div>';
          adviceContainer.innerHTML = adviceHTML;
        })
        .catch(error => {
          console.error('Error loading advice:', error);
          adviceContainer.innerHTML = 
            '<p class="error">Não foi possível carregar os conselhos. Tente novamente mais tarde.</p>';
        });
    }
}
  
  // Helper function to extract YouTube video ID
  function extractYouTubeId(url) {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  }