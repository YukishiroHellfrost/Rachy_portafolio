// Esperar a que el documento esté listo
$(document).ready(function() {
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
          playAllInlineGridVideos();
        } else {
          pauseAllInlineGridVideos();
        }
      }, 300);
    });
  
    // NOTA: Eliminamos el toggle play/pause por click en la grilla para no bloquear la apertura del modal.
  
    // Animación hover para imágenes
    setupImageHover();
    $('.tab-button').click(function() {
      setTimeout(setupImageHover, 50);
    });
  
    // Inicializar videos si la sección de animaciones está activa al cargar
    if ($('#contenido-animaciones').hasClass('active')) {
      playAllInlineGridVideos();
    }
  
    // Abrir carrusel al tocar cualquier parte de la tarjeta de IMAGEN
    $(document).on('click', '.image-container', function(e) {
      const index = $('.image-container').index(this);
      openCarouselModal('dibujos', index);
    });
  
    // Abrir carrusel al tocar cualquier parte de la tarjeta de VIDEO
    // Incluye: el contenedor, el video o el overlay
    $(document).on('click', '.video-container, .video-container *', function(e) {
      const $container = $(this).closest('.video-container');
      if ($container.length === 0) return;
  
      // Evitar que otros handlers interfieran
      e.preventDefault();
      e.stopPropagation();
  
      const index = $('.video-container').index($container);
      openCarouselModal('animaciones', index);
    });
  });
  
  // Función para abrir el carrusel modal
  function openCarouselModal(mediaType, index) {
    const $carouselInner = $('#carousel-inner');
    $carouselInner.empty();
  
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
        const src = $(this).attr('src');
        carouselItem = `
          <div class="carousel-item ${isActive ? 'active' : ''}">
            <div class="d-flex justify-content-center align-items-center" style="height: 70vh;">
              <img src="${src}" class="d-block img-fluid h-100" alt="Dibujo ${i + 1}" style="object-fit: contain;">
            </div>
          </div>
        `;
      } else {
        const $video = $(this).find('video');
        const videoSource = $video.find('source').attr('src');
        const poster = $video.attr('poster') || '';
  
        carouselItem = `
          <div class="carousel-item ${isActive ? 'active' : ''}">
            <div class="d-flex justify-content-center align-items-center" style="height: 70vh;">
              <video
                class="d-block h-100"
                style="object-fit: contain;"
                poster="${poster}"
               muted 
                playsinline
                preload="metadata"
                ${isActive ? 'autoplay' : ''}
                controls
              >
                <source src="${videoSource}" type="video/mp4">
                Tu navegador no soporta el elemento de video.
              </video>
            </div>
          </div>
        `;
      }
  
      $carouselInner.append(carouselItem);
    });
  
    // Mostrar el modal
    const modalElement = document.getElementById('mediaCarouselModal');
    const modal = new bootstrap.Modal(modalElement);
  
    // Limpiar event listeners previos
    $(modalElement).off('hidden.bs.modal shown.bs.modal');
    $('#mediaCarousel').off('slid.bs.carousel slide.bs.carousel');
  
    // Al mostrar el modal: pausar grilla y reproducir el video activo del carrusel
    $(modalElement).on('shown.bs.modal', function() {
      pauseAllInlineGridVideos();
      playActiveCarouselVideo();
    });
  
    // Al cerrar el modal: pausar todos los videos del carrusel y reanudar grilla si corresponde
    $(modalElement).on('hidden.bs.modal', function() {
      $('#carousel-inner video').each(function() {
        safePause(this);
      });
      if ($('#contenido-animaciones').hasClass('active')) {
        setTimeout(playAllInlineGridVideos, 100);
      }
    });
  
    // Pausar el slide que sale y reproducir el que entra
    $('#mediaCarousel').on('slide.bs.carousel', function(e) {
      const $items = $('#carousel-inner .carousel-item');
      const $current = $items.eq(e.from);
      const currentVideo = $current.find('video').get(0);
      if (currentVideo) safePause(currentVideo);
    });
  
    $('#mediaCarousel').on('slid.bs.carousel', function() {
      playActiveCarouselVideo();
    });
  
    // Click en el video del carrusel para Play/Pause manual
    $(document).off('click.carouselVideo').on('click.carouselVideo', '#carousel-inner video', function(e) {
      // No cerrar ni interferir con el gesto
      e.stopPropagation();
      if (this.paused) {
        this.play().catch(() => {});
      } else {
        this.pause();
      }
    });
  
    modal.show();
  }
  
  /* Utilidades */
  
  // Reproduce todos los videos de la grilla (sección Animaciones) silenciados
  function playAllInlineGridVideos() {
    $('.video-container video').each(function() {
      this.muted = true;
      this.playsInline = true;
      this.play().then(() => {
        $(this).closest('.video-container').addClass('playing')
          .find('.video-overlay').fadeOut();
      }).catch(() => {
        $(this).closest('.video-container').removeClass('playing')
          .find('.video-overlay').fadeIn();
      });
    });
  }
  
  // Pausa todos los videos de la grilla
  function pauseAllInlineGridVideos() {
    $('.video-container video').each(function() {
      safePause(this);
      $(this).closest('.video-container').removeClass('playing')
        .find('.video-overlay').fadeIn();
    });
  }
  
  // Reproduce el video del item activo del carrusel (si existe)
  function playActiveCarouselVideo() {
    const $activeItem = $('#carousel-inner .carousel-item.active');
    const video = $activeItem.find('video').get(0);
    if (!video) return;
  
    video.muted = false;
    video.playsInline = true;
  
    // En Safari/iOS, a veces ayuda recargar el buffer visible
    try { video.load(); } catch (_) {}
  
    video.play().catch(() => {
      // Si falla el autoplay, el usuario puede dar play manualmente (controles visibles)
    });
  }
  
  // Pausa segura (sin errores si ya está pausado)
  function safePause(videoEl) {
    try { videoEl.pause(); } catch (_) {}
  }
  
  // Hover imágenes
  function setupImageHover() {
    $('.image-container').hover(
      function() { $(this).addClass('floating'); },
      function() { $(this).removeClass('floating'); }
    );
  }

function toggleContactArrow() {
  const $icon = $('#contacto .contenedor i');

  if ($(window).width() <= 767) {
    // en móvil: flecha hacia abajo
    if ($icon.hasClass('bi-arrow-right-circle-fill')) {
      $icon
        .removeClass('bi-arrow-right-circle-fill')
        .addClass('bi-arrow-down-circle-fill');
    }
  } else {
    // en escritorio: flecha hacia la derecha
    if ($icon.hasClass('bi-arrow-down-circle-fill')) {
      $icon
        .removeClass('bi-arrow-down-circle-fill')
        .addClass('bi-arrow-right-circle-fill');
    }
  }
}

// Ejecutar al cargar y al redimensionar
$(document).ready(toggleContactArrow);
$(window).on('resize', toggleContactArrow);

 // ====== Cambio de idioma completo ======

const texts = {
  es: {
    // Navegación
    proyectos: 'Proyectos',
    sobre: 'Sobre mí',
    contacto: 'Contacto',
    
    // Hero section
    heroTitle: 'Hola, soy Rachelys Hung!',
    heroSubtitle: 'Soy una artista con experiencia en dibujo y animación',
    
    // Filtros de proyectos
    dibujos: 'Dibujos',
    animaciones: 'Animaciones',
    
    // Títulos de secciones
    misDibujos: 'Mis Dibujos',
    misAnimaciones: 'Mis Animaciones',
    
    // Sobre mí
    sobreMiTitulo: 'Sobre Mí',
    sobreMiParrafo: 'Hola! soy Rachelys "Rachy" Hung, soy una artista visual especializada en <strong>dibujo y animación</strong>. Con <strong>experiencia</strong> colaborando con <strong>Kripta</strong>, fusiona influencias urbanas y mundos imaginarios en obras que destacan por su creatividad y técnica refinada. Apasionada por explorar nuevos lenguajes visuales, busca siempre innovar y emocionar.',
    
    // Contacto
    contactoTitulo: 'Contacto',
    contactoTexto: 'Desarrollemos un proyecto juntos! Contáctame ya!',
    
    // Footer
    derechos: 'Creado por Rafael Couso &#169; (2025)',
    
    // Títulos de animaciones
    animacion1: 'Animación 1',
    animacion2: 'Animación 2',
    animacion3: 'Animación 3',
    animacion4: 'Animación 4',
    animacion5: 'Animación 5',
    animacion6: 'Animación 6',
    
    // Title tag
    pageTitle: 'Rachelys Hung | Diseñadora de imágenes y animación'
  },
  en: {
    // Navegación
    proyectos: 'Projects',
    sobre: 'About me',
    contacto: 'Contact',
    
    // Hero section
    heroTitle: 'Hi, I\'m Rachelys Hung!',
    heroSubtitle: 'I\'m an artist with experience in drawing and animation',
    
    // Filtros de proyectos
    dibujos: 'Drawings',
    animaciones: 'Animations',
    
    // Títulos de secciones
    misDibujos: 'My Drawings',
    misAnimaciones: 'My Animations',
    
    // Sobre mí
    sobreMiTitulo: 'About Me',
    sobreMiParrafo: 'Hello! I\'m Rachelys "Rachy" Hung, I\'m a visual artist specialized in <strong>drawing and animation</strong>. With <strong>experience</strong> collaborating with <strong>Kripta</strong>, I merge urban influences and imaginary worlds in works that stand out for their creativity and refined technique. Passionate about exploring new visual languages, I always seek to innovate and excite.',
    
    // Contacto
    contactoTitulo: 'Contact',
    contactoTexto: 'Let\'s develop a project together! Contact me now!',
    
    // Footer
    derechos: 'Created by Rafael Couso &#169; (2025)',
    
    // Títulos de animaciones
    animacion1: 'Animation 1',
    animacion2: 'Animation 2',
    animacion3: 'Animation 3',
    animacion4: 'Animation 4',
    animacion5: 'Animation 5',
    animacion6: 'Animation 6',
    
    // Title tag
    pageTitle: 'Rachelys Hung | Image and animation designer'
  }
};

// Al cargar, aplicamos el idioma guardado o por defecto 'es'
$(document).ready(() => {
  const lang = localStorage.getItem('lang') || 'es';
  applyLang(lang);
});

// Handler del dropdown
$(document).on('click', '.lang-select', function(e) {
  e.preventDefault();
  const lang = $(this).data('lang');
  localStorage.setItem('lang', lang);
  applyLang(lang);
});

function applyLang(lang) {
  const t = texts[lang];
  
  // Actualizar etiqueta corriente
  $('#current-lang').text(lang.toUpperCase());
  
  // Sustituir textos en el DOM
  
  // Navegación
  $('a.nav-link[href="#proyectos"]').text(t.proyectos);
  $('a.nav-link[href="#sobre-mi"]').text(t.sobre);
  $('a.nav-link[href="#contacto"]').text(t.contacto);
  
  // Hero section
  $('.seccion-hero .titulo-seccion').text(t.heroTitle);
  $('.seccion-hero h2').text(t.heroSubtitle);
  
  // Filtros de proyectos
  $('.tab-button[data-target="dibujos"]').text(t.dibujos);
  $('.tab-button[data-target="animaciones"]').text(t.animaciones);
  
  // Títulos de secciones
  $('.contenedor-dibujos h1').text(t.misDibujos);
  $('.contenedor-animaciones h1').text(t.misAnimaciones);
  
  // Sobre mí
  $('#sobre-mi .titulo-seccion').text(t.sobreMiTitulo);
  $('#sobre-mi p').html(t.sobreMiParrafo);
  
  // Contacto
  $('#contacto p').text(t.contactoTexto);
  
  // Footer
  $('#footer .derechos-de-autor').html(t.derechos);
  
  // Títulos de animaciones
  $('.contenedor-animaciones .row:eq(0) h3:eq(0)').text(t.animacion1);
  $('.contenedor-animaciones .row:eq(0) h3:eq(1)').text(t.animacion2);
  $('.contenedor-animaciones .row:eq(0) h3:eq(2)').text(t.animacion3);
  $('.contenedor-animaciones .row:eq(1) h3:eq(0)').text(t.animacion4);
  $('.contenedor-animaciones .row:eq(1) h3:eq(1)').text(t.animacion5);
  $('.contenedor-animaciones .row:eq(1) h3:eq(2)').text(t.animacion6);
  
  // Title tag
  document.title = t.pageTitle;
  
  // Actualizar atributos lang y dir
  $('html').attr('lang', lang);
  $('html').attr('dir', lang === 'ar' ? 'rtl' : 'ltr');
}