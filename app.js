// Esperar a que el documento esté listo
$(document).ready(function() {
    // Funcionalidad de pestañas con animación slide
    $('.tab-button').click(function() {
        // Si ya está activo, no hacer nada
        if ($(this).hasClass('active')) return;
        
        // Quitar active de todos los botones
        $('.tab-button').removeClass('active');
        // Agregar active al botón clickeado
        $(this).addClass('active');
        
        // Obtener el objetivo de la pestaña
        const target = $(this).data('target');
        const currentActive = $('.tab-content.active');
        const newActive = $('#contenido-' + target);
        
        // Animación de salida (slide up)
        currentActive.removeClass('active');
        
        // Esperar a que termine la animación de salida
        setTimeout(() => {
            // Animación de entrada (slide down)
            newActive.addClass('active');
            
            // Si es la sección de animaciones, reproducir todos los videos
            if (target === 'animaciones') {
                playAllVideos();
            } else {
                // Si es otra sección, pausar todos los videos
                pauseAllVideos();
            }
        }, 300);
    });
    
    // Control de videos - Reproducir/pausar al hacer clic
    $(document).on('click', '.video-container', function() {
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
    });
    
    // Reproducir todos los videos
    function playAllVideos() {
        $('.video-container video').each(function() {
            this.play().catch(e => {
                console.log("Error al reproducir automáticamente:", e);
            });
            $(this).closest('.video-container').addClass('playing')
                .find('.video-overlay').fadeOut();
        });
    }
    
    // Pausar todos los videos
    function pauseAllVideos() {
        $('.video-container video').each(function() {
            this.pause();
            $(this).closest('.video-container').removeClass('playing')
                .find('.video-overlay').fadeIn();
        });
    }
     // Configurar la animación de hover para imágenes
     setupImageHover();
    
     // Re-configurar la animación cuando se cambia entre pestañas
     $('.tab-button').click(function() {
         // Pequeño retraso para asegurar que el DOM se haya actualizado
         setTimeout(setupImageHover, 50);
     });
    // Inicializar los videos si la sección de animaciones está activa al cargar
    if ($('#contenido-animaciones').hasClass('active')) {
        playAllVideos();
    }
    
});
function setupImageHover() {
    $('.image-container').hover(
        // Cuando el mouse entra
        function() {
            var $this = $(this);
            // Añadir clases para la animación y sombra
            $this.addClass('floating');
        },
        // Cuando el mouse sale
        function() {
            var $this = $(this);
            // Quitar clases de animación y sombra
            $this.removeClass('floating');
        }
    );
}