document.addEventListener('DOMContentLoaded', function() {
    // Inicializar elementos interactivos
    initToggleSwitches();
    initLikeButtons();
    initReasonInputs();
    updateProgress();
    
    // Mostrar resumen al pasar el ratón sobre el botón de enviar
    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.addEventListener('mouseenter', showSummary);
    submitBtn.addEventListener('mouseleave', hideSummary);
});

function initToggleSwitches() {
    const toggles = document.querySelectorAll('.toggle-input');
    
    toggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const row = this.closest('tr');
            const reasonInput = row.querySelector('.reason-input');
            const charCount = row.querySelector('.character-count');
            
            if (!this.checked) {
                reasonInput.style.display = 'block';
                reasonInput.required = true;
                charCount.style.display = 'block';
                setTimeout(() => {
                    reasonInput.focus();
                }, 100);
            } else {
                reasonInput.style.display = 'none';
                reasonInput.required = false;
                reasonInput.value = '';
                charCount.style.display = 'none';
                charCount.querySelector('span').textContent = '0';
            }
            
            updateProgress();
            updateSummary();
        });
    });
}

function initLikeButtons() {
    const likeButtons = document.querySelectorAll('.like-btn');
    
    likeButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('liked');
            this.querySelector('i').classList.toggle('far');
            this.querySelector('i').classList.toggle('fas');
            
            // Efecto de corazón que salta
            this.style.transform = 'scale(1.3)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 300);
            
            updateSummary();
        });
    });
}

function initReasonInputs() {
    const reasonInputs = document.querySelectorAll('.reason-input');
    
    reasonInputs.forEach(input => {
        const charCount = input.nextElementSibling.querySelector('span');
        const maxLength = 100;
        
        input.addEventListener('input', function() {
            const remaining = maxLength - this.value.length;
            charCount.textContent = this.value.length;
            
            if (remaining < 20) {
                charCount.style.color = '#FF6B6B';
            } else {
                charCount.style.color = '#D87093';
            }
            
            if (this.value.length > maxLength) {
                this.value = this.value.substring(0, maxLength);
                charCount.textContent = maxLength;
                
                // Efecto de vibración cuando se excede el límite
                this.style.animation = 'shake 0.5s';
                setTimeout(() => {
                    this.style.animation = '';
                }, 500);
            }
            
            updateSummary();
        });
    });
}

function updateProgress() {
    const totalQuestions = document.querySelectorAll('tr').length - 1; // Restar 1 por el encabezado
    const answeredQuestions = document.querySelectorAll('.toggle-input:checked').length;
    const progress = (answeredQuestions / totalQuestions) * 100;
    
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${Math.round(progress)}% Aceptados`;
    
    // Cambiar color según el progreso
    if (progress < 30) {
        progressBar.style.background = 'linear-gradient(90deg, #FFB6C1, #FF6B6B)';
    } else if (progress < 70) {
        progressBar.style.background = 'linear-gradient(90deg, #FFB6C1, #FF8E8E)';
    } else {
        progressBar.style.background = 'linear-gradient(90deg, #FFB6C1, #D87093)';
    }
}

function showSummary() {
    const summaryCard = document.getElementById('summaryCard');
    summaryCard.style.display = 'block';
    updateSummary();
}

function hideSummary() {
    const summaryCard = document.getElementById('summaryCard');
    summaryCard.style.display = 'none';
}

function updateSummary() {
    const summaryList = document.getElementById('selectedGifts');
    summaryList.innerHTML = '';
    
    const rows = document.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const giftName = row.querySelector('.gift-item span').textContent;
        const isSelected = row.querySelector('.toggle-input').checked;
        const isLiked = row.querySelector('.like-btn').classList.contains('liked');
        const reason = row.querySelector('.reason-input').value;
        
        if (isSelected || !isSelected && reason) {
            const listItem = document.createElement('li');
            
            const giftNameSpan = document.createElement('span');
            giftNameSpan.textContent = giftName;
            if (isLiked) giftNameSpan.innerHTML += ' <i class="fas fa-heart" style="color: #D87093;"></i>';
            
            const statusSpan = document.createElement('span');
            if (isSelected) {
                statusSpan.textContent = '✅';
                statusSpan.style.color = '#4CAF50';
            } else {
                statusSpan.textContent = '❌';
                statusSpan.style.color = '#FF6B6B';
                
                if (reason) {
                    const reasonTooltip = document.createElement('span');
                    reasonTooltip.className = 'tooltip';
                    reasonTooltip.textContent = 'ℹ️';
                    reasonTooltip.title = reason;
                    statusSpan.appendChild(document.createTextNode(' '));
                    statusSpan.appendChild(reasonTooltip);
                }
            }
            
            listItem.appendChild(giftNameSpan);
            listItem.appendChild(statusSpan);
            summaryList.appendChild(listItem);
        }
    });
}

document.getElementById('mainSubmitBtn').addEventListener('click', function() {
    try {
        const regalos = [];
        
        // Recopilar datos de la tabla
        document.querySelectorAll('#giftSurvey tbody tr').forEach(row => {
            const nombre = row.querySelector('.gift-item span').textContent.trim();
            const gusta = row.querySelector('.toggle-input').checked;
            const comentario = row.querySelector('.reason-input').value;
            const me_gusta = row.querySelector('.like-btn i').classList.contains('fas');
            
            regalos.push({
                nombre: nombre,
                gusta: gusta,
                comentario: comentario,
                me_gusta: me_gusta
            });
        });
        
        // Crear contenido del archivo JS
        const contenidoJS = `// Resultados de la encuesta de regalos\nconst resultadosEncuesta = ${JSON.stringify(regalos, null, 2)};\n\n// Fecha de generación: ${new Date().toLocaleString()}`;
        
        // Crear blob con el contenido
        const blob = new Blob([contenidoJS], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        
        // Crear enlace de descarga
        const a = document.createElement('a');
        a.href = url;
        a.download = `resultados_encuesta_${new Date().toISOString().split('T')[0]}.js`;
        
        // Simular click para descargar
        document.body.appendChild(a);
        a.click();
        
        // Limpiar
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
        
        // Mostrar mensaje de éxito
        alert('Archivo con los resultados descargado correctamente');
        createConfetti();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al generar el archivo: ' + error.message);
    }
});

function showConfetti() {
    // Tu implementación de confeti
}
function createConfetti() {
    const colors = ['#FFB6C1', '#D87093', '#FF69B4', '#FFC0CB', '#FFD1DC', '#FFDFE3'];
    const confettiContainer = document.getElementById('confetti');
    confettiContainer.innerHTML = '';
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = Math.random() * 10 + 5 + 'px';
        confetti.style.height = Math.random() * 10 + 5 + 'px';
        confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confettiContainer.appendChild(confetti);
    }
    
    setTimeout(() => {
        confettiContainer.innerHTML = '';
    }, 5000);
}

// SweetAlert (añadir esto antes del cierre del body si no lo tienes)
document.write('<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>');