// Albums structure - organized for future expansion
const albums = {
    'chingon': {
        name: 'Chingon',
        songs: [
            'chingon-full-album/los policías (Remastered).wav',
            'chingon-full-album/FAST! (Remastered).wav',
            'chingon-full-album/Berlín (Remastered).wav',
            'chingon-full-album/Brisa (Remastered).wav',
            'chingon-full-album/CHILL (Remastered).wav',
            'chingon-full-album/Chingón (Remastered).wav',
            'chingon-full-album/Corrido para cantar (Remastered).wav',
            'chingon-full-album/De nuevo tropiezo (Remastered).wav',
            'chingon-full-album/Desaparecer (Remastered).wav',
            'chingon-full-album/Destruir el Sistema (Remastered).wav',
            'chingon-full-album/El León (Remastered).wav',
            'chingon-full-album/En el rancho (Remastered).wav',
            'chingon-full-album/Estambul Turquía (Remastered).wav',
            'chingon-full-album/Halloween (Remastered).wav',
            'chingon-full-album/Harmonizing at the Campfire (Remastered).wav',
            'chingon-full-album/India (Remastered).wav',
            'chingon-full-album/Invierno (Remastered).wav',
            'chingon-full-album/Lluvia (Remastered).wav',
            'chingon-full-album/Look at Me Now (Remastered).wav',
            'chingon-full-album/Loving You Is Easy (Remastered).wav',
            'chingon-full-album/Me ahogo en alcohol (Remastered).wav',
            'chingon-full-album/Mi religión (Remastered).wav',
            'chingon-full-album/Nunca Olvidaré Aquella Noche (Remastered).wav',
            'chingon-full-album/Nunca vuelvo a California (Remastered).wav',
            'chingon-full-album/Odio cuando no estás aquí (Remastered).wav',
            'chingon-full-album/Paysundú (Remastered).wav',
            'chingon-full-album/Pecadores (Remastered).wav',
            'chingon-full-album/Si el cielo cae (Remastered).wav',
            'chingon-full-album/Siempre traigo cruz (Remastered).wav',
            'chingon-full-album/Soy Quien Soy (Remastered).wav',
            'chingon-full-album/Te Dejo Mi Amor (Remastered).wav',
            'chingon-full-album/Un Beso Más Antes de Irme (Remastered).wav',
            'chingon-full-album/Trust (Remastered).wav'
        ]
    }
};

// Get flat list of all music files for backward compatibility
const musicFiles = albums.chingon.songs;

// Get current album (default to chingon)
let currentAlbum = 'chingon';

// Get song name from file path
function getSongName(filePath) {
    const parts = filePath.split('/');
    const fileName = parts[parts.length - 1];
    return fileName.replace(' (Remastered).wav', '').replace('.wav', '');
}

// Get lyrics file path for a song
function getLyricsPath(filePath) {
    const songName = getSongName(filePath);
    return `chingon-full-album/lyrics/${songName} (Remastered).txt`;
}

// Audio player setup
const audioPlayer = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('play-pause-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const volumeBar = document.getElementById('volume-bar');
const currentTrack = document.getElementById('current-track');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const playlistEl = document.getElementById('playlist');
const animationContainer = document.getElementById('animation-container');
const shareBtn = document.getElementById('share-btn');
const shareNotification = document.getElementById('share-notification');
const downloadSingleBtn = document.getElementById('download-single-btn');
const downloadFullBtn = document.getElementById('download-full-btn');
const emailSignupForm = document.getElementById('email-signup-form');
const emailInput = document.getElementById('email-input');
const emailNotification = document.getElementById('email-notification');
const donateBtn = document.getElementById('donate-btn');
const paymentIssueForm = document.getElementById('payment-issue-form');
const paymentIssueEmail = document.getElementById('payment-issue-email');
const paymentIssueNotification = document.getElementById('payment-issue-notification');
const visualizerSection = document.querySelector('.visualizer-section');
const visualizerOverlay = document.getElementById('visualizer-overlay');
const visualizerTrackName = document.getElementById('visualizer-track-name');
const visualizerCurrentTime = document.getElementById('visualizer-current-time');
const visualizerTotalTime = document.getElementById('visualizer-total-time');
const visualizerPrevBtn = document.getElementById('visualizer-prev-btn');
const visualizerPlayPauseBtn = document.getElementById('visualizer-play-pause-btn');
const visualizerNextBtn = document.getElementById('visualizer-next-btn');
const visualizerLyricsBtn = document.getElementById('visualizer-lyrics-btn');
const exitFullscreenBtn = document.getElementById('exit-fullscreen-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const lyricsBtn = document.getElementById('lyrics-btn');
const lyricsModal = document.getElementById('lyrics-modal');
const lyricsCloseBtn = document.getElementById('lyrics-close-btn');
const lyricsContent = document.getElementById('lyrics-content');
const lyricsTitle = document.getElementById('lyrics-title');

let currentTrackIndex = 0;
let stripe = null;
let stripePublishableKey = null;
let isPlaying = false;
let isFullscreen = false;
let currentLyrics = null;

// Audio visualizer removed - using static CSS animations only

// Initialize playlist - defined later with share functionality

function updatePlaylistUI() {
    const items = playlistEl.querySelectorAll('.playlist-item');
    items.forEach((item, index) => {
        if (index === currentTrackIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Get song URL-friendly name
function getSongSlug(filePath) {
    const songName = getSongName(filePath);
    return songName.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Get song index from slug
function getSongIndexFromSlug(slug) {
    return musicFiles.findIndex(file => getSongSlug(file) === slug);
}

// Update URL hash for sharing
function updateURLHash(index) {
    const songName = getSongName(musicFiles[index]);
    const slug = getSongSlug(musicFiles[index]);
    const newHash = `#song-${index}-${slug}`;
    
    // Update URL without triggering page reload
    if (window.location.hash !== newHash) {
        window.history.replaceState(null, '', newHash);
    }
}

// Get shareable link
function getShareableLink(index) {
    const baseUrl = window.location.origin + window.location.pathname;
    const slug = getSongSlug(musicFiles[index]);
    return `${baseUrl}#song-${index}-${slug}`;
}

// Audio visualizer removed - using static CSS animations only

// Store original element data to preserve animations
let elementData = new WeakMap();

// Store last container dimensions to avoid unnecessary updates
let lastContainerWidth = 0;
let lastContainerHeight = 0;

// Helper function to ensure SVG sizing (only called when needed)
function ensureSVGSize(svg) {
    if (!svg || !svg.parentNode) return;
    
    const containerRect = animationContainer.getBoundingClientRect();
    const containerWidth = containerRect.width || animationContainer.clientWidth;
    const containerHeight = containerRect.height || animationContainer.clientHeight;
    
    // Only update if dimensions actually changed
    if (containerWidth > 0 && containerHeight > 0 && 
        (containerWidth !== lastContainerWidth || containerHeight !== lastContainerHeight)) {
        svg.setAttribute('width', containerWidth);
        svg.setAttribute('height', containerHeight);
        svg.style.width = `${containerWidth}px`;
        svg.style.height = `${containerHeight}px`;
        
        lastContainerWidth = containerWidth;
        lastContainerHeight = containerHeight;
    }
    
    // Only set essential visibility props (not every frame)
    if (svg.style.display !== 'block') {
        svg.style.display = 'block';
    }
    if (svg.style.opacity !== '1') {
        svg.style.opacity = '1';
    }
}

// Audio-reactive SVG animations removed - using static CSS animations only
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Load lyrics for a song
async function loadLyrics(songIndex) {
    if (songIndex < 0 || songIndex >= musicFiles.length) return null;
    
    const track = musicFiles[songIndex];
    const lyricsPath = getLyricsPath(track);
    
    try {
        const response = await fetch(lyricsPath);
        if (response.ok) {
            const text = await response.text();
            return text.trim() || null;
        }
    } catch (error) {
        console.error('Error loading lyrics:', error);
    }
    return null;
}

// Display lyrics modal
async function showLyrics() {
    // Show loading state
    lyricsContent.innerHTML = '<div class="lyrics-loading">Loading lyrics...</div>';
    lyricsModal.classList.add('show');
    
    // Mobile-specific: Lock body scroll and viewport
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        // Prevent body scroll completely on mobile
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.body.style.top = '0';
        document.body.style.left = '0';
        // Prevent iOS bounce scroll
        document.body.style.touchAction = 'none';
    } else {
        document.body.style.overflow = 'hidden';
    }
    
    // Force modal to be completely static - no animations or movement
    // Apply styles directly to override any CSS
    lyricsModal.style.animation = 'none';
    lyricsModal.style.transition = 'opacity 0.15s linear';
    lyricsModal.style.transform = 'none';
    lyricsModal.style.translate = 'none';
    lyricsModal.style.backdropFilter = 'none';
    lyricsModal.style.webkitBackdropFilter = 'none';
    
    // Mobile-specific fixes to prevent viewport movement (isMobile already declared above)
    if (isMobile) {
        // Remove flex centering which can cause movement on mobile
        lyricsModal.style.display = 'block';
        lyricsModal.style.alignItems = 'stretch';
        lyricsModal.style.justifyContent = 'flex-start';
        // Lock modal position completely on mobile
        lyricsModal.style.position = 'fixed';
        lyricsModal.style.top = '0';
        lyricsModal.style.left = '0';
        lyricsModal.style.right = '0';
        lyricsModal.style.bottom = '0';
        lyricsModal.style.width = '100%';
        lyricsModal.style.height = '100%';
        lyricsModal.style.padding = '0';
        lyricsModal.style.margin = '0';
        lyricsModal.style.touchAction = 'none';
        // Prevent scroll from affecting position
        lyricsModal.style.overscrollBehavior = 'none';
    }
    
    const modalContent = lyricsModal.querySelector('.lyrics-modal-content');
    if (modalContent) {
        modalContent.style.animation = 'none';
        modalContent.style.transition = 'none';
        modalContent.style.transform = 'none';
        modalContent.style.translate = 'none';
        modalContent.style.willChange = 'auto';
        
        if (isMobile) {
            // Lock content position on mobile - fixed position, no transforms
            modalContent.style.position = 'fixed';
            modalContent.style.top = '0';
            modalContent.style.left = '0';
            modalContent.style.right = '0';
            modalContent.style.bottom = '0';
            modalContent.style.margin = '0';
            modalContent.style.padding = '0';
            modalContent.style.maxHeight = '100%';
            modalContent.style.height = '100%';
            modalContent.style.width = '100%';
            modalContent.style.borderRadius = '0';
            // Absolutely no transforms on mobile
            modalContent.style.transform = 'none';
            modalContent.style.translate = 'none';
        } else {
            modalContent.style.top = 'auto';
            modalContent.style.left = 'auto';
            modalContent.style.right = 'auto';
            modalContent.style.bottom = 'auto';
        }
    }
    
    const modalBody = lyricsModal.querySelector('.lyrics-modal-body');
    if (modalBody) {
        modalBody.style.animation = 'none';
        modalBody.style.transition = 'none';
        modalBody.style.transform = 'none';
        modalBody.style.translate = 'none';
        modalBody.style.top = '0';
        modalBody.style.left = '0';
        if (isMobile) {
            modalBody.style.overscrollBehavior = 'contain';
            modalBody.style.position = 'relative';
        }
    }
    
    const lyricsContentEl = lyricsModal.querySelector('.lyrics-content');
    if (lyricsContentEl) {
        lyricsContentEl.style.animation = 'none';
        lyricsContentEl.style.transition = 'none';
        lyricsContentEl.style.transform = 'none';
        lyricsContentEl.style.translate = 'none';
    }
    
    // Force a reflow on mobile to ensure styles are applied
    if (isMobile) {
        void lyricsModal.offsetHeight;
        if (modalContent) void modalContent.offsetHeight;
    }
    
    // Prevent viewport resize from moving modal on mobile
    if (isMobile) {
        const preventViewportMovement = () => {
            if (lyricsModal.classList.contains('show')) {
                lyricsModal.style.top = '0';
                lyricsModal.style.left = '0';
                if (modalContent) {
                    modalContent.style.top = '0';
                    modalContent.style.left = '0';
                }
            }
        };
        
        // Throttle viewport resize handler
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(preventViewportMovement, 50);
        }, { passive: true });
        
        // Prevent scroll from moving modal
        window.addEventListener('scroll', (e) => {
            if (lyricsModal.classList.contains('show')) {
                window.scrollTo(0, 0);
            }
        }, { passive: false });
    }
    
    try {
        const lyrics = await loadLyrics(currentTrackIndex);
        const songName = getSongName(musicFiles[currentTrackIndex]);
        
        lyricsTitle.textContent = songName;
        
        if (lyrics) {
            // Format lyrics with line breaks - use textContent for security and performance
            const container = document.createElement('div');
            
            lyrics.split('\n').forEach(line => {
                const div = document.createElement('div');
                // Style section headers (lines starting with [)
                if (line.trim().startsWith('[') && line.trim().endsWith(']')) {
                    div.className = 'lyrics-section';
                    div.textContent = line;
                } else if (line.trim() === '') {
                    // Empty lines for spacing
                    div.className = 'lyrics-line-empty';
                } else {
                    div.className = 'lyrics-line';
                    div.textContent = line;
                }
                container.appendChild(div);
            });
            
            lyricsContent.innerHTML = '';
            lyricsContent.appendChild(container);
            currentLyrics = lyrics;
            
            // Scroll to top when lyrics load (one-time, instant, no animations)
            requestAnimationFrame(() => {
                const modalBody = lyricsModal.querySelector('.lyrics-modal-body');
                if (modalBody) {
                    // Temporarily disable smooth scrolling for instant scroll
                    const originalBehavior = modalBody.style.scrollBehavior;
                    modalBody.style.scrollBehavior = 'auto';
                    modalBody.scrollTop = 0;
                    // Restore smooth scrolling for user interaction
                    setTimeout(() => {
                        modalBody.style.scrollBehavior = originalBehavior || '';
                    }, 0);
                }
            });
        } else {
            lyricsContent.innerHTML = '<div class="lyrics-not-found">Lyrics not available for this song.</div>';
            currentLyrics = null;
        }
    } catch (error) {
        console.error('Error showing lyrics:', error);
        lyricsContent.innerHTML = '<div class="lyrics-not-found">Error loading lyrics. Please try again.</div>';
        currentLyrics = null;
    }
}

// Hide lyrics modal
function hideLyrics() {
    lyricsModal.classList.remove('show');
    
    // Restore body styles (especially important on mobile)
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.touchAction = '';
    } else {
        document.body.style.overflow = '';
    }
}

// Escape HTML to prevent XSS (keeping for backward compatibility, but using textContent in showLyrics for better performance)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load track
function loadTrack(index) {
    if (index < 0 || index >= musicFiles.length) return;
    
    currentTrackIndex = index;
    const track = musicFiles[index];
    audioPlayer.src = track;
    currentTrack.textContent = getSongName(track);
    
    // Clear lyrics when track changes
    currentLyrics = null;
    
    // Update URL for sharing
    updateURLHash(index);
    
    // Initialize audio visualizer when track loads
    audioPlayer.addEventListener('loadedmetadata', () => {
        totalTimeEl.textContent = formatTime(audioPlayer.duration);
        if (isFullscreen) {
            updateVisualizerInfo();
        }
        
        // Audio visualizer removed - using static animations only
    }, { once: true });
    
    updatePlaylistUI();
    
    // Create animation and ensure it's visible
    createAnimation(index);
    
    // Ensure SVG is visible after creation
    requestAnimationFrame(() => {
        const svg = animationContainer.querySelector('.virtual-world-svg');
        if (svg) {
            ensureSVGSize(svg);
        }
    });
    
    // Update visualizer if in fullscreen
    if (isFullscreen) {
        updateVisualizerInfo();
    }
    
    if (isPlaying) {
        audioPlayer.play();
    }
}

// Load track from URL hash on page load
function loadTrackFromHash() {
    const hash = window.location.hash;
    if (!hash) return;
    
    // Parse hash: #song-0-slug or #song-1-slug
    const match = hash.match(/^#song-(\d+)-(.+)$/);
    if (match) {
        const index = parseInt(match[1], 10);
        if (index >= 0 && index < musicFiles.length) {
            loadTrack(index);
            // Scroll to track info
            setTimeout(() => {
                document.querySelector('.track-info').scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
            return true;
        }
    }
    return false;
}

// Format time
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Play/Pause
playPauseBtn.addEventListener('click', async () => {
    if (isPlaying) {
        audioPlayer.pause();
        playPauseBtn.textContent = '▶';
        visualizerPlayPauseBtn.textContent = '▶';
        isPlaying = false;
        stopCameraAnimation();
    } else {
        try {
            // Ensure animation exists and is visible before playing
            const svg = animationContainer.querySelector('svg');
            if (!svg) {
                // Create animation if it doesn't exist
                createAnimation(currentTrackIndex);
            }
            
            // Ensure SVG is visible and sized
            requestAnimationFrame(() => {
                const svg = animationContainer.querySelector('.virtual-world-svg');
                if (svg) {
                    ensureSVGSize(svg);
                }
            });
            
            // Play audio
            await audioPlayer.play();
            playPauseBtn.textContent = '⏸';
            visualizerPlayPauseBtn.textContent = '⏸';
            isPlaying = true;
            startCameraAnimation();
        } catch (error) {
            console.error('Error playing audio:', error);
            // If autoplay blocked, try to play again
            if (error.name === 'NotAllowedError') {
                // User interaction should allow play
                audioPlayer.play().catch(e => console.error('Still blocked:', e));
            }
        }
    }
});

// Previous/Next
prevBtn.addEventListener('click', () => {
    currentTrackIndex = (currentTrackIndex - 1 + musicFiles.length) % musicFiles.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) {
        audioPlayer.play();
    }
});

nextBtn.addEventListener('click', () => {
    currentTrackIndex = (currentTrackIndex + 1) % musicFiles.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) {
        audioPlayer.play();
    }
});

// Progress bar
progressBar.addEventListener('input', (e) => {
    const time = (e.target.value / 100) * audioPlayer.duration;
    audioPlayer.currentTime = time;
});

// Volume bar
volumeBar.addEventListener('input', (e) => {
    audioPlayer.volume = e.target.value / 100;
});

// Update progress
audioPlayer.addEventListener('timeupdate', () => {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.value = progress || 0;
    currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
});

// Auto-play next track
audioPlayer.addEventListener('ended', () => {
    nextBtn.click();
});

// Color helper for orange/yellow theme
function getThemeColor(index, baseHue = 35) {
    // Base hue is 35 (orange), create variations between 15-55 (yellow-orange range)
    const hue = (baseHue + (index % 40)) % 60 + 15; // 15-55 range
    const saturation = 80 + (index % 20); // 80-100%
    const lightness = 50 + (index % 30); // 50-80%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function getThemeColorRandom() {
    const hue = Math.random() * 40 + 15; // 15-55 range
    const saturation = 75 + Math.random() * 25; // 75-100%
    const lightness = 50 + Math.random() * 30; // 50-80%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Animation system
const animationFunctions = [
    createWavePattern,
    createParticleSystem,
    createGeometricShapes,
    createCircularWaves,
    createFlowingLines,
    createHexagonPattern,
    createSpiralPattern,
    createDiamondGrid,
    createStarField,
    createRippleEffect,
    createFloatingCircles,
    createMeshGradient,
    createTreePattern,
    createLightning,
    createAurora,
    createBubbles,
    createFireworks,
    createKaleidoscope,
    createSoundWaves,
    createFractalTree,
    createMandelbrot,
    createLiquid,
    createSolarSystem,
    createMetaballs,
    createNoiseField,
    createVectorField,
    createTunnel,
    createNebula,
    createCircuitBoard,
    createOrbs,
    createEnergyWaves
];

let cameraAnimationId = null;
let cameraTime = 0;
// Mouse position for follower element
let mouseX = 400;
let mouseY = 250;

function createAnimation(index) {
    // PERFORMANCE FIX: Stop all animations before creating new one
    stopCameraAnimation();
    
    // Clear element data cache when creating new animation
    elementData = new WeakMap();
    
    // Check if this is Halloween song - give it special visualizer
    const songName = getSongName(musicFiles[index]);
    let svg;
    if (songName.toLowerCase() === 'halloween') {
        svg = createHalloween(index);
    } else {
        // Each song gets a unique virtual world experience
        // Map each song to its own animation for a truly unique experience
        const funcIndex = index % animationFunctions.length;
        svg = animationFunctions[funcIndex](index);
    }
    
    // Simplified: Use CSS for sizing, only set essential properties once
    if (!svg.getAttribute('viewBox')) {
        svg.setAttribute('viewBox', '0 0 800 500');
    }
    
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    
    // Set initial sizing once - CSS will handle the rest
    svg.style.display = 'block';
    svg.style.opacity = '1';
    svg.style.visibility = 'visible';
    
    // Store container dimensions for resize checks
    const container = animationContainer;
    const containerRect = container.getBoundingClientRect();
    if (containerRect.width > 0 && containerRect.height > 0) {
        lastContainerWidth = containerRect.width;
        lastContainerHeight = containerRect.height;
        svg.setAttribute('width', containerRect.width);
        svg.setAttribute('height', containerRect.height);
    }
    
    // Add immersive camera movement to the entire SVG
    svg.style.willChange = 'transform';
    svg.classList.add('virtual-world-svg');
    svg.dataset.worldIndex = index;
    
    // Simplified resize handler - only update when actually needed
    // PERFORMANCE: Throttle resize handler to avoid excessive calls
    let resizeTimeout = null;
    const handleResize = () => {
        if (!container || !svg.parentNode) return;
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            ensureSVGSize(svg);
        }, 150); // Throttle to max once per 150ms for better performance
    };
    
    // Store handler reference for cleanup
    svg._resizeHandler = handleResize;
    
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });
    
    // PERFORMANCE FIX: Clear old SVG and cached data before adding new one
    const oldSvg = animationContainer.querySelector('.virtual-world-svg');
    if (oldSvg) {
        // Remove old event listeners and clear cache to prevent memory leaks
        if (oldSvg._resizeHandler) {
            window.removeEventListener('resize', oldSvg._resizeHandler);
            window.removeEventListener('orientationchange', oldSvg._resizeHandler);
        }
        oldSvg._cachedElements = null;
        oldSvg._updateOffset = null;
        oldSvg._updateOffset2 = null;
        oldSvg._skipFrame = null;
        oldSvg._updateLimit = null;
        oldSvg._resizeHandler = null;
    }
    
    // Clear container and WeakMap to prevent memory leaks
    animationContainer.innerHTML = '';
    elementData = new WeakMap();
    mouseFollower = null; // Reset mouse follower
    animationContainer.appendChild(svg);
    
    // Recreate mouse follower if mouse is over container
    const rect = animationContainer.getBoundingClientRect();
    if (mouseX >= 0 && mouseX <= rect.width && mouseY >= 0 && mouseY <= rect.height) {
        requestAnimationFrame(() => createMouseFollower());
    }
    
    // Set initial size after DOM insertion
    requestAnimationFrame(() => {
        ensureSVGSize(svg);
    });
    
    // Reset camera time for new animation
    cameraTime = 0;
    
    // Start camera movement if playing
    if (isPlaying) {
        startCameraAnimation();
    }
}

function startCameraAnimation() {
    if (cameraAnimationId) return;
    
    let frameCount = 0;
    
    const animateCamera = () => {
        if (!isPlaying) {
            cameraAnimationId = null;
            return;
        }
        
        const svg = animationContainer.querySelector('.virtual-world-svg');
        if (!svg) {
            cameraAnimationId = null;
            return;
        }
        
        // Only check sizing every 60 frames (~1 second) to avoid layout thrashing
        frameCount++;
        if (frameCount % 60 === 0) {
            ensureSVGSize(svg);
        }
        
        // Simple auto rotation (no mouse influence)
        cameraTime += 0.015;
        const rotateY = Math.sin(cameraTime * 0.5) * 8;
        const rotateX = Math.cos(cameraTime * 0.3) * 5;
        const perspective = 1000 + Math.sin(cameraTime * 0.2) * 300;
        
        // Apply transform while preserving sizing
        // Use transform-origin to keep it centered
        svg.style.transformOrigin = '50% 50%';
        svg.style.transform = `perspective(${perspective}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
        
        cameraAnimationId = requestAnimationFrame(animateCamera);
    };
    
    cameraAnimationId = requestAnimationFrame(animateCamera);
}

function stopCameraAnimation() {
    if (cameraAnimationId) {
        cancelAnimationFrame(cameraAnimationId);
        cameraAnimationId = null;
    }
}

// Real-time animation sync removed - using static CSS animations only

// Animation generators - Virtual World Experiences
function createWavePattern(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    svg.style.transform = 'perspective(1000px) rotateX(20deg)';
    svg.style.transformStyle = 'preserve-3d';
    
    for (let i = 0; i < 50; i++) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const y = (i * 10) + 100;
        const depth = i * 5;
        let d = `M 0 ${y}`;
        for (let x = 0; x < 800; x += 10) {
            d += ` L ${x} ${y + Math.sin((x + i * 10 + Date.now() / 100) / 50) * (30 + depth / 10)}`;
        }
        path.setAttribute('d', d);
        path.setAttribute('stroke', getThemeColor(i * 10));
        path.setAttribute('stroke-width', '5');
        path.setAttribute('fill', 'none');
        path.style.animation = `wave ${2 + i * 0.1}s ease-in-out infinite`;
        path.style.transform = `translateZ(${depth}px)`;
        path.style.opacity = 0.85 + (i / 50) * 0.15;
        svg.appendChild(path);
    }
    
    return svg;
}

function createParticleSystem(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    svg.style.transform = 'perspective(1200px)';
    svg.style.transformStyle = 'preserve-3d';
    
    for (let i = 0; i < 150; i++) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const x = Math.random() * 800;
        const y = Math.random() * 500;
        const z = (Math.random() - 0.5) * 400;
        const r = Math.random() * 12 + 3;
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', r);
        circle.setAttribute('fill', getThemeColorRandom());
        const scale = 1 + (z / 400);
        const opacity = 0.75 + (z + 200) / 400 * 0.25;
        circle.style.transform = `translateZ(${z}px) scale(${scale})`;
        circle.style.opacity = Math.max(0.7, opacity);
        circle.style.animation = `float3D ${4 + Math.random() * 3}s ease-in-out infinite`;
        circle.style.animationDelay = `${Math.random() * 2}s`;
        svg.appendChild(circle);
    }
    
    return svg;
}

function createGeometricShapes(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    svg.style.transform = 'perspective(1500px) rotateY(-10deg)';
    svg.style.transformStyle = 'preserve-3d';
    
    for (let i = 0; i < 40; i++) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const x = (i % 10) * 80;
        const y = Math.floor(i / 10) * 100;
        const z = (i % 5 - 2) * 60;
        const size = 50 + Math.sin(i) * 20;
        rect.setAttribute('x', x + 15);
        rect.setAttribute('y', y + 15);
        rect.setAttribute('width', size);
        rect.setAttribute('height', size);
        rect.setAttribute('fill', getThemeColor(i * 25));
        rect.setAttribute('stroke', getThemeColor(i * 25));
        rect.setAttribute('stroke-width', '2');
        const rotation = i * 12;
        rect.style.transform = `translateZ(${z}px) rotateZ(${rotation}deg) rotateY(${z / 10}deg)`;
        rect.style.opacity = 0.85 + (z + 120) / 240 * 0.15;
        rect.style.animation = `rotate3D ${8 + i * 0.3}s linear infinite`;
        svg.appendChild(rect);
    }
    
    return svg;
}

function createCircularWaves(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    svg.style.transform = 'perspective(1000px)';
    const centerX = 400;
    const centerY = 250;
    
    for (let i = 0; i < 25; i++) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const radius = 50 + i * 18;
        const z = i * -20;
        circle.setAttribute('cx', centerX);
        circle.setAttribute('cy', centerY);
        circle.setAttribute('r', radius);
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', getThemeColor(i * 18));
        circle.setAttribute('stroke-width', '6');
        circle.style.transform = `translateZ(${z}px)`;
        circle.style.opacity = Math.max(0.6, 0.9 - (i / 25) * 0.3);
        circle.style.animation = `pulse ${2 + i * 0.1}s ease-in-out infinite`;
        circle.style.animationDelay = `${i * 0.1}s`;
        svg.appendChild(circle);
    }
    
    return svg;
}

function createFlowingLines(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    svg.style.transform = 'perspective(1000px) rotateX(25deg)';
    svg.style.transformStyle = 'preserve-3d';
    
    for (let i = 0; i < 50; i++) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        const z = (i % 8 - 4) * 30;
        line.setAttribute('x1', 0);
        line.setAttribute('y1', i * 10);
        line.setAttribute('x2', 800);
        line.setAttribute('y2', i * 10 + Math.sin(i) * 50);
        line.setAttribute('stroke', getThemeColor(i * 9));
        line.setAttribute('stroke-width', '5');
        line.style.transform = `translateZ(${z}px)`;
        line.style.opacity = 0.85 + (z + 120) / 240 * 0.15;
        line.style.animation = `flow ${3 + i * 0.05}s ease-in-out infinite`;
        svg.appendChild(line);
    }
    
    return svg;
}

function createHexagonPattern(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    const size = 40;
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 15; x++) {
            const hex = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            const cx = (x * size * 1.5) + (y % 2) * size * 0.75;
            const cy = y * size * 0.866;
            const points = [];
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i;
                points.push(`${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`);
            }
            hex.setAttribute('points', points.join(' '));
            hex.setAttribute('fill', getThemeColor((x + y) * 10));
            hex.setAttribute('stroke', getThemeColor((x + y) * 10));
            hex.setAttribute('stroke-width', '2');
            hex.setAttribute('opacity', '0.85');
            hex.style.animation = `hexPulse ${2 + (x + y) * 0.1}s ease-in-out infinite`;
            svg.appendChild(hex);
        }
    }
    
    return svg;
}

function createSpiralPattern(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    svg.style.transform = 'perspective(1200px)';
    svg.style.transformStyle = 'preserve-3d';
    
    const centerX = 400;
    const centerY = 250;
    // PERFORMANCE FIX: Reduce element count (was 250, now 120)
    for (let i = 0; i < 120; i++) {
        const angle = i * 0.15;
        const radius = i * 1.8;
        const z = (i % 10 - 5) * 40;
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', centerX + radius * Math.cos(angle));
        circle.setAttribute('cy', centerY + radius * Math.sin(angle));
        circle.setAttribute('r', 8);
        circle.setAttribute('fill', getThemeColor(i * 2));
        circle.style.transform = `translateZ(${z}px)`;
        circle.style.opacity = Math.max(0.7, 0.85 + (z + 200) / 400 * 0.15);
        circle.style.animation = `spiral ${8}s linear infinite`;
        circle.style.animationDelay = `${i * 0.03}s`;
        svg.appendChild(circle);
    }
    
    return svg;
}

function createDiamondGrid(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 20; x++) {
            const diamond = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            const cx = x * 40;
            const cy = y * 50;
            diamond.setAttribute('points', `${cx},${cy - 20} ${cx + 20},${cy} ${cx},${cy + 20} ${cx - 20},${cy}`);
            diamond.setAttribute('fill', getThemeColor((x + y) * 8));
            diamond.setAttribute('stroke', getThemeColor((x + y) * 8));
            diamond.setAttribute('stroke-width', '2');
            diamond.setAttribute('opacity', '0.85');
            diamond.style.animation = `diamondRotate ${3 + (x + y) * 0.1}s linear infinite`;
            svg.appendChild(diamond);
        }
    }
    
    return svg;
}

function createStarField(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    for (let i = 0; i < 150; i++) {
        const star = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        const x = Math.random() * 800;
        const y = Math.random() * 500;
        const size = Math.random() * 5 + 2;
        const points = [];
        for (let j = 0; j < 5; j++) {
            const angle = (Math.PI * 2 / 5) * j - Math.PI / 2;
            points.push(`${x + size * Math.cos(angle)},${y + size * Math.sin(angle)}`);
        }
        star.setAttribute('points', points.join(' '));
        star.setAttribute('fill', getThemeColorRandom());
        star.setAttribute('opacity', '0.9');
        star.style.filter = 'drop-shadow(0 0 5px rgba(255, 149, 0, 0.8))';
        star.style.animation = `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`;
        svg.appendChild(star);
    }
    
    return svg;
}

function createRippleEffect(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    const centerX = 400;
    const centerY = 250;
    for (let i = 0; i < 15; i++) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', centerX);
        circle.setAttribute('cy', centerY);
        circle.setAttribute('r', i * 20);
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', getThemeColor(i * 24));
        circle.setAttribute('stroke-width', '5');
        circle.setAttribute('opacity', '0.9');
        circle.style.animation = `ripple ${3 + i * 0.2}s ease-out infinite`;
        circle.style.animationDelay = `${i * 0.2}s`;
        svg.appendChild(circle);
    }
    
    return svg;
}

function createFloatingCircles(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    for (let i = 0; i < 25; i++) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const r = Math.random() * 30 + 10;
        circle.setAttribute('cx', Math.random() * 800);
        circle.setAttribute('cy', Math.random() * 500);
        circle.setAttribute('r', r);
        circle.setAttribute('fill', getThemeColorRandom());
        circle.setAttribute('opacity', '0.85');
        circle.setAttribute('stroke', getThemeColorRandom());
        circle.setAttribute('stroke-width', '2');
        circle.style.animation = `float ${4 + Math.random() * 3}s ease-in-out infinite`;
        svg.appendChild(circle);
    }
    
    return svg;
}

function createMeshGradient(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 30; x++) {
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x * 26.67);
            rect.setAttribute('y', y * 25);
            rect.setAttribute('width', 26.67);
            rect.setAttribute('height', 25);
            rect.setAttribute('fill', `hsl(${((x + y) * 6) % 360}, 70%, ${50 + (x + y) % 20}%)`);
            rect.setAttribute('opacity', '0.9');
            rect.style.animation = `meshPulse ${2 + (x + y) * 0.05}s ease-in-out infinite`;
            svg.appendChild(rect);
        }
    }
    
    return svg;
}

function createTreePattern(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    function drawTree(x, y, length, angle, depth) {
        if (depth === 0) return;
        const x2 = x + length * Math.cos(angle);
        const y2 = y + length * Math.sin(angle);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x);
        line.setAttribute('y1', y);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
            line.setAttribute('stroke', `hsl(${120 + depth * 10}, 70%, 60%)`);
            line.setAttribute('stroke-width', Math.max(3, depth + 2));
            line.setAttribute('opacity', '0.9');
        svg.appendChild(line);
        drawTree(x2, y2, length * 0.7, angle - 0.5, depth - 1);
        drawTree(x2, y2, length * 0.7, angle + 0.5, depth - 1);
    }
    
    drawTree(400, 450, 80, -Math.PI / 2, 8);
    return svg;
}

function createLightning(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    for (let i = 0; i < 5; i++) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let d = `M ${200 + i * 100} 0`;
        let y = 0;
        let x = 200 + i * 100;
        for (let j = 0; j < 20; j++) {
            y += 25;
            x += (Math.random() - 0.5) * 30;
            d += ` L ${x} ${y}`;
        }
        path.setAttribute('d', d);
        path.setAttribute('stroke', '#FFC857');
        path.setAttribute('stroke-width', '5');
        path.setAttribute('opacity', '0.95');
        path.style.filter = 'drop-shadow(0 0 10px rgba(255, 200, 87, 0.8))';
        path.setAttribute('fill', 'none');
        path.style.animation = `lightning ${1 + Math.random()}s ease-in-out infinite`;
        svg.appendChild(path);
    }
    
    return svg;
}

function createAurora(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    for (let i = 0; i < 100; i++) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let d = `M ${i * 8} 0`;
        for (let y = 0; y < 500; y += 10) {
            d += ` L ${i * 8 + Math.sin(y / 50 + i) * 20} ${y}`;
        }
        path.setAttribute('d', d);
        path.setAttribute('stroke', getThemeColor(i * 2, 40));
        path.setAttribute('stroke-width', '5');
        path.setAttribute('opacity', '0.85');
        path.setAttribute('fill', 'none');
        path.style.animation = `aurora ${5 + i * 0.05}s ease-in-out infinite`;
        svg.appendChild(path);
    }
    
    return svg;
}

function createBubbles(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    for (let i = 0; i < 50; i++) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const r = Math.random() * 20 + 5;
        circle.setAttribute('cx', Math.random() * 800);
        circle.setAttribute('cy', 500 + Math.random() * 100);
        circle.setAttribute('r', r);
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', `rgba(255, 200, 87, 0.95)`);
        circle.setAttribute('stroke-width', '4');
        circle.setAttribute('opacity', '0.9');
        circle.style.animation = `bubble ${5 + Math.random() * 5}s ease-out infinite`;
        circle.style.animationDelay = `${Math.random() * 3}s`;
        svg.appendChild(circle);
    }
    
    return svg;
}

function createFireworks(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    const centers = [{x: 200, y: 200}, {x: 400, y: 150}, {x: 600, y: 250}];
    centers.forEach((center, i) => {
        for (let j = 0; j < 30; j++) {
            const angle = (Math.PI * 2 / 30) * j;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', center.x);
            line.setAttribute('y1', center.y);
            line.setAttribute('x2', center.x + 50 * Math.cos(angle));
            line.setAttribute('y2', center.y + 50 * Math.sin(angle));
            line.setAttribute('stroke', getThemeColor(j * 12));
            line.setAttribute('stroke-width', '4');
            line.setAttribute('opacity', '0.9');
            line.style.animation = `firework ${2 + i}s ease-out infinite`;
            line.style.animationDelay = `${i * 0.7}s`;
            svg.appendChild(line);
        }
    });
    
    return svg;
}

function createKaleidoscope(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    const centerX = 400;
    const centerY = 250;
    const segments = 12;
    
    for (let i = 0; i < segments; i++) {
        const angle = (Math.PI * 2 / segments) * i;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let d = `M ${centerX} ${centerY}`;
        for (let r = 0; r < 200; r += 5) {
            const x = centerX + r * Math.cos(angle + r / 50);
            const y = centerY + r * Math.sin(angle + r / 50);
            d += ` L ${x} ${y}`;
        }
        path.setAttribute('d', d);
        path.setAttribute('stroke', getThemeColor(i * 30));
        path.setAttribute('stroke-width', '5');
        path.setAttribute('opacity', '0.85');
        path.setAttribute('fill', 'none');
        path.style.animation = `kaleidoscope ${3 + i * 0.2}s linear infinite`;
        svg.appendChild(path);
    }
    
    return svg;
}

function createSoundWaves(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    for (let i = 0; i < 50; i++) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const x = i * 16;
        const height = 50 + Math.sin(i) * 30;
        rect.setAttribute('x', x);
        rect.setAttribute('y', 250 - height / 2);
        rect.setAttribute('width', 12);
        rect.setAttribute('height', height);
        rect.setAttribute('fill', getThemeColor(i * 7));
        rect.setAttribute('stroke', getThemeColor(i * 7));
        rect.setAttribute('stroke-width', '1');
        rect.setAttribute('opacity', '0.9');
        rect.style.animation = `soundWave ${1 + i * 0.05}s ease-in-out infinite`;
        rect.style.animationDelay = `${i * 0.05}s`;
        svg.appendChild(rect);
    }
    
    return svg;
}

function createFractalTree(index) {
    return createTreePattern(index);
}

function createMandelbrot(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    // PERFORMANCE FIX: Reduce resolution to prevent crashes (was 4000, now 800)
    for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 40; x++) {
            const cx = -2 + (x / 40) * 3;
            const cy = -1 + (y / 20) * 2;
            let zx = 0, zy = 0;
            let iter = 0;
            // PERFORMANCE: Limit iterations
            while (zx * zx + zy * zy < 4 && iter < 30) {
                const tmp = zx * zx - zy * zy + cx;
                zy = 2 * zx * zy + cy;
                zx = tmp;
                iter++;
            }
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x * 20);
            circle.setAttribute('cy', y * 25);
            circle.setAttribute('r', 8);
            circle.setAttribute('fill', getThemeColor(iter * 7));
            circle.setAttribute('opacity', '0.9');
            svg.appendChild(circle);
        }
    }
    
    return svg;
}

function createLiquid(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    for (let i = 0; i < 20; i++) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let d = `M 0 ${250 + i * 10}`;
        for (let x = 0; x < 800; x += 5) {
            d += ` L ${x} ${250 + i * 10 + Math.sin(x / 30 + i) * 20}`;
        }
        path.setAttribute('d', d);
        path.setAttribute('stroke', getThemeColor(i * 5, 35));
        path.setAttribute('stroke-width', '5');
        path.setAttribute('opacity', '0.85');
        path.setAttribute('fill', 'none');
        path.style.animation = `liquid ${3 + i * 0.1}s ease-in-out infinite`;
        svg.appendChild(path);
    }
    
    return svg;
}

function createSolarSystem(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    svg.style.transform = 'perspective(1500px) rotateX(15deg)';
    svg.style.transformStyle = 'preserve-3d';
    
    const centerX = 400;
    const centerY = 250;
    
    // Sun
    const sun = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    sun.setAttribute('cx', centerX);
    sun.setAttribute('cy', centerY);
    sun.setAttribute('r', 40);
    sun.setAttribute('fill', '#FF9500');
    sun.setAttribute('opacity', '1');
    sun.style.transform = 'translateZ(0)';
    sun.style.animation = `rotate3D ${15}s linear infinite`;
    sun.style.filter = 'drop-shadow(0 0 30px rgba(255, 149, 0, 1))';
    svg.appendChild(sun);
    
    // Planets with 3D orbits
    for (let i = 0; i < 6; i++) {
        const orbitRadius = 80 + i * 50;
        const planet = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        planet.setAttribute('cx', centerX + orbitRadius);
        planet.setAttribute('cy', centerY);
        planet.setAttribute('r', 12 + i * 2);
        planet.setAttribute('fill', getThemeColor(i * 8));
        planet.setAttribute('opacity', '0.95');
        const orbitZ = i * -30;
        planet.style.transform = `translateZ(${orbitZ}px)`;
        planet.style.transformOrigin = `${centerX}px ${centerY}px`;
        planet.style.animation = `orbit3D ${12 + i * 2}s linear infinite`;
        planet.style.animationDelay = `${i * 1.5}s`;
        planet.style.filter = 'drop-shadow(0 0 15px rgba(255, 149, 0, 0.8))';
        svg.appendChild(planet);
    }
    
    return svg;
}

function createMetaballs(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    for (let i = 0; i < 10; i++) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', 100 + i * 70);
        circle.setAttribute('cy', 250);
        circle.setAttribute('r', 40);
        circle.setAttribute('fill', getThemeColor(i * 36));
        circle.setAttribute('opacity', '0.9');
        circle.setAttribute('stroke', getThemeColor(i * 36));
        circle.setAttribute('stroke-width', '2');
        circle.style.animation = `metaball ${3 + i * 0.3}s ease-in-out infinite`;
        svg.appendChild(circle);
    }
    
    return svg;
}

function createNoiseField(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    // PERFORMANCE FIX: Reduce element count to prevent crashes (was 4000, now 800)
    for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 40; x++) {
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x * 20);
            rect.setAttribute('y', y * 25);
            rect.setAttribute('width', 20);
            rect.setAttribute('height', 25);
            rect.setAttribute('fill', getThemeColor((x + y)));
            rect.setAttribute('opacity', '0.9');
            rect.style.animation = `noise ${0.1 + Math.random() * 0.2}s ease-in-out infinite`;
            svg.appendChild(rect);
        }
    }
    
    return svg;
}

function createVectorField(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    for (let y = 0; y < 25; y++) {
        for (let x = 0; x < 40; x++) {
            const angle = (x + y) * 0.2;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x * 20);
            line.setAttribute('y1', y * 20);
            line.setAttribute('x2', x * 20 + 15 * Math.cos(angle));
            line.setAttribute('y2', y * 20 + 15 * Math.sin(angle));
            line.setAttribute('stroke', getThemeColor(angle * 10));
            line.setAttribute('stroke-width', '4');
            line.setAttribute('opacity', '0.9');
            line.style.animation = `vector ${2 + (x + y) * 0.05}s ease-in-out infinite`;
            svg.appendChild(line);
        }
    }
    
    return svg;
}

function createTunnel(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    svg.style.transform = 'perspective(2000px)';
    svg.style.transformStyle = 'preserve-3d';
    
    const centerX = 400;
    const centerY = 250;
    
    for (let i = 0; i < 40; i++) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const z = i * -30;
        const scale = 1 + z / 500;
        const radius = (200 - i * 5) * scale;
        circle.setAttribute('cx', centerX);
        circle.setAttribute('cy', centerY);
        circle.setAttribute('r', radius);
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', getThemeColor(i * 12));
        circle.setAttribute('stroke-width', '6');
        circle.style.transform = `translateZ(${z}px) scale(${scale})`;
        circle.style.opacity = Math.max(0.5, 1 - (i / 40) * 0.5);
        circle.style.animation = `tunnel3D ${1.5 + i * 0.05}s linear infinite`;
        circle.style.animationDelay = `${i * 0.05}s`;
        svg.appendChild(circle);
    }
    
    return svg;
}

function createNebula(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    // PERFORMANCE FIX: Reduce particle count to prevent crashes (was 200, now 80)
    for (let i = 0; i < 80; i++) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const x = 400 + (Math.random() - 0.5) * 400;
        const y = 250 + (Math.random() - 0.5) * 300;
        const r = Math.random() * 15 + 2;
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', r);
        circle.setAttribute('fill', getThemeColorRandom());
        circle.setAttribute('opacity', '0.6');
        circle.style.animation = `nebula ${5 + Math.random() * 5}s ease-in-out infinite`;
        svg.appendChild(circle);
    }
    
    return svg;
}

function createCircuitBoard(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    for (let i = 0; i < 100; i++) {
        const x1 = Math.random() * 800;
        const y1 = Math.random() * 500;
        const x2 = x1 + (Math.random() - 0.5) * 100;
        const y2 = y1 + (Math.random() - 0.5) * 100;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', '#FFC857');
        line.setAttribute('stroke-width', '4');
        line.setAttribute('opacity', '0.9');
        line.style.filter = 'drop-shadow(0 0 5px rgba(255, 200, 87, 0.6))';
        line.style.animation = `circuit ${2 + Math.random()}s ease-in-out infinite`;
        svg.appendChild(line);
        
        const node = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        node.setAttribute('cx', x2);
        node.setAttribute('cy', y2);
        node.setAttribute('r', 4);
        node.setAttribute('fill', '#FF9500');
        node.setAttribute('opacity', '1');
        node.style.filter = 'drop-shadow(0 0 8px rgba(255, 149, 0, 0.8))';
        svg.appendChild(node);
    }
    
    return svg;
}

function createOrbs(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    for (let i = 0; i < 15; i++) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const r = 30 + Math.random() * 20;
        circle.setAttribute('cx', Math.random() * 800);
        circle.setAttribute('cy', Math.random() * 500);
        circle.setAttribute('r', r);
        circle.setAttribute('fill', getThemeColorRandom());
        circle.setAttribute('opacity', '0.9');
        circle.setAttribute('stroke', getThemeColorRandom());
        circle.setAttribute('stroke-width', '2');
        circle.style.filter = 'drop-shadow(0 0 15px rgba(255, 149, 0, 0.7))';
        circle.style.animation = `orb ${4 + Math.random() * 3}s ease-in-out infinite`;
        svg.appendChild(circle);
    }
    
    return svg;
}

function createEnergyWaves(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    const centerX = 400;
    const centerY = 250;
    
    for (let i = 0; i < 50; i++) {
        const angle = (Math.PI * 2 / 50) * i;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let d = `M ${centerX} ${centerY}`;
        for (let r = 0; r < 300; r += 5) {
            const x = centerX + r * Math.cos(angle + r / 30);
            const y = centerY + r * Math.sin(angle + r / 30);
            d += ` L ${x} ${y}`;
        }
        path.setAttribute('d', d);
        path.setAttribute('stroke', getThemeColor(i * 7));
        path.setAttribute('stroke-width', '5');
        path.setAttribute('opacity', '0.85');
        path.setAttribute('fill', 'none');
        path.style.animation = `energyWave ${3 + i * 0.05}s ease-in-out infinite`;
        svg.appendChild(path);
    }
    
    return svg;
}

function createHalloween(index) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    // Halloween color palette - oranges, purples, dark reds
    const halloweenColors = [
        '#FF6B35', // Bright orange
        '#F7931E', // Pumpkin orange
        '#8B4513', // Brown
        '#4B0082', // Indigo
        '#800080', // Purple
        '#DC143C', // Crimson
        '#FF8C00', // Dark orange
        '#2F0A28'  // Dark purple
    ];
    
    function getHalloweenColor(i) {
        return halloweenColors[i % halloweenColors.length];
    }
    
    // Moon in background
    const moon = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    moon.setAttribute('cx', '650');
    moon.setAttribute('cy', '80');
    moon.setAttribute('r', '60');
    moon.setAttribute('fill', '#FFE5B4');
    moon.setAttribute('opacity', '0.9');
    moon.style.filter = 'drop-shadow(0 0 30px rgba(255, 229, 180, 0.8))';
    moon.style.animation = 'float3D 15s ease-in-out infinite';
    svg.appendChild(moon);
    
    // Bats flying around
    for (let i = 0; i < 12; i++) {
        const bat = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const x = Math.random() * 800;
        const y = Math.random() * 400 + 50;
        
        // Simple bat shape (symmetric)
        const size = 8 + Math.random() * 6;
        const d = `M ${x} ${y} 
                   Q ${x - size} ${y - size * 0.8} ${x - size * 1.5} ${y}
                   Q ${x - size} ${y + size * 0.8} ${x} ${y}
                   M ${x} ${y}
                   Q ${x + size} ${y - size * 0.8} ${x + size * 1.5} ${y}
                   Q ${x + size} ${y + size * 0.8} ${x} ${y}
                   L ${x} ${y + size * 1.2}
                   L ${x - size * 0.3} ${y + size * 1.5}
                   L ${x} ${y + size * 1.2}
                   L ${x + size * 0.3} ${y + size * 1.5}
                   Z`;
        
        bat.setAttribute('d', d);
        bat.setAttribute('fill', '#1a0d1a');
        bat.setAttribute('stroke', '#4B0082');
        bat.setAttribute('stroke-width', '1.5');
        bat.setAttribute('opacity', '0.8');
        bat.style.animation = `batFly ${4 + Math.random() * 3}s ease-in-out infinite`;
        bat.style.animationDelay = `${Math.random() * 2}s`;
        bat.style.transformOrigin = `${x}px ${y}px`;
        svg.appendChild(bat);
    }
    
    // Pumpkins scattered
    for (let i = 0; i < 8; i++) {
        const pumpkinX = 50 + (i % 4) * 200;
        const pumpkinY = 350 + Math.floor(i / 4) * 100;
        
        // Pumpkin body
        const pumpkin = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        pumpkin.setAttribute('cx', pumpkinX);
        pumpkin.setAttribute('cy', pumpkinY);
        pumpkin.setAttribute('rx', '35');
        pumpkin.setAttribute('ry', '40');
        pumpkin.setAttribute('fill', getHalloweenColor(i * 2));
        pumpkin.setAttribute('opacity', '0.9');
        pumpkin.setAttribute('stroke', '#FF8C00');
        pumpkin.setAttribute('stroke-width', '2');
        pumpkin.style.filter = 'drop-shadow(0 0 10px rgba(255, 107, 53, 0.6))';
        pumpkin.style.animation = `pumpkinGlow ${3 + i * 0.3}s ease-in-out infinite`;
        svg.appendChild(pumpkin);
        
        // Pumpkin stem
        const stem = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        stem.setAttribute('x', pumpkinX - 5);
        stem.setAttribute('y', pumpkinY - 45);
        stem.setAttribute('width', '10');
        stem.setAttribute('height', '15');
        stem.setAttribute('fill', '#4B0082');
        stem.setAttribute('opacity', '0.9');
        svg.appendChild(stem);
        
        // Pumpkin face - left eye (triangle)
        const eye1 = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        eye1.setAttribute('points', `${pumpkinX - 12},${pumpkinY - 10} ${pumpkinX - 8},${pumpkinY - 5} ${pumpkinX - 12},${pumpkinY}`);
        eye1.setAttribute('fill', '#000');
        svg.appendChild(eye1);
        
        // Right eye
        const eye2 = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        eye2.setAttribute('points', `${pumpkinX + 12},${pumpkinY - 10} ${pumpkinX + 8},${pumpkinY - 5} ${pumpkinX + 12},${pumpkinY}`);
        eye2.setAttribute('fill', '#000');
        svg.appendChild(eye2);
        
        // Mouth
        const mouth = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const mouthPoints = `M ${pumpkinX - 15} ${pumpkinY + 10} 
                            Q ${pumpkinX - 10} ${pumpkinY + 20} ${pumpkinX} ${pumpkinY + 18}
                            Q ${pumpkinX + 10} ${pumpkinY + 20} ${pumpkinX + 15} ${pumpkinY + 10}
                            Q ${pumpkinX + 12} ${pumpkinY + 12} ${pumpkinX} ${pumpkinY + 15}
                            Q ${pumpkinX - 12} ${pumpkinY + 12} ${pumpkinX - 15} ${pumpkinY + 10} Z`;
        mouth.setAttribute('d', mouthPoints);
        mouth.setAttribute('fill', '#000');
        svg.appendChild(mouth);
    }
    
    // Ghosts floating
    for (let i = 0; i < 10; i++) {
        const ghost = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const gx = 100 + (i % 5) * 140;
        const gy = 100 + Math.floor(i / 5) * 150;
        
        // Ghost shape with wavy bottom
        const ghostPath = `M ${gx} ${gy}
                          Q ${gx - 20} ${gy - 30} ${gx - 25} ${gy - 15}
                          L ${gx - 20} ${gy + 30}
                          Q ${gx - 15} ${gy + 35} ${gx - 10} ${gy + 32}
                          Q ${gx - 5} ${gy + 35} ${gx} ${gy + 32}
                          Q ${gx + 5} ${gy + 35} ${gx + 10} ${gy + 32}
                          Q ${gx + 15} ${gy + 35} ${gx + 20} ${gy + 30}
                          L ${gx + 25} ${gy - 15}
                          Q ${gx + 20} ${gy - 30} ${gx} ${gy}
                          Z`;
        
        ghost.setAttribute('d', ghostPath);
        ghost.setAttribute('fill', '#F0F0F0');
        ghost.setAttribute('opacity', '0.85');
        ghost.setAttribute('stroke', '#C0C0C0');
        ghost.setAttribute('stroke-width', '1.5');
        ghost.style.filter = 'drop-shadow(0 0 15px rgba(240, 240, 240, 0.7))';
        ghost.style.animation = `ghostFloat ${5 + Math.random() * 3}s ease-in-out infinite`;
        ghost.style.animationDelay = `${Math.random() * 2}s`;
        svg.appendChild(ghost);
        
        // Ghost eyes
        const eye1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        eye1.setAttribute('cx', gx - 8);
        eye1.setAttribute('cy', gy - 5);
        eye1.setAttribute('r', '3');
        eye1.setAttribute('fill', '#000');
        svg.appendChild(eye1);
        
        const eye2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        eye2.setAttribute('cx', gx + 8);
        eye2.setAttribute('cy', gy - 5);
        eye2.setAttribute('r', '3');
        eye2.setAttribute('fill', '#000');
        svg.appendChild(eye2);
    }
    
    // Spooky stars/twinkles
    for (let i = 0; i < 40; i++) {
        const star = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        star.setAttribute('cx', Math.random() * 800);
        star.setAttribute('cy', Math.random() * 300);
        star.setAttribute('r', '2');
        star.setAttribute('fill', getHalloweenColor(i));
        star.setAttribute('opacity', '0.8');
        star.style.filter = 'drop-shadow(0 0 5px rgba(255, 107, 53, 0.8))';
        star.style.animation = `starTwinkle ${1 + Math.random() * 2}s ease-in-out infinite`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        svg.appendChild(star);
    }
    
    // Spooky mist/fog at bottom
    for (let i = 0; i < 15; i++) {
        const mist = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        const rx = 60 + Math.random() * 40;
        mist.setAttribute('cx', (i * 50) + Math.random() * 30);
        mist.setAttribute('cy', 480 + Math.random() * 20);
        mist.setAttribute('rx', rx);
        mist.setAttribute('ry', '20');
        mist.setAttribute('fill', '#4B0082');
        mist.setAttribute('opacity', '0.3');
        mist.style.animation = `mistFloat ${4 + Math.random() * 3}s ease-in-out infinite`;
        mist.style.animationDelay = `${Math.random() * 2}s`;
        svg.appendChild(mist);
    }
    
    return svg;
}

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes wave {
        0%, 100% { transform: translateY(0) translateZ(0); opacity: 0.7; }
        50% { transform: translateY(-10px) translateZ(20px); opacity: 1; }
    }
    @keyframes float {
        0%, 100% { transform: translateY(0) translateX(0) translateZ(0); }
        50% { transform: translateY(-20px) translateX(10px) translateZ(30px); }
    }
    @keyframes float3D {
        0%, 100% { transform: translateZ(0) rotateX(0deg) rotateY(0deg); }
        25% { transform: translateZ(50px) rotateX(5deg) rotateY(-5deg); }
        50% { transform: translateZ(100px) rotateX(0deg) rotateY(0deg); }
        75% { transform: translateZ(50px) rotateX(-5deg) rotateY(5deg); }
    }
    @keyframes rotate3D {
        from { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
        to { transform: rotateX(360deg) rotateY(360deg) rotateZ(0deg); }
    }
    @keyframes tunnel3D {
        0% { transform: translateZ(0) scale(1); opacity: 1; }
        100% { transform: translateZ(-500px) scale(0.1); opacity: 0; }
    }
    @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    @keyframes pulse {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.1); }
    }
    @keyframes flow {
        0%, 100% { transform: translateX(0); opacity: 0.6; }
        50% { transform: translateX(20px); opacity: 1; }
    }
    @keyframes hexPulse {
        0%, 100% { opacity: 0.5; transform: scale(1); }
        50% { opacity: 0.9; transform: scale(1.1); }
    }
    @keyframes spiral {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    @keyframes diamondRotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    @keyframes twinkle {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 1; }
    }
    @keyframes ripple {
        0% { opacity: 1; transform: scale(0.8); }
        100% { opacity: 0; transform: scale(1.5); }
    }
    @keyframes bubble {
        0% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(-600px); opacity: 0; }
    }
    @keyframes firework {
        0% { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(2); }
    }
    @keyframes kaleidoscope {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    @keyframes soundWave {
        0%, 100% { height: 50px; }
        50% { height: 150px; }
    }
    @keyframes liquid {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(10px); }
    }
    @keyframes orbit {
        from { transform: rotate(0deg) translateX(0) translateY(0) translateZ(0); }
        to { transform: rotate(360deg) translateX(0) translateY(0) translateZ(0); }
    }
    @keyframes orbit3D {
        from { transform: rotateY(0deg) rotateX(0deg) translateX(0) translateZ(0); }
        to { transform: rotateY(360deg) rotateX(360deg) translateX(200px) translateZ(100px); }
    }
    @keyframes metaball {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
    }
    @keyframes noise {
        0%, 100% { opacity: 0.7; }
        50% { opacity: 1; }
    }
    @keyframes vector {
        0%, 100% { transform: rotate(0deg); }
        50% { transform: rotate(180deg); }
    }
    @keyframes tunnel {
        from { transform: translateZ(0) scale(1); opacity: 1; }
        to { transform: translateZ(-300px) scale(0.3); opacity: 0; }
    }
    @keyframes nebula {
        0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
        50% { transform: translate(10px, -10px) scale(1.1); opacity: 0.9; }
    }
    @keyframes circuit {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 1; }
    }
    @keyframes orb {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(20px, -20px) scale(1.1); }
    }
    @keyframes energyWave {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
    }
    @keyframes lightning {
        0%, 100% { opacity: 0; }
        10%, 20% { opacity: 1; }
    }
    @keyframes aurora {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
    @keyframes meshPulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
    }
    @keyframes batFly {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        25% { transform: translate(-30px, -20px) rotate(-15deg); }
        50% { transform: translate(-10px, -40px) rotate(0deg); }
        75% { transform: translate(30px, -20px) rotate(15deg); }
    }
    @keyframes ghostFloat {
        0%, 100% { transform: translateY(0) translateX(0); opacity: 0.85; }
        33% { transform: translateY(-15px) translateX(10px); opacity: 0.95; }
        66% { transform: translateY(-10px) translateX(-10px); opacity: 0.9; }
    }
    @keyframes pumpkinGlow {
        0%, 100% { filter: drop-shadow(0 0 10px rgba(255, 107, 53, 0.6)); opacity: 0.9; }
        50% { filter: drop-shadow(0 0 20px rgba(255, 107, 53, 0.9)); opacity: 1; }
    }
    @keyframes mistFloat {
        0%, 100% { transform: translateX(0) translateY(0); opacity: 0.3; }
        50% { transform: translateX(20px) translateY(-10px); opacity: 0.5; }
    }
    @keyframes starTwinkle {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
    }
`;
document.head.appendChild(style);

// Simple mouse follower - creates an SVG element that follows the mouse
let mouseFollower = null;

function createMouseFollower() {
    const svg = animationContainer.querySelector('.virtual-world-svg');
    if (!svg || mouseFollower) return;
    
    // Create a simple circle that follows the mouse
    mouseFollower = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    mouseFollower.setAttribute('r', '15');
    mouseFollower.setAttribute('fill', getThemeColorRandom());
    mouseFollower.setAttribute('opacity', '0.6');
    mouseFollower.setAttribute('class', 'mouse-follower');
    mouseFollower.style.pointerEvents = 'none';
    mouseFollower.style.transition = 'all 0.1s ease-out';
    
    // Add glow effect
    const defs = svg.querySelector('defs') || svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'defs'));
    let glowFilter = svg.querySelector('#mouseGlow');
    if (!glowFilter) {
        glowFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        glowFilter.id = 'mouseGlow';
        glowFilter.setAttribute('x', '-50%');
        glowFilter.setAttribute('y', '-50%');
        glowFilter.setAttribute('width', '200%');
        glowFilter.setAttribute('height', '200%');
        
        const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        feGaussianBlur.setAttribute('stdDeviation', '4');
        feGaussianBlur.setAttribute('result', 'coloredBlur');
        
        const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
        const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        feMergeNode1.setAttribute('in', 'coloredBlur');
        const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        feMergeNode2.setAttribute('in', 'SourceGraphic');
        
        feMerge.appendChild(feMergeNode1);
        feMerge.appendChild(feMergeNode2);
        glowFilter.appendChild(feGaussianBlur);
        glowFilter.appendChild(feMerge);
        defs.appendChild(glowFilter);
    }
    
    mouseFollower.setAttribute('filter', 'url(#mouseGlow)');
    svg.appendChild(mouseFollower);
    updateMouseFollower();
}

function updateMouseFollower() {
    if (!mouseFollower) return;
    
    const svg = animationContainer.querySelector('.virtual-world-svg');
    if (!svg) return;
    
    const svgRect = svg.getBoundingClientRect();
    const viewBox = svg.getAttribute('viewBox') || '0 0 800 500';
    const viewBoxValues = viewBox.split(' ').map(Number);
    
    // Convert mouse position to SVG coordinates
    const svgX = (mouseX / svgRect.width) * viewBoxValues[2];
    const svgY = (mouseY / svgRect.height) * viewBoxValues[3];
    
    mouseFollower.setAttribute('cx', svgX);
    mouseFollower.setAttribute('cy', svgY);
}

// Track mouse movement for follower
let mousemoveThrottle = null;
animationContainer.addEventListener('mousemove', (e) => {
    const rect = animationContainer.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    
    // Throttle updates for smooth following
    if (mousemoveThrottle) return;
    mousemoveThrottle = requestAnimationFrame(() => {
        updateMouseFollower();
        mousemoveThrottle = null;
    });
}, { passive: true });

animationContainer.addEventListener('mouseenter', () => {
    createMouseFollower();
});

animationContainer.addEventListener('mouseleave', () => {
    if (mouseFollower && mouseFollower.parentNode) {
        mouseFollower.parentNode.removeChild(mouseFollower);
        mouseFollower = null;
    }
});

// Create floating particles
function createFloatingParticles() {
    const container = document.getElementById('floating-particles');
    if (!container) return;
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        
        const size = Math.random() * 20 + 10;
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight;
        const delay = Math.random() * 15;
        const duration = 15 + Math.random() * 10;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${startX}px`;
        particle.style.top = `${startY}px`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        
        container.appendChild(particle);
    }
}

// Animate SVG background paths
function animateBackgroundSVG() {
    const paths = document.querySelectorAll('.bg-path-1, .bg-path-2, .bg-path-3');
    paths.forEach((path, index) => {
        let offset = 0;
        const animatePath = () => {
            offset += 0.5;
            const y1 = 200 + index * 200;
            const y2 = y1 + Math.sin(offset / 50) * 50;
            const y3 = y1 + Math.sin(offset / 50 + Math.PI / 3) * 50;
            
            if (index === 0) {
                path.setAttribute('d', `M0,${y1} Q300,${y2} 600,${y1} T1200,${y1}`);
            } else if (index === 1) {
                path.setAttribute('d', `M0,${y1} Q300,${y2} 600,${y3} T1200,${y1}`);
            } else {
                path.setAttribute('d', `M0,${y1} Q300,${y3} 600,${y1} T1200,${y2}`);
            }
            
            requestAnimationFrame(animatePath);
        };
        animatePath();
    });
}

// Add animated SVG decorations to buttons
function enhanceButtons() {
    const buttons = document.querySelectorAll('.control-btn');
    buttons.forEach(button => {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'button-svg');
        svg.setAttribute('viewBox', '0 0 100 100');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';
        svg.style.overflow = 'visible';
        
        // Create rotating circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '50');
        circle.setAttribute('cy', '50');
        circle.setAttribute('r', '45');
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', 'rgba(255, 255, 255, 0.3)');
        circle.setAttribute('stroke-width', '2');
        circle.setAttribute('stroke-dasharray', '5,5');
        circle.style.animation = 'rotate 10s linear infinite';
        
        svg.appendChild(circle);
        button.appendChild(svg);
    });
}

// Share button functionality
shareBtn.addEventListener('click', async () => {
    const shareableLink = getShareableLink(currentTrackIndex);
    const songName = getSongName(musicFiles[currentTrackIndex]);
    
    try {
        // Try Web Share API first (mobile devices)
        if (navigator.share) {
            await navigator.share({
                title: `${songName} - Marlín Lucas`,
                text: `Listen to "${songName}" by Marlín Lucas`,
                url: shareableLink
            });
            // Show notification even on share (some devices don't auto-show feedback)
            showShareNotification();
        } else {
            // Fallback to clipboard
            await navigator.clipboard.writeText(shareableLink);
            showShareNotification();
        }
    } catch (err) {
        // User cancelled share or other error - still try to copy
        if (err.name !== 'AbortError') {
            try {
                const textArea = document.createElement('textarea');
                textArea.value = shareableLink;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showShareNotification();
            } catch (e) {
                // Show link in alert as last resort
                alert(`Share this link:\n${shareableLink}`);
            }
        }
    }
    
    // Add button feedback animation
    shareBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        shareBtn.style.transform = '';
    }, 150);
});

function showShareNotification() {
    // Reset animation
    shareNotification.classList.remove('show');
    void shareNotification.offsetWidth; // Trigger reflow
    
    // Ensure checkmark and text are present
    if (!shareNotification.querySelector('.check-icon')) {
        shareNotification.innerHTML = `
            <svg class="check-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Link copied to clipboard! 🎵</span>
        `;
    }
    
    // Add show class with animation
    shareNotification.classList.add('show');
    
    // Animate checkmark
    const checkIcon = shareNotification.querySelector('.check-icon');
    if (checkIcon) {
        checkIcon.style.transform = 'scale(0) rotate(-180deg)';
        checkIcon.style.transition = 'none';
        setTimeout(() => {
            checkIcon.style.transition = 'transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            checkIcon.style.transform = 'scale(1) rotate(0deg)';
        }, 100);
    }
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        shareNotification.classList.remove('show');
    }, 3000);
}

// Listen for hash changes (back/forward buttons)
window.addEventListener('hashchange', () => {
    loadTrackFromHash();
});

// Update playlist items to include share icons
function initPlaylist() {
    playlistEl.innerHTML = '';
    musicFiles.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        if (index === currentTrackIndex) {
            item.classList.add('active');
        }
        
        const shareIcon = document.createElement('button');
        shareIcon.className = 'playlist-share-btn';
        shareIcon.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                <polyline points="16 6 12 2 8 6"></polyline>
                <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
        `;
        shareIcon.title = 'Share this song';
        shareIcon.addEventListener('click', async (e) => {
            e.stopPropagation();
            const shareableLink = getShareableLink(index);
            const songName = getSongName(file);
            
            // Button feedback
            shareIcon.style.transform = 'scale(0.8) rotate(15deg)';
            setTimeout(() => {
                shareIcon.style.transform = '';
            }, 200);
            
            try {
                if (navigator.share) {
                    await navigator.share({
                        title: `${songName} - Marlín Lucas`,
                        text: `Listen to "${songName}" by Marlín Lucas`,
                        url: shareableLink
                    });
                    showShareNotification();
                } else {
                    await navigator.clipboard.writeText(shareableLink);
                    showShareNotification();
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    const textArea = document.createElement('textarea');
                    textArea.value = shareableLink;
                    textArea.style.position = 'fixed';
                    textArea.style.opacity = '0';
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    showShareNotification();
                }
            }
        });
        
        const titleDiv = document.createElement('div');
        titleDiv.className = 'playlist-item-title';
        titleDiv.textContent = getSongName(file);
        
        const itemContent = document.createElement('div');
        itemContent.className = 'playlist-item-content';
        itemContent.appendChild(titleDiv);
        itemContent.appendChild(shareIcon);
        
        item.appendChild(itemContent);
        item.addEventListener('click', () => {
            currentTrackIndex = index;
            loadTrack(currentTrackIndex);
            updatePlaylistUI();
            enterFullscreen();
            if (!isPlaying) {
                audioPlayer.play();
                playPauseBtn.textContent = '⏸';
                visualizerPlayPauseBtn.textContent = '⏸';
                isPlaying = true;
                startCameraAnimation();
            }
        });
        playlistEl.appendChild(item);
    });
}

// Initialize
initPlaylist();

// Try to load track from URL hash, otherwise load first track
if (!loadTrackFromHash()) {
    loadTrack(0);
}

// Initialize Stripe - Disabled for now
async function initializeStripe() {
    // Stripe disabled - payments coming soon
    console.log('Stripe disabled - payments coming soon');
    stripe = null;
    stripePublishableKey = null;
}

// Download functionality - Coming Soon
downloadSingleBtn.addEventListener('click', () => {
    showDownloadNotification('Downloads coming soon! Check back later. 🎵', 'info');
});

downloadFullBtn.addEventListener('click', () => {
    showDownloadNotification('Downloads coming soon! Check back later. 🎵', 'info');
});

async function initiatePayment(isFullPackage) {
    if (currentTrackIndex < 0 || currentTrackIndex >= musicFiles.length) return;
    
    const track = musicFiles[currentTrackIndex];
    const songName = getSongName(track);
    
    // If Stripe is not configured, use direct download (testing mode)
    if (!stripe || !stripePublishableKey || stripePublishableKey.includes('your_')) {
        showDownloadNotification('Stripe not configured. Using direct download for testing.');
        directDownload(track, songName, isFullPackage);
        return;
    }
    
    try {
        showDownloadNotification('Processing payment...', 'info');
        
        // Create payment intent
        const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                songIndex: currentTrackIndex,
                songName: songName,
                packageType: isFullPackage ? 'full' : 'single'
            }),
        });
        
        const { clientSecret, error } = await response.json();
        
        if (error) {
            throw new Error(error);
        }
        
        // Show payment form
        showPaymentForm(clientSecret, songName, isFullPackage);
    } catch (error) {
        console.error('Payment error:', error);
        // Fallback to payment form
        try {
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    songIndex: currentTrackIndex,
                    songName: songName,
                    packageType: isFullPackage ? 'full' : 'single'
                }),
            });
            
            const { clientSecret } = await response.json();
            showPaymentForm(clientSecret, songName, isFullPackage);
        } catch (err) {
            showDownloadNotification('Payment processing error. Please try again.', 'error');
        }
    }
}

function showPaymentForm(clientSecret, songName, isFullPackage) {
    // Create payment modal
    const modal = document.createElement('div');
    modal.className = 'payment-modal';
    modal.innerHTML = `
        <div class="payment-modal-content">
            <div class="payment-modal-header">
                <h3>Complete Payment</h3>
                <button class="payment-modal-close">&times;</button>
            </div>
            <div class="payment-modal-body">
                <p>Pay ${isFullPackage ? '$10.00' : '$5.00'} for ${songName}</p>
                <form id="payment-form">
                    <div id="card-element"></div>
                    <div id="card-errors" role="alert"></div>
                    <button type="submit" class="payment-submit-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 6H9l-4-4H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z"></path>
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                        Pay ${isFullPackage ? '$10.00' : '$5.00'}
                    </button>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize Stripe Elements
    const elements = stripe.elements();
    const cardElement = elements.create('card', {
        style: {
            base: {
                fontSize: '16px',
                color: '#4A2C1A',
                fontFamily: 'Segoe UI, sans-serif',
                '::placeholder': {
                    color: '#8B4513',
                },
            },
        },
    });
    
    cardElement.mount('#card-element');
    
    cardElement.on('change', ({error}) => {
        const displayError = document.getElementById('card-errors');
        if (error) {
            displayError.textContent = error.message;
        } else {
            displayError.textContent = '';
        }
    });
    
    // Handle form submission
    const form = document.getElementById('payment-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('.payment-submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
        
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
            },
        });
        
        if (error) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `Pay ${isFullPackage ? '$10.00' : '$5.00'}`;
            document.getElementById('card-errors').textContent = error.message;
        } else if (paymentIntent.status === 'succeeded') {
            document.body.removeChild(modal);
            await handleSuccessfulPayment(paymentIntent.id, songName, isFullPackage);
        }
    });
    
    // Close modal
    modal.querySelector('.payment-modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

async function handleSuccessfulPayment(paymentId, songName, isFullPackage) {
    showDownloadNotification('Payment successful! Downloading...', 'success');
    
    // Download the file
    try {
        const response = await fetch(`/api/download/${paymentId}`);
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${songName}.wav`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            if (isFullPackage) {
                showDownloadNotification('Full package purchased! WAV downloaded. Lyrics & stems coming soon!', 'success');
                const lyricsStems = document.getElementById('lyrics-stems-signup');
                if (lyricsStems) {
                    setTimeout(() => {
                        lyricsStems.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 500);
                }
            } else {
                showDownloadNotification('Payment successful! Song downloaded! 🎵', 'success');
            }
        } else {
            throw new Error('Download failed');
        }
    } catch (error) {
        // Fallback to direct download
        directDownload(musicFiles[currentTrackIndex], songName, isFullPackage);
        showDownloadNotification('Payment successful! If download didn\'t start, use the payment issue form below.', 'info');
    }
}

function directDownload(track, songName, isFullPackage) {
    const link = document.createElement('a');
    link.href = track;
    link.download = `${songName}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function showDownloadNotification(message, type = 'success') {
    const icon = type === 'error' ? 
        `<svg class="check-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>` :
        type === 'info' ?
        `<svg class="check-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>` :
        `<svg class="check-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>`;
    
    shareNotification.innerHTML = `${icon}<span>${message}</span>`;
    shareNotification.classList.remove('show');
    void shareNotification.offsetWidth;
    shareNotification.classList.add('show');
    
    const timeout = type === 'error' ? 5000 : 4000;
    setTimeout(() => {
        shareNotification.classList.remove('show');
    }, timeout);
}

// Email signup for lyrics and stems
emailSignupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    if (!email || !isValidEmail(email)) {
        showEmailNotification('Please enter a valid email address.', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: email,
                type: 'lyrics_stems'
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showEmailNotification('✓ You\'re on the list! We\'ll notify you when lyrics & stems are available.', 'success');
            emailInput.value = '';
        } else {
            showEmailNotification('Error subscribing. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Subscribe error:', error);
        showEmailNotification('Error subscribing. Please try again.', 'error');
    }
});

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showEmailNotification(message, type = 'success') {
    emailNotification.textContent = message;
    emailNotification.className = `email-notification ${type}`;
    emailNotification.style.display = 'block';
    
    setTimeout(() => {
        emailNotification.style.opacity = '0';
        setTimeout(() => {
            emailNotification.style.display = 'none';
            emailNotification.style.opacity = '1';
        }, 300);
    }, 3000);
}

// Donation functionality - Coming Soon
donateBtn.addEventListener('click', () => {
    showDownloadNotification('Donations coming soon! Check back later. ❤️', 'info');
});

async function initiateDonation() {
    // If Stripe is not configured, show message
    if (!stripe || !stripePublishableKey || stripePublishableKey.includes('your_')) {
        showDownloadNotification('Donation feature requires Stripe configuration.', 'info');
        return;
    }
    
    // Show donation amount selector
    const amount = prompt('Enter donation amount (minimum $1.00):', '5.00');
    if (!amount) return;
    
    const donationAmount = Math.round(parseFloat(amount) * 100);
    const minAmount = 100; // $1.00
    
    if (isNaN(donationAmount) || donationAmount < minAmount) {
        showDownloadNotification('Minimum donation is $1.00', 'error');
        return;
    }
    
    try {
        showDownloadNotification('Processing donation...', 'info');
        
        const response = await fetch('/api/create-donation-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: donationAmount
            }),
        });
        
        const { clientSecret, error } = await response.json();
        
        if (error) {
            throw new Error(error);
        }
        
        // Show donation payment form
        showDonationForm(clientSecret, donationAmount);
    } catch (error) {
        console.error('Donation error:', error);
        showDownloadNotification('Error processing donation. Please try again.', 'error');
    }
}

function showDonationForm(clientSecret, amount) {
    const modal = document.createElement('div');
    modal.className = 'payment-modal';
    modal.innerHTML = `
        <div class="payment-modal-content">
            <div class="payment-modal-header">
                <h3>Support Marlín Lucas</h3>
                <button class="payment-modal-close">&times;</button>
            </div>
            <div class="payment-modal-body">
                <p class="donation-amount">Donation Amount: $${(amount / 100).toFixed(2)}</p>
                <p class="donation-message">Thank you for supporting independent music! 🎵</p>
                <form id="donation-form">
                    <div id="donation-card-element"></div>
                    <div id="donation-card-errors" role="alert"></div>
                    <button type="submit" class="payment-submit-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        Donate $${(amount / 100).toFixed(2)}
                    </button>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const elements = stripe.elements();
    const cardElement = elements.create('card', {
        style: {
            base: {
                fontSize: '16px',
                color: '#4A2C1A',
                fontFamily: 'Segoe UI, sans-serif',
            },
        },
    });
    
    cardElement.mount('#donation-card-element');
    
    cardElement.on('change', ({error}) => {
        const displayError = document.getElementById('donation-card-errors');
        if (error) {
            displayError.textContent = error.message;
        } else {
            displayError.textContent = '';
        }
    });
    
    const form = document.getElementById('donation-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('.payment-submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
        
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
            },
        });
        
        if (error) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `Donate $${(amount / 100).toFixed(2)}`;
            document.getElementById('donation-card-errors').textContent = error.message;
        } else if (paymentIntent.status === 'succeeded') {
            document.body.removeChild(modal);
            showDownloadNotification(`Thank you for your $${(amount / 100).toFixed(2)} donation! Your support means the world! ❤️`, 'success');
        }
    });
    
    modal.querySelector('.payment-modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Payment issue form - Contact form
paymentIssueForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = paymentIssueEmail.value.trim();
    if (!email || !isValidEmail(email)) {
        showPaymentIssueNotification('Please enter a valid email address.', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email: email,
                type: 'contact'
            }),
        });
        
        const result = await response.json();
        
        if (result.success) {
            showPaymentIssueNotification('✓ Message sent! We\'ll get back to you soon.', 'success');
            paymentIssueEmail.value = '';
        } else {
            showPaymentIssueNotification('Error sending message. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Contact error:', error);
        showPaymentIssueNotification('Error sending message. Please try again.', 'error');
    }
});

function showPaymentIssueNotification(message, type = 'success') {
    paymentIssueNotification.textContent = message;
    paymentIssueNotification.className = `email-notification ${type}`;
    paymentIssueNotification.style.display = 'block';
    
    setTimeout(() => {
        paymentIssueNotification.style.opacity = '0';
        setTimeout(() => {
            paymentIssueNotification.style.display = 'none';
            paymentIssueNotification.style.opacity = '1';
        }, 300);
    }, 4000);
}

// Fullscreen functionality
function enterFullscreen() {
    if (!visualizerSection) return;
    
    isFullscreen = true;
    visualizerSection.classList.add('fullscreen');
    document.body.style.overflow = 'hidden';
    
    // Update visualizer info
    updateVisualizerInfo();
    
    // Hide overlay initially, show on hover/move
    setTimeout(() => {
        visualizerOverlay.style.display = 'none';
    }, 2000);
}

function exitFullscreen() {
    if (!visualizerSection) return;
    
    isFullscreen = false;
    visualizerSection.classList.remove('fullscreen');
    document.body.style.overflow = '';
    visualizerOverlay.style.display = 'none';
}

// Visualizer controls
visualizerPrevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentTrackIndex > 0) {
        loadTrack(currentTrackIndex - 1);
        updatePlaylistUI();
        updateVisualizerInfo();
    }
});

visualizerNextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentTrackIndex < musicFiles.length - 1) {
        loadTrack(currentTrackIndex + 1);
        updatePlaylistUI();
        updateVisualizerInfo();
    }
});

visualizerPlayPauseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    playPauseBtn.click();
});

exitFullscreenBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    exitFullscreen();
});

visualizerLyricsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showLyrics();
});

// Show overlay on mouse move in fullscreen
let hideOverlayTimeout;
visualizerSection.addEventListener('mousemove', () => {
    if (isFullscreen) {
        visualizerOverlay.style.display = 'flex';
        clearTimeout(hideOverlayTimeout);
        hideOverlayTimeout = setTimeout(() => {
            visualizerOverlay.style.display = 'none';
        }, 3000);
    }
});

// Update visualizer info
function updateVisualizerInfo() {
    if (visualizerTrackName && currentTrackIndex >= 0 && currentTrackIndex < musicFiles.length) {
        visualizerTrackName.textContent = getSongName(musicFiles[currentTrackIndex]);
    }
    if (visualizerPlayPauseBtn) {
        visualizerPlayPauseBtn.textContent = isPlaying ? '⏸' : '▶';
    }
}

// Sync visualizer time display
setInterval(() => {
    if (isFullscreen && visualizerCurrentTime && visualizerTotalTime) {
        visualizerCurrentTime.textContent = formatTime(audioPlayer.currentTime);
        visualizerTotalTime.textContent = formatTime(audioPlayer.duration);
    }
}, 100);

// Update visualizer when play/pause changes
playPauseBtn.addEventListener('click', () => {
    setTimeout(() => {
        updateVisualizerInfo();
    }, 100);
});


// Shuffle button functionality
shuffleBtn.addEventListener('click', async () => {
    // Pick a random song
    const randomIndex = Math.floor(Math.random() * musicFiles.length);
    currentTrackIndex = randomIndex;
    
    // Load and play the random song
    loadTrack(randomIndex);
    
    // Enter fullscreen for immersive experience
    enterFullscreen();
    
    // Play the song
    try {
        await audioPlayer.play();
        playPauseBtn.textContent = '⏸';
        visualizerPlayPauseBtn.textContent = '⏸';
        isPlaying = true;
        startCameraAnimation();
        
        // Scroll to top to show visualizer
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('Error playing shuffled song:', error);
    }
    
    // Add visual feedback
    shuffleBtn.style.transform = 'rotate(360deg) scale(1.1)';
    setTimeout(() => {
        shuffleBtn.style.transform = '';
    }, 600);
});

// Lyrics button functionality
if (lyricsBtn) {
    lyricsBtn.addEventListener('click', () => {
        showLyrics();
    });
}

// Close lyrics modal
if (lyricsCloseBtn) {
    lyricsCloseBtn.addEventListener('click', () => {
        hideLyrics();
    });
}

// Close lyrics modal on backdrop click
if (lyricsModal) {
    lyricsModal.addEventListener('click', (e) => {
        if (e.target === lyricsModal) {
            hideLyrics();
        }
    });
}

// Close lyrics modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lyricsModal && lyricsModal.classList.contains('show')) {
        hideLyrics();
    }
});

// Initialize Stripe on load
initializeStripe();

// Initialize audio visualizer on page load
// Initialize static animations
createFloatingParticles();
animateBackgroundSVG();
enhanceButtons();

