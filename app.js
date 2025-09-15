// Esperar a que el documento esté listo
$(document).ready(function() {
    // Variables globales
    let currentMediaType = '';
    
    // Funcionalidad de pestañas
    $('.tab-button').click(function() {
        if ($(this).hasClass('active')) return;
        
        $('.tab-button').removeClass('active');
        $(this).addClass('active');
        
        const target = $(this).data('target');
        const currentActive = $('.tab-content.active');
        const newActive = $('#contenido-' + target);
        
        currentActive.removeClass('active');
        
        setTimeout(() => {
            newActive.addClass('active');
            
            if (target === 'animaciones') {
                playAllVideos();
            } else {
                pauseAllVideos();
            }
        }, 300);
    });
    
    // Control de videos
    $(document).on('click', '.video-container', function(e) {
        // Solo manejar clics en el overlay, no en el video mismo
        if ($(e.target).hasClass('video-overlay') || e.target === this) {
            const video = $(this).find('video')[0];
            
            if (video.paused) {
                video.play();
                $(this).addClass('playing');
                $(this).find('.video-overlay').fadeOut();
            } else {
                video.pause();
                $(this).removeClass('playing');
                $(this).find('.video-overlay').fadeIn();
            }
        }
    });
    
    // Animación hover para imágenes
    setupImageHover();
    
    $('.tab-button').click(function() {
        setTimeout(setupImageHover, 50);
    });
    
    // Inicializar videos si la sección de animaciones está activa
    if ($('#contenido-animaciones').hasClass('active')) {
        playAllVideos();
    }
    
    // Eventos para abrir el carrusel modal
    $(document).on('click', '.image-container', function() {
        const index = $('.image-container').index(this);
        openCarouselModal('dibujos', index);
    });
    
    $(document).on('click', '.video-container', function(e) {
        // Solo abrir carrusel si se hace clic en el overlay
        if ($(e.target).hasClass('video-overlay') || e.target === this) {
            const index = $('.video-container').index(this);
            openCarouselModal('animaciones', index);
        }
    });
});

// Función para abrir el carrusel modal
function openCarouselModal(mediaType, index) {
    // Limpiar el carrusel
    $('#carousel-inner').empty();
    
    let mediaElements;
    if (mediaType === 'dibujos') {
        mediaElements = $('.image-container img');
        $('#modalTitle').text('Mis Dibujos');
    } else {
        mediaElements = $('.video-container');
        $('#modalTitle').text('Mis Animaciones');
    }
    
    // Crear elementos del carrusel
    mediaElements.each(function(i) {
        const isActive = i === index;
        let carouselItem;
        
        if (mediaType === 'dibujos') {
            carouselItem = `
                <div class="carousel-item ${isActive ? 'active' : ''}">
                    <div class="d-flex justify-content-center align-items-center" style="height: 70vh;">
                        <img src="${$(this).attr('src')}" class="d-block img-fluid h-100" alt="Dibujo ${i+1}" style="object-fit: contain;">
                    </div>
                </div>
            `;
        } else {
            const videoSource = $(this).find('source').attr('src');
            const poster = $(this).find('video').attr('poster');
            carouselItem = `
                <div class="carousel-item ${isActive ? 'active' : ''}">
                    <div class="d-flex justify-content-center align-items-center" style="height: 70vh;">
                        <video controls class="d-block h-100" style="object-fit: contain;" poster="${poster}">
                            <source src="${videoSource}" type="video/mp4">
                            Tu navegador no soporta el elemento de video.
                        </video>
                    </div>
                </div>
            `;
        }
        
        $('#carousel-inner').append(carouselItem);
    });
    
    // Mostrar el modal
    const modalElement = document.getElementById('mediaCarouselModal');
    const modal = new bootstrap.Modal(modalElement);
    
    // Limpiar event listeners previos
    $(modalElement).off('hidden.bs.modal shown.bs.modal');
    
    // Evento cuando el modal se cierra
    $(modalElement).on('hidden.bs.modal', function() {
        $('#carousel-inner video').each(function() {
            this.pause();
        });
        
        if ($('#contenido-animaciones').hasClass('active')) {
            setTimeout(playAllVideos, 100);
        }
    });
    
    // Evento cuando el modal se muestra
    $(modalElement).on('shown.bs.modal', function() {
        pauseAllVideos();
    });
    
    // Mostrar el modal
    modal.show();
}

// Funciones de utilidad
function playAllVideos() {
    $('.video-container video').each(function() {
        this.play().catch(e => console.log("Error al reproducir:", e));
        $(this).closest('.video-container').addClass('playing')
            .find('.video-overlay').fadeOut();
    });
}

function pauseAllVideos() {
    $('.video-container video').each(function() {
        this.pause();
        $(this).closest('.video-container').removeClass('playing')
            .find('.video-overlay').fadeIn();
    });
}

function setupImageHover() {
    $('.image-container').hover(
        function() {
            $(this).addClass('floating');
        },
        function() {
            $(this).removeClass('floating');
        }
    );
}