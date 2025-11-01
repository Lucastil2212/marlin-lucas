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
    createAnimation(index).then(() => {
        // Ensure SVG is visible after creation
        requestAnimationFrame(() => {
            const svg = animationContainer.querySelector('.virtual-world-svg');
            if (svg) {
                ensureSVGSize(svg);
            }
        });
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
                await createAnimation(currentTrackIndex);
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

async function createAnimation(index) {
    // PERFORMANCE FIX: Stop all animations before creating new one
    stopCameraAnimation();
    
    // Clear element data cache when creating new animation
    elementData = new WeakMap();
    
    const songName = getSongName(musicFiles[index]);
    let svg;
    
    // Get visualizer mapping for this song
    const visualizerConfig = await getVisualizerForSong(index);
    
    if (visualizerConfig) {
        // Use mapped visualizer
        if (visualizerConfig.customFunction) {
            // Custom function (like Halloween)
            switch (visualizerConfig.customFunction) {
                case 'createHalloween':
                    svg = createHalloween(index);
                    break;
                case 'createLluvia':
                    svg = createLluvia(index, visualizerConfig.params);
                    break;
                case 'createBerlin':
                    svg = createBerlin(index, visualizerConfig.params);
                    break;
                default:
                    // Fall through to visualizer name
                    break;
            }
        }
        
        // If no custom function or custom function didn't match, use visualizer name
        if (!svg && visualizerConfig.visualizer) {
            // Find visualizer function by name
            let visualizerFunc = null;
            
            // Try to find in animationFunctions array
            const funcIndex = animationFunctions.findIndex(f => f.name === visualizerConfig.visualizer);
            if (funcIndex !== -1) {
                visualizerFunc = animationFunctions[funcIndex];
            } else {
                // Try window object (for functions defined globally)
                visualizerFunc = window[visualizerConfig.visualizer];
            }
            
            if (typeof visualizerFunc === 'function') {
                // Call with params if available
                svg = visualizerConfig.params 
                    ? visualizerFunc(index, visualizerConfig.params)
                    : visualizerFunc(index);
            }
        }
    }
    
    // Fallback to Halloween or index-based assignment
    if (!svg) {
        if (songName.toLowerCase() === 'halloween') {
            svg = createHalloween(index);
        } else {
            // Each song gets a unique virtual world experience
            // Map each song to its own animation for a truly unique experience
            const funcIndex = index % animationFunctions.length;
            svg = animationFunctions[funcIndex](index);
        }
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

// ============================================
// LYRICS-BASED VISUALIZER MAPPING SYSTEM
// ============================================

// Analyze lyrics to extract themes, keywords, and emotions
async function analyzeLyrics(songIndex) {
    if (songIndex < 0 || songIndex >= musicFiles.length) return null;
    
    try {
        const lyrics = await loadLyrics(songIndex);
        if (!lyrics) return null;
        
        const lyricsLower = lyrics.toLowerCase();
        
        // Extract themes and keywords
        const themes = {
            // Nature & Weather
            rain: lyricsLower.includes('lluvia') || lyricsLower.includes('rain') || lyricsLower.includes('agua') || lyricsLower.includes('agua'),
            snow: lyricsLower.includes('nieve') || lyricsLower.includes('snow') || lyricsLower.includes('invierno') || lyricsLower.includes('winter'),
            wind: lyricsLower.includes('viento') || lyricsLower.includes('wind') || lyricsLower.includes('brisa') || lyricsLower.includes('breeze'),
            fire: lyricsLower.includes('fuego') || lyricsLower.includes('fire') || lyricsLower.includes('fogata') || lyricsLower.includes('campfire'),
            
            // Locations & Places
            city: lyricsLower.includes('ciudad') || lyricsLower.includes('city') || lyricsLower.includes('berlín') || lyricsLower.includes('berlin'),
            nature: lyricsLower.includes('bosque') || lyricsLower.includes('montaña') || lyricsLower.includes('mountain') || lyricsLower.includes('sierras') || lyricsLower.includes('rancho'),
            ocean: lyricsLower.includes('playa') || lyricsLower.includes('beach') || lyricsLower.includes('mar') || lyricsLower.includes('sea'),
            
            // Animals
            lion: lyricsLower.includes('león') || lyricsLower.includes('lion'),
            animal: lyricsLower.includes('elefante') || lyricsLower.includes('cebra') || lyricsLower.includes('caballo') || lyricsLower.includes('horse'),
            
            // Emotions & Moods
            melancholic: lyricsLower.includes('triste') || lyricsLower.includes('sad') || lyricsLower.includes('dolor') || lyricsLower.includes('pain') || lyricsLower.includes('vacío') || lyricsLower.includes('empty'),
            energetic: lyricsLower.includes('rápido') || lyricsLower.includes('fast') || lyricsLower.includes('alto') || lyricsLower.includes('high') || lyricsLower.includes('energía'),
            chill: lyricsLower.includes('chill') || lyricsLower.includes('chilo') || lyricsLower.includes('tranquilo') || lyricsLower.includes('calm'),
            love: lyricsLower.includes('amor') || lyricsLower.includes('love') || lyricsLower.includes('corazón') || lyricsLower.includes('heart'),
            dark: lyricsLower.includes('oscuro') || lyricsLower.includes('dark') || lyricsLower.includes('noche') || lyricsLower.includes('night') || lyricsLower.includes('sistema'),
            cosmic: lyricsLower.includes('estrella') || lyricsLower.includes('star') || lyricsLower.includes('cielo') || lyricsLower.includes('sky'),
            
            // Actions & Movement
            disappear: lyricsLower.includes('desaparecer') || lyricsLower.includes('disappear'),
            destroy: lyricsLower.includes('destruir') || lyricsLower.includes('destroy') || lyricsLower.includes('derrumbe'),
            movement: lyricsLower.includes('corriendo') || lyricsLower.includes('running') || lyricsLower.includes('volando') || lyricsLower.includes('flying'),
        };
        
        return {
            lyrics,
            themes,
            hasContent: lyrics.length > 0
        };
    } catch (error) {
        console.error('Error analyzing lyrics:', error);
        return null;
    }
}

// Comprehensive song-to-visualizer mapping based on lyrical themes
const songVisualizerMapping = {
    // Weather & Nature
    'Lluvia': {
        visualizer: 'createLluvia',
        customFunction: 'createLluvia',
        params: { 
            theme: 'water',
            colors: ['#4A90E2', '#5BA3F5', '#6BB6FF', '#7CC7FF', '#8DD8FF'], // Blues
            intensity: 'medium',
            elements: 'rain_drops'
        }
    },
    'Invierno': {
        visualizer: 'createAurora',
        customFunction: null,
        params: {
            theme: 'winter',
            colors: ['#E8F4F8', '#D1E9F1', '#BAE0EA', '#A3D7E3', '#8CCEDC'], // Winter blues/whites
            intensity: 'calm',
            elements: 'snowflakes'
        }
    },
    'Brisa': {
        visualizer: 'createFlowingLines',
        customFunction: null,
        params: {
            theme: 'wind',
            colors: ['#FFE4B5', '#FFE5C4', '#FFE6D3', '#FFE7E2', '#FFE8F1'], // Soft pastels
            intensity: 'gentle',
            elements: 'wind_lines'
        }
    },
    
    // Cities & Places
    'Berlín': {
        visualizer: 'createBerlin',
        customFunction: 'createBerlin',
        params: {
            theme: 'northern_city',
            colors: ['#4A5568', '#5A6578', '#6A7588', '#7A8598', '#8A95A8'], // Cool grays with aurora hints
            intensity: 'medium',
            elements: 'aurora_winter'
        }
    },
    'En el rancho': {
        visualizer: 'createFractalTree',
        customFunction: null,
        params: {
            theme: 'nature',
            colors: ['#2D5016', '#3D7026', '#4D9036', '#5DB046', '#6DD056'], // Greens
            intensity: 'natural',
            elements: 'trees_nature'
        }
    },
    'India': {
        visualizer: 'createKaleidoscope',
        customFunction: null,
        params: {
            theme: 'vibrant',
            colors: ['#FF6B35', '#F7931E', '#FFD93D', '#6BCF7F', '#4ECDC4'], // Vibrant multicultural
            intensity: 'high',
            elements: 'patterns'
        }
    },
    'Estambul Turquía': {
        visualizer: 'createHexagonPattern',
        customFunction: null,
        params: {
            theme: 'architectural',
            colors: ['#8B6F47', '#9B7F57', '#AB8F67', '#BB9F77', '#CBAF87'], // Warm earth tones
            intensity: 'medium',
            elements: 'geometric'
        }
    },
    
    // Animals
    'El León': {
        visualizer: 'createEnergyWaves',
        customFunction: null,
        params: {
            theme: 'power',
            colors: ['#FF9500', '#FFB84D', '#FFC857', '#FFD96B', '#FFEA7F'], // Powerful oranges
            intensity: 'strong',
            elements: 'energy_power'
        }
    },
    
    // Emotions & Moods
    'CHILL': {
        visualizer: 'createRippleEffect',
        customFunction: null,
        params: {
            theme: 'calm',
            colors: ['#A8E6CF', '#C8F5E9', '#E8FFE9', '#F0FFF0', '#F5FFF5'], // Calm greens
            intensity: 'gentle',
            elements: 'smooth_ripples'
        }
    },
    'Desaparecer': {
        visualizer: 'createTunnel',
        customFunction: null,
        params: {
            theme: 'fading',
            colors: ['#2C3E50', '#34495E', '#3C4E62', '#445366', '#4C586A'], // Dark fading
            intensity: 'melancholic',
            elements: 'tunnel_disappear'
        }
    },
    'Destruir el Sistema': {
        visualizer: 'createLightning',
        customFunction: null,
        params: {
            theme: 'chaos',
            colors: ['#8B0000', '#A52A2A', '#DC143C', '#FF4500', '#FF6347'], // Dark reds
            intensity: 'chaotic',
            elements: 'lightning_chaos'
        }
    },
    'FAST!': {
        visualizer: 'createVectorField',
        customFunction: null,
        params: {
            theme: 'speed',
            colors: ['#FF0000', '#FF4500', '#FF8C00', '#FFA500', '#FFD700'], // Fast reds/oranges
            intensity: 'high',
            elements: 'speed_lines'
        }
    },
    'Harmonizing at the Campfire': {
        visualizer: 'createFireworks',
        customFunction: null,
        params: {
            theme: 'celebration',
            colors: ['#FF6B35', '#F7931E', '#FFC857', '#FFD93D', '#FFE87F'], // Warm fire colors
            intensity: 'medium',
            elements: 'fire_sparks'
        }
    },
    'Nunca vuelvo a California': {
        visualizer: 'createNebula',
        customFunction: null,
        params: {
            theme: 'distant',
            colors: ['#4A5568', '#5A6578', '#6A7588', '#7A8598', '#8A95A8'], // Distant grays
            intensity: 'melancholic',
            elements: 'distant_space'
        }
    },
    
    // Special/Unique
    'Halloween': {
        visualizer: 'createHalloween',
        customFunction: 'createHalloween',
        params: {
            theme: 'halloween',
            colors: ['#FF6B35', '#F7931E', '#8B4513', '#4B0082', '#800080'],
            intensity: 'spooky',
            elements: 'halloween'
        }
    },
    
    // Additional Songs
    'los policías': {
        visualizer: 'createSoundWaves',
        customFunction: null,
        params: {
            theme: 'urban_energy',
            colors: ['#FF9500', '#FFB84D', '#FFC857', '#FFD96B', '#FFEA7F'],
            intensity: 'high',
            elements: 'sound_waves'
        }
    },
    'Chingón': {
        visualizer: 'createStarField',
        customFunction: null,
        params: {
            theme: 'confidence',
            colors: ['#FFD700', '#FFA500', '#FF8C00', '#FF7F50', '#FF6347'], // Golden/yellow - confidence
            intensity: 'strong',
            elements: 'stars_glory'
        }
    },
    'Corrido para cantar': {
        visualizer: 'createFireworks',
        customFunction: null,
        params: {
            theme: 'celebration',
            colors: ['#FF6B35', '#F7931E', '#FFC857', '#FFD93D', '#FFE87F'], // Warm celebration colors
            intensity: 'high',
            elements: 'fireworks_celebration'
        }
    },
    'Me ahogo en alcohol': {
        visualizer: 'createLiquid',
        customFunction: null,
        params: {
            theme: 'drowning',
            colors: ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#8b5a9f'], // Dark purple/blue - drowning
            intensity: 'dark',
            elements: 'alcohol_waves'
        }
    },
    'Look at Me Now': {
        visualizer: 'createKaleidoscope',
        customFunction: null,
        params: {
            theme: 'reflection',
            colors: ['#FFB84D', '#FFC857', '#FFD96B', '#FFEA7F', '#FFF4A3'], // Reflective golds
            intensity: 'medium',
            elements: 'mirror_reflection'
        }
    },
    'Loving You Is Easy': {
        visualizer: 'createFloatingCircles',
        customFunction: null,
        params: {
            theme: 'romantic',
            colors: ['#FFB6C1', '#FFA8D5', '#FF9DD1', '#FF8FC7', '#FF81BD'], // Soft pinks - love
            intensity: 'gentle',
            elements: 'floating_love'
        }
    },
    'Mi religión': {
        visualizer: 'createSolarSystem',
        customFunction: null,
        params: {
            theme: 'spiritual',
            colors: ['#FFD700', '#FFA500', '#FF8C00', '#9370DB', '#8A2BE2'], // Gold and purple - spiritual
            intensity: 'celestial',
            elements: 'solar_system'
        }
    },
    'Nunca Olvidaré Aquella Noche': {
        visualizer: 'createStarField',
        customFunction: null,
        params: {
            theme: 'nostalgic_night',
            colors: ['#1a1a2e', '#16213e', '#0f3460', '#E8E8E8', '#FFFFFF'], // Night sky with stars
            intensity: 'romantic',
            elements: 'night_stars'
        }
    },
    'Odio cuando no estás aquí': {
        visualizer: 'createNebula',
        customFunction: null,
        params: {
            theme: 'longing',
            colors: ['#2C3E50', '#34495E', '#7F8C8D', '#95A5A6', '#BDC3C7'], // Gray nebula - missing
            intensity: 'melancholic',
            elements: 'distant_nebula'
        }
    },
    'Paysundú': {
        visualizer: 'createGeometricShapes',
        customFunction: null,
        params: {
            theme: 'city_beauty',
            colors: ['#FF6B9D', '#C44569', '#F8B500', '#F97F51', '#F8B500'], // Vibrant city colors
            intensity: 'medium',
            elements: 'city_geometry'
        }
    },
    'Pecadores': {
        visualizer: 'createLightning',
        customFunction: null,
        params: {
            theme: 'sin_dark',
            colors: ['#1a1a2e', '#16213e', '#0f3460', '#DC143C', '#8B0000'], // Dark reds - sin/hell
            intensity: 'dark',
            elements: 'lightning_sin'
        }
    },
    'Si el cielo cae': {
        visualizer: 'createStarField',
        customFunction: null,
        params: {
            theme: 'sky_falling',
            colors: ['#4169E1', '#6495ED', '#87CEEB', '#B0C4DE', '#E0E6FF'], // Sky blues
            intensity: 'eternal',
            elements: 'falling_sky'
        }
    },
    'Siempre traigo cruz': {
        visualizer: 'createSolarSystem',
        customFunction: null,
        params: {
            theme: 'faith',
            colors: ['#FFD700', '#FFA500', '#FFFFFF', '#F5F5DC', '#FFFAF0'], // Gold and white - faith
            intensity: 'spiritual',
            elements: 'celestial_faith'
        }
    },
    'Soy Quien Soy': {
        visualizer: 'createOrbs',
        customFunction: null,
        params: {
            theme: 'identity',
            colors: ['#FF9500', '#FFB84D', '#FFC857', '#FFD96B', '#FFEA7F'], // Warm identity colors
            intensity: 'medium',
            elements: 'identity_orbs'
        }
    },
    'Te Dejo Mi Amor': {
        visualizer: 'createSpiralPattern',
        customFunction: null,
        params: {
            theme: 'goodbye',
            colors: ['#DDA0DD', '#DA70D6', '#BA55D3', '#9370DB', '#8B7FAF'], // Purple fading - goodbye
            intensity: 'melancholic',
            elements: 'spiral_goodbye'
        }
    },
    'Trust': {
        visualizer: 'createRippleEffect',
        customFunction: null,
        params: {
            theme: 'trust',
            colors: ['#4169E1', '#6495ED', '#87CEEB', '#B0C4DE', '#E0E6FF'], // Trusting blues
            intensity: 'calm',
            elements: 'trust_ripples'
        }
    },
    'Un Beso Más Antes de Irme': {
        visualizer: 'createMetaballs',
        customFunction: null,
        params: {
            theme: 'passion',
            colors: ['#FF1493', '#FF69B4', '#FFB6C1', '#FFA8D5', '#FF9DD1'], // Passionate pinks/reds
            intensity: 'romantic',
            elements: 'passion_blobs'
        }
    },
    'De nuevo tropiezo': {
        visualizer: 'createVectorField',
        customFunction: null,
        params: {
            theme: 'stumbling',
            colors: ['#5A5A5A', '#6A6A6A', '#7A7A7A', '#8A8A8A', '#9A9A9A'], // Gray confusion
            intensity: 'disorienting',
            elements: 'stumbling_vectors'
        }
    },
    
    // Default fallbacks for unmapped songs
    // These will use enhanced versions of existing visualizers
};

// Get visualizer for a song based on lyrics analysis
async function getVisualizerForSong(songIndex) {
    if (songIndex < 0 || songIndex >= musicFiles.length) {
        return null;
    }
    
    const songName = getSongName(musicFiles[songIndex]);
    const songNameLower = songName.toLowerCase();
    
    // First, check exact mapping
    if (songVisualizerMapping[songName]) {
        return songVisualizerMapping[songName];
    }
    
    // Then check case-insensitive
    for (const [key, value] of Object.entries(songVisualizerMapping)) {
        if (key.toLowerCase() === songNameLower) {
            return value;
        }
    }
    
    // If no exact match, analyze lyrics and suggest based on themes
    const analysis = await analyzeLyrics(songIndex);
    if (analysis && analysis.themes) {
        const themes = analysis.themes;
        
        // Prioritize theme-based selection
        if (themes.rain) return { visualizer: 'createLiquid', params: { theme: 'water' } };
        if (themes.snow || themes.winter) return { visualizer: 'createAurora', params: { theme: 'winter' } };
        if (themes.wind) return { visualizer: 'createFlowingLines', params: { theme: 'wind' } };
        if (themes.fire) return { visualizer: 'createFireworks', params: { theme: 'fire' } };
        if (themes.city) return { visualizer: 'createGeometricShapes', params: { theme: 'urban' } };
        if (themes.nature) return { visualizer: 'createFractalTree', params: { theme: 'nature' } };
        if (themes.lion) return { visualizer: 'createEnergyWaves', params: { theme: 'power' } };
        if (themes.energetic) return { visualizer: 'createVectorField', params: { theme: 'speed' } };
        if (themes.chill) return { visualizer: 'createRippleEffect', params: { theme: 'calm' } };
        if (themes.dark || themes.destroy) return { visualizer: 'createLightning', params: { theme: 'dark' } };
        if (themes.cosmic) return { visualizer: 'createStarField', params: { theme: 'cosmic' } };
        if (themes.melancholic || themes.disappear) return { visualizer: 'createTunnel', params: { theme: 'fading' } };
    }
    
    // Fallback to index-based (for unmapped songs)
    return null;
}

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

function createGeometricShapes(index, params = null) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    svg.style.transform = 'perspective(1500px) rotateY(-10deg)';
    svg.style.transformStyle = 'preserve-3d';
    
    // Use custom colors if provided, otherwise use theme colors
    const getColor = params && params.colors 
        ? (i) => params.colors[i % params.colors.length]
        : (i) => getThemeColor(i * 25);
    
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
        rect.setAttribute('fill', getColor(i));
        rect.setAttribute('stroke', getColor(i));
        rect.setAttribute('stroke-width', '2');
        const rotation = i * 12;
        rect.style.transform = `translateZ(${z}px) rotateZ(${rotation}deg) rotateY(${z / 10}deg)`;
        rect.style.opacity = 0.85 + (z + 120) / 240 * 0.15;
        rect.style.animation = `rotate3D ${8 + i * 0.3}s linear infinite`;
        svg.appendChild(rect);
    }
    
    // City beauty elements (from "Paysundú" - lyrics about beauty, city, love)
    // Crown/queen symbols (from lyrics: "reina de belleza")
    for (let i = 0; i < 6; i++) {
        const crownX = 120 + (i % 3) * 250;
        const crownY = 120 + Math.floor(i / 3) * 250;
        
        // Crown shape
        const crown = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const crownPath = `M ${crownX - 30} ${crownY + 20}
                          L ${crownX - 30} ${crownY - 5}
                          L ${crownX - 20} ${crownY - 15}
                          L ${crownX - 10} ${crownY - 10}
                          L ${crownX} ${crownY - 20}
                          L ${crownX + 10} ${crownY - 10}
                          L ${crownX + 20} ${crownY - 15}
                          L ${crownX + 30} ${crownY - 5}
                          L ${crownX + 30} ${crownY + 20} Z`;
        crown.setAttribute('d', crownPath);
        crown.setAttribute('fill', getColor(i * 2));
        crown.setAttribute('opacity', '0.9');
        crown.setAttribute('stroke', getColor(i * 2 + 1));
        crown.setAttribute('stroke-width', '2');
        crown.style.filter = 'drop-shadow(0 0 15px rgba(255, 107, 157, 0.8))';
        crown.style.animation = `crownShine ${3 + i * 0.3}s ease-in-out infinite`;
        svg.appendChild(crown);
    }
    
    // Hearts floating (from lyrics about love and beauty)
    for (let i = 0; i < 12; i++) {
        const heart = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const x = Math.random() * 800;
        const y = Math.random() * 500;
        const size = 10 + Math.random() * 15;
        
        const heartPath = `M ${x} ${y + size * 0.3}
                          C ${x - size * 0.5} ${y} ${x - size} ${y + size * 0.2} ${x - size * 0.5} ${y + size * 0.5}
                          C ${x} ${y + size * 0.2} ${x + size * 0.5} ${y + size * 0.2} ${x + size * 0.5} ${y + size * 0.5}
                          C ${x + size} ${y + size * 0.2} ${x + size * 0.5} ${y} ${x} ${y + size * 0.3} Z`;
        heart.setAttribute('d', heartPath);
        heart.setAttribute('fill', getColor(i));
        heart.setAttribute('opacity', '0.8');
        heart.style.filter = 'drop-shadow(0 0 10px rgba(255, 107, 157, 0.7))';
        heart.style.animation = `beautyFloat ${4 + Math.random() * 2}s ease-in-out infinite`;
        heart.style.animationDelay = `${Math.random() * 1}s`;
        svg.appendChild(heart);
    }
    
    // City building silhouettes
    for (let i = 0; i < 8; i++) {
        const buildingX = 80 + (i % 4) * 180;
        const buildingY = 450;
        const width = 40 + Math.random() * 30;
        const height = 30 + Math.random() * 50;
        
        const building = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        building.setAttribute('x', buildingX);
        building.setAttribute('y', buildingY - height);
        building.setAttribute('width', width);
        building.setAttribute('height', height);
        building.setAttribute('fill', getColor(i * 2));
        building.setAttribute('opacity', '0.6');
        building.setAttribute('stroke', getColor(i * 2 + 1));
        building.setAttribute('stroke-width', '1');
        building.style.filter = 'drop-shadow(0 0 8px rgba(255, 107, 157, 0.5))';
        svg.appendChild(building);
        
        // Building windows
        const windowsPerFloor = Math.floor(width / 12);
        const floors = Math.floor(height / 15);
        for (let floor = 0; floor < floors; floor++) {
            for (let win = 0; win < windowsPerFloor; win++) {
                if (Math.random() > 0.4) {
                    const window = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    window.setAttribute('x', buildingX + 5 + win * 12);
                    window.setAttribute('y', buildingY - height + 5 + floor * 15);
                    window.setAttribute('width', '6');
                    window.setAttribute('height', '8');
                    window.setAttribute('fill', getColor(i * 2 + 2));
                    window.setAttribute('opacity', '0.8');
                    window.style.animation = `windowTwinkle ${2 + Math.random() * 2}s ease-in-out infinite`;
                    window.style.animationDelay = `${Math.random() * 1}s`;
                    svg.appendChild(window);
                }
            }
        }
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

function createFlowingLines(index, params = null) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    svg.style.transform = 'perspective(1000px) rotateX(25deg)';
    svg.style.transformStyle = 'preserve-3d';
    
    // Use custom colors if provided, otherwise use theme colors
    const getColor = params && params.colors 
        ? (i) => params.colors[i % params.colors.length]
        : (i) => getThemeColor(i * 9);
    
    for (let i = 0; i < 50; i++) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        const z = (i % 8 - 4) * 30;
        line.setAttribute('x1', 0);
        line.setAttribute('y1', i * 10);
        line.setAttribute('x2', 800);
        line.setAttribute('y2', i * 10 + Math.sin(i) * 50);
        line.setAttribute('stroke', getColor(i));
        line.setAttribute('stroke-width', '5');
        line.style.transform = `translateZ(${z}px)`;
        line.style.opacity = 0.85 + (z + 120) / 240 * 0.15;
        line.style.animation = `flow ${3 + i * 0.05}s ease-in-out infinite`;
        svg.appendChild(line);
    }
    
    // Fresh breeze elements (from lyrics: "Es una brisa" - Brisa)
    const theme = params && params.theme ? params.theme : 'default';
    
    if (theme === 'wind' || theme === 'wind_lines') {
        // More fresh breeze elements
        // Flowing air currents (curved lines like wind)
        for (let i = 0; i < 25; i++) {
            const windCurve = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const startX = -50 + Math.random() * 100;
            const startY = Math.random() * 500;
            const midX = 400 + (Math.random() - 0.5) * 200;
            const midY = 250 + (Math.random() - 0.5) * 200;
            const endX = 750 + Math.random() * 50;
            const endY = Math.random() * 500;
            
            windCurve.setAttribute('d', `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`);
            windCurve.setAttribute('fill', 'none');
            windCurve.setAttribute('stroke', getColor(i));
            windCurve.setAttribute('stroke-width', '3');
            windCurve.setAttribute('opacity', '0.7');
            windCurve.setAttribute('stroke-linecap', 'round');
            windCurve.style.filter = 'drop-shadow(0 0 8px rgba(255, 228, 181, 0.6))';
            windCurve.style.animation = `breezeFlow ${4 + Math.random() * 3}s ease-in-out infinite`;
            windCurve.style.animationDelay = `${Math.random() * 2}s`;
            svg.appendChild(windCurve);
        }
        
        // Fresh leaves/petals floating in breeze
        for (let i = 0; i < 40; i++) {
            const leaf = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const x = Math.random() * 800;
            const y = Math.random() * 500;
            const size = 6 + Math.random() * 10;
            
            // Fresh leaf shape
            const leafPath = `M ${x} ${y} 
                             Q ${x - size} ${y - size/2} ${x - size/2} ${y - size}
                             Q ${x} ${y - size} ${x + size/2} ${y - size}
                             Q ${x + size} ${y - size/2} ${x} ${y} Z`;
            leaf.setAttribute('d', leafPath);
            leaf.setAttribute('fill', getColor(i));
            leaf.setAttribute('opacity', '0.85');
            leaf.setAttribute('stroke', getColor(i + 1));
            leaf.setAttribute('stroke-width', '1');
            leaf.style.filter = 'drop-shadow(0 0 6px rgba(255, 228, 181, 0.7))';
            leaf.style.animation = `freshBreeze ${5 + Math.random() * 4}s ease-in-out infinite`;
            leaf.style.animationDelay = `${Math.random() * 1.5}s`;
            leaf.style.transform = `rotate(${Math.random() * 360}deg)`;
            svg.appendChild(leaf);
        }
        
        // Air swirls (fresh breeze spirals)
        for (let i = 0; i < 15; i++) {
            const swirl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const centerX = 100 + (i % 4) * 200;
            const centerY = 100 + Math.floor(i / 4) * 150;
            const radius = 30 + Math.random() * 20;
            let swirlPath = `M ${centerX} ${centerY}`;
            
            for (let j = 0; j < 20; j++) {
                const angle = j * 0.3;
                const r = (j / 20) * radius;
                swirlPath += ` L ${centerX + r * Math.cos(angle)} ${centerY + r * Math.sin(angle)}`;
            }
            
            swirl.setAttribute('d', swirlPath);
            swirl.setAttribute('fill', 'none');
            swirl.setAttribute('stroke', getColor(i));
            swirl.setAttribute('stroke-width', '2');
            swirl.setAttribute('opacity', '0.6');
            swirl.style.filter = 'drop-shadow(0 0 8px rgba(255, 228, 181, 0.6))';
            swirl.style.animation = `breezeSwirl ${3 + Math.random() * 2}s ease-in-out infinite`;
            swirl.style.animationDelay = `${i * 0.2}s`;
            svg.appendChild(swirl);
        }
        
        // Fresh air bubbles/particles
        for (let i = 0; i < 60; i++) {
            const bubble = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            bubble.setAttribute('cx', Math.random() * 800);
            bubble.setAttribute('cy', 500);
            bubble.setAttribute('r', 2 + Math.random() * 4);
            bubble.setAttribute('fill', getColor(i));
            bubble.setAttribute('opacity', '0.7');
            bubble.style.filter = 'drop-shadow(0 0 6px rgba(255, 228, 181, 0.6))';
            const bubbleSpeed = 3 + Math.random() * 4;
            bubble.style.animation = `freshBubble ${bubbleSpeed}s ease-out infinite`;
            bubble.style.animationDelay = `${Math.random() * 2}s`;
            svg.appendChild(bubble);
        }
    } else {
        // Original leaves/petals
        for (let i = 0; i < 30; i++) {
            const leaf = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const x = Math.random() * 800;
            const y = Math.random() * 500;
            const size = 5 + Math.random() * 8;
            
            const leafPath = `M ${x} ${y} 
                             Q ${x - size} ${y - size/2} ${x - size/2} ${y - size}
                             Q ${x} ${y - size} ${x + size/2} ${y - size}
                             Q ${x + size} ${y - size/2} ${x} ${y} Z`;
            leaf.setAttribute('d', leafPath);
            leaf.setAttribute('fill', getColor(i));
            leaf.setAttribute('opacity', '0.8');
            leaf.style.animation = `leafFloat ${4 + Math.random() * 3}s ease-in-out infinite`;
            leaf.style.animationDelay = `${Math.random() * 2}s`;
            leaf.style.transform = `rotate(${Math.random() * 360}deg)`;
            svg.appendChild(leaf);
        }
        
        // Gentle wind particles
        for (let i = 0; i < 40; i++) {
            const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            particle.setAttribute('cx', Math.random() * 800);
            particle.setAttribute('cy', Math.random() * 500);
            particle.setAttribute('r', '2');
            particle.setAttribute('fill', getColor(i));
            particle.setAttribute('opacity', '0.6');
            particle.style.animation = `windParticle ${5 + Math.random() * 3}s ease-in-out infinite`;
            particle.style.animationDelay = `${Math.random() * 2}s`;
            svg.appendChild(particle);
        }
    }
    
    return svg;
}

function createHexagonPattern(index, params = null) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    // Use custom colors if provided, otherwise use theme colors
    const getColor = params && params.colors 
        ? (i) => params.colors[i % params.colors.length]
        : (i) => getThemeColor(i * 10);
    
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
            hex.setAttribute('fill', getColor(x + y));
            hex.setAttribute('stroke', getColor(x + y + 1));
            hex.setAttribute('stroke-width', '2');
            hex.setAttribute('opacity', '0.85');
            hex.style.animation = `hexPulse ${2 + (x + y) * 0.1}s ease-in-out infinite`;
            svg.appendChild(hex);
        }
    }
    
    // Turkish architectural elements (from "Estambul Turquía" - Istanbul/Turkey theme)
    // Crescent moons and stars (Turkish symbols)
    for (let i = 0; i < 8; i++) {
        const moonX = 100 + (i % 4) * 180;
        const moonY = 80 + Math.floor(i / 4) * 300;
        
        // Crescent moon
        const crescent = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const moonPath = `M ${moonX} ${moonY}
                         A 15 15 0 0 1 ${moonX} ${moonY - 30}
                         A 12 12 0 0 0 ${moonX} ${moonY} Z`;
        crescent.setAttribute('d', moonPath);
        crescent.setAttribute('fill', getColor(i * 2));
        crescent.setAttribute('opacity', '0.9');
        crescent.style.filter = 'drop-shadow(0 0 10px rgba(255, 200, 87, 0.7))';
        crescent.style.animation = `crescentGlow ${3 + i * 0.2}s ease-in-out infinite`;
        svg.appendChild(crescent);
        
        // Star next to crescent
        const star = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        const starX = moonX + 25;
        const starY = moonY - 15;
        const starSize = 5;
        const starPoints = [];
        for (let j = 0; j < 5; j++) {
            const angle = (Math.PI * 2 / 5) * j - Math.PI / 2;
            starPoints.push(`${starX + starSize * Math.cos(angle)},${starY + starSize * Math.sin(angle)}`);
        }
        star.setAttribute('points', starPoints.join(' '));
        star.setAttribute('fill', getColor(i * 2 + 1));
        star.setAttribute('opacity', '0.9');
        star.style.filter = 'drop-shadow(0 0 8px rgba(255, 200, 87, 0.7))';
        star.style.animation = `starTwinkle ${2 + Math.random()}s ease-in-out infinite`;
        svg.appendChild(star);
    }
    
    // Architectural domes (Istanbul mosques)
    for (let i = 0; i < 3; i++) {
        const domeX = 200 + i * 200;
        const domeY = 450;
        
        // Dome base
        const domeBase = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        domeBase.setAttribute('x', domeX - 40);
        domeBase.setAttribute('y', domeY - 60);
        domeBase.setAttribute('width', '80');
        domeBase.setAttribute('height', '60');
        domeBase.setAttribute('rx', '5');
        domeBase.setAttribute('fill', getColor(i * 3));
        domeBase.setAttribute('opacity', '0.7');
        svg.appendChild(domeBase);
        
        // Dome top
        const dome = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        dome.setAttribute('cx', domeX);
        dome.setAttribute('cy', domeY - 60);
        dome.setAttribute('rx', '35');
        dome.setAttribute('ry', '25');
        dome.setAttribute('fill', getColor(i * 3 + 1));
        dome.setAttribute('opacity', '0.8');
        dome.style.filter = 'drop-shadow(0 0 15px rgba(139, 111, 71, 0.6))';
        dome.style.animation = `domeShine ${4 + i * 0.5}s ease-in-out infinite`;
        svg.appendChild(dome);
        
        // Dome point/spire
        const spire = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        spire.setAttribute('points', `${domeX},${domeY - 85} ${domeX - 8},${domeY - 60} ${domeX + 8},${domeY - 60}`);
        spire.setAttribute('fill', getColor(i * 3 + 2));
        spire.setAttribute('opacity', '0.9');
        svg.appendChild(spire);
    }
    
    return svg;
}

function createSpiralPattern(index, params = null) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    svg.style.transform = 'perspective(1200px)';
    svg.style.transformStyle = 'preserve-3d';
    
    const centerX = 400;
    const centerY = 250;
    
    // Use custom colors if provided, otherwise use theme colors
    const getColor = params && params.colors 
        ? (i) => params.colors[i % params.colors.length]
        : (i) => getThemeColor(i * 2);
    
    const theme = params && params.theme ? params.theme : 'default';
    
    // PERFORMANCE FIX: Reduce element count (was 250, now 120)
    for (let i = 0; i < 120; i++) {
        const angle = i * 0.15;
        const radius = i * 1.8;
        const z = (i % 10 - 5) * 40;
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', centerX + radius * Math.cos(angle));
        circle.setAttribute('cy', centerY + radius * Math.sin(angle));
        circle.setAttribute('r', 8);
        circle.setAttribute('fill', getColor(i));
        circle.style.transform = `translateZ(${z}px)`;
        circle.style.opacity = Math.max(0.7, 0.85 + (z + 200) / 400 * 0.15);
        circle.style.animation = `spiral ${8}s linear infinite`;
        circle.style.animationDelay = `${i * 0.03}s`;
        svg.appendChild(circle);
    }
    
    // Goodbye/love elements (for "Te Dejo Mi Amor")
    if (theme === 'goodbye' || theme === 'spiral_goodbye') {
        // Fading hearts spiraling inward (goodbye theme)
        for (let i = 0; i < 30; i++) {
            const heartAngle = i * 0.5;
            const heartRadius = 150 - i * 4;
            const heartX = centerX + heartRadius * Math.cos(heartAngle);
            const heartY = centerY + heartRadius * Math.sin(heartAngle);
            const size = 8 + Math.random() * 10;
            const z = i * -10;
            
            const heart = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const heartPath = `M ${heartX} ${heartY + size * 0.3}
                              C ${heartX - size * 0.5} ${heartY} ${heartX - size} ${heartY + size * 0.2} ${heartX - size * 0.5} ${heartY + size * 0.5}
                              C ${heartX} ${heartY + size * 0.2} ${heartX + size * 0.5} ${heartY + size * 0.2} ${heartX + size * 0.5} ${heartY + size * 0.5}
                              C ${heartX + size} ${heartY + size * 0.2} ${heartX + size * 0.5} ${heartY} ${heartX} ${heartY + size * 0.3} Z`;
            heart.setAttribute('d', heartPath);
            heart.setAttribute('fill', getColor(i));
            heart.setAttribute('opacity', Math.max(0.3, 0.9 - (i / 30) * 0.6));
            heart.style.transform = `translateZ(${z}px) scale(${Math.max(0.4, 1 - i / 30)})`;
            heart.style.filter = 'drop-shadow(0 0 10px rgba(221, 160, 221, 0.8))';
            heart.style.animation = `spiralGoodbye ${3 + i * 0.1}s linear infinite`;
            heart.style.animationDelay = `${i * 0.05}s`;
            svg.appendChild(heart);
        }
        
        // Tears/droplets (from "Por favor no llores por mí")
        for (let i = 0; i < 25; i++) {
            const tear = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const tearX = centerX + (Math.random() - 0.5) * 300;
            const tearY = centerY - 100 + Math.random() * 200;
            const tearSize = 4 + Math.random() * 6;
            
            // Tear drop shape
            const tearPath = `M ${tearX} ${tearY}
                              Q ${tearX} ${tearY + tearSize} ${tearX} ${tearY + tearSize * 2}
                              Q ${tearX - tearSize * 0.3} ${tearY + tearSize * 1.5} ${tearX} ${tearY} Z`;
            tear.setAttribute('d', tearPath);
            tear.setAttribute('fill', getColor(i));
            tear.setAttribute('opacity', '0.7');
            tear.style.filter = 'drop-shadow(0 0 8px rgba(221, 160, 221, 0.7))';
            tear.style.animation = `tearFall ${2 + Math.random() * 2}s ease-out infinite`;
            tear.style.animationDelay = `${Math.random() * 1.5}s`;
            svg.appendChild(tear);
        }
        
        // Broken promise pieces (from "Y tus promesas rotas")
        for (let i = 0; i < 15; i++) {
            const piece = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            const pieceX = centerX + (Math.random() - 0.5) * 400;
            const pieceY = centerY + (Math.random() - 0.5) * 300;
            const pieceSize = 8 + Math.random() * 12;
            
            // Broken shard/piece shape
            const points = [];
            for (let p = 0; p < 6; p++) {
                const angle = (Math.PI * 2 / 6) * p;
                const px = pieceX + pieceSize * Math.cos(angle + Math.random() * 0.5);
                const py = pieceY + pieceSize * Math.sin(angle + Math.random() * 0.5);
                points.push(`${px},${py}`);
            }
            piece.setAttribute('points', points.join(' '));
            piece.setAttribute('fill', getColor(i));
            piece.setAttribute('opacity', '0.6');
            piece.setAttribute('stroke', getColor(i + 1));
            piece.setAttribute('stroke-width', '1');
            piece.style.filter = 'drop-shadow(0 0 8px rgba(221, 160, 221, 0.6))';
            piece.style.animation = `brokenPiece ${4 + Math.random() * 3}s ease-in-out infinite`;
            piece.style.animationDelay = `${Math.random() * 2}s`;
            svg.appendChild(piece);
        }
        
        // Memory fragments (from "Del rincón donde fuimos felices")
        for (let i = 0; i < 20; i++) {
            const fragment = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            fragment.setAttribute('cx', centerX + (Math.random() - 0.5) * 350);
            fragment.setAttribute('cy', centerY + (Math.random() - 0.5) * 250);
            fragment.setAttribute('rx', 6 + Math.random() * 10);
            fragment.setAttribute('ry', 4 + Math.random() * 8);
            fragment.setAttribute('fill', getColor(i));
            fragment.setAttribute('opacity', '0.5');
            fragment.setAttribute('stroke', getColor(i + 1));
            fragment.setAttribute('stroke-width', '1');
            fragment.setAttribute('stroke-dasharray', '3,3');
            fragment.style.filter = 'drop-shadow(0 0 6px rgba(221, 160, 221, 0.5))';
            fragment.style.animation = `memoryFade ${5 + Math.random() * 3}s ease-in-out infinite`;
            fragment.style.animationDelay = `${Math.random() * 2}s`;
            svg.appendChild(fragment);
        }
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

function createStarField(index, params = null) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    // Use custom colors if provided, otherwise use theme colors
    const getColor = params && params.colors 
        ? () => params.colors[Math.floor(Math.random() * params.colors.length)]
        : () => getThemeColorRandom();
    
    const theme = params && params.theme ? params.theme : 'default';
    
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
        star.setAttribute('fill', getColor());
        star.setAttribute('opacity', '0.9');
        star.style.filter = 'drop-shadow(0 0 5px rgba(255, 149, 0, 0.8))';
        star.style.animation = `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`;
        svg.appendChild(star);
    }
    
    // Theme-based elements
    if (theme === 'confidence' || theme === 'stars_glory') {
        // Crowns/trophies for Chingón (from lyrics: "El más chingón", "El mejor de todos")
        for (let i = 0; i < 8; i++) {
            const crownX = 100 + (i % 4) * 180;
            const crownY = 150 + Math.floor(i / 4) * 200;
            
            // Crown base
            const crownBase = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const basePoints = `M ${crownX - 25} ${crownY + 15} 
                               L ${crownX - 25} ${crownY - 10}
                               L ${crownX - 15} ${crownY - 20}
                               L ${crownX - 5} ${crownY - 15}
                               L ${crownX} ${crownY - 25}
                               L ${crownX + 5} ${crownY - 15}
                               L ${crownX + 15} ${crownY - 20}
                               L ${crownX + 25} ${crownY - 10}
                               L ${crownX + 25} ${crownY + 15} Z`;
            crownBase.setAttribute('d', basePoints);
            crownBase.setAttribute('fill', getColor());
            crownBase.setAttribute('opacity', '0.9');
            crownBase.setAttribute('stroke', '#FFD700');
            crownBase.setAttribute('stroke-width', '2');
            crownBase.style.filter = 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))';
            crownBase.style.animation = `crownGlow ${3 + i * 0.2}s ease-in-out infinite`;
            svg.appendChild(crownBase);
            
            // Crown jewels
            for (let j = 0; j < 3; j++) {
                const jewel = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                jewel.setAttribute('cx', crownX - 10 + j * 10);
                jewel.setAttribute('cy', crownY - 20);
                jewel.setAttribute('r', '3');
                jewel.setAttribute('fill', '#FF0000');
                jewel.setAttribute('opacity', '0.9');
                jewel.style.animation = `jewelSparkle ${1 + Math.random()}s ease-in-out infinite`;
                jewel.style.animationDelay = `${j * 0.2}s`;
                svg.appendChild(jewel);
            }
        }
        
        // More trophy/victory symbols for satisfying effect
        for (let i = 0; i < 10; i++) {
            const trophyX = 120 + (i % 4) * 180;
            const trophyY = 320 + Math.floor(i / 4) * 150;
            
            // Trophy cup (larger, more satisfying)
            const cup = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            cup.setAttribute('cx', trophyX);
            cup.setAttribute('cy', trophyY);
            cup.setAttribute('rx', '25');
            cup.setAttribute('ry', '35');
            cup.setAttribute('fill', getColor());
            cup.setAttribute('opacity', '0.9');
            cup.setAttribute('stroke', '#FFD700');
            cup.setAttribute('stroke-width', '3');
            cup.style.filter = 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.9))';
            cup.style.animation = `trophySatisfy ${2 + Math.random() * 2}s ease-in-out infinite`;
            svg.appendChild(cup);
            
            // Trophy base
            const base = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            base.setAttribute('x', trophyX - 18);
            base.setAttribute('y', trophyY + 30);
            base.setAttribute('width', '36');
            base.setAttribute('height', '10');
            base.setAttribute('rx', '4');
            base.setAttribute('fill', '#FFD700');
            base.setAttribute('opacity', '1');
            svg.appendChild(base);
            
            // Trophy handles
            const handle1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            handle1.setAttribute('d', `M ${trophyX - 25} ${trophyY - 12} Q ${trophyX - 35} ${trophyY} ${trophyX - 25} ${trophyY + 12}`);
            handle1.setAttribute('stroke', '#FFD700');
            handle1.setAttribute('stroke-width', '4');
            handle1.setAttribute('fill', 'none');
            handle1.style.filter = 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))';
            svg.appendChild(handle1);
            
            const handle2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            handle2.setAttribute('d', `M ${trophyX + 25} ${trophyY - 12} Q ${trophyX + 35} ${trophyY} ${trophyX + 25} ${trophyY + 12}`);
            handle2.setAttribute('stroke', '#FFD700');
            handle2.setAttribute('stroke-width', '4');
            handle2.setAttribute('fill', 'none');
            handle2.style.filter = 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))';
            svg.appendChild(handle2);
        }
        
        // Victory sparkles/bursts (more satisfying)
        for (let i = 0; i < 30; i++) {
            const sparkle = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            const x = Math.random() * 800;
            const y = Math.random() * 500;
            const size = 4 + Math.random() * 6;
            const points = [];
            for (let j = 0; j < 6; j++) {
                const angle = (Math.PI * 2 / 6) * j;
                points.push(`${x + size * Math.cos(angle)},${y + size * Math.sin(angle)}`);
            }
            sparkle.setAttribute('points', points.join(' '));
            sparkle.setAttribute('fill', '#FFD700');
            sparkle.setAttribute('opacity', '0.9');
            sparkle.style.filter = 'drop-shadow(0 0 10px rgba(255, 215, 0, 1))';
            sparkle.style.animation = `victorySparkle ${1.5 + Math.random() * 1.5}s ease-in-out infinite`;
            sparkle.style.animationDelay = `${Math.random() * 1}s`;
            svg.appendChild(sparkle);
        }
    } else if (theme === 'nostalgic_night' || theme === 'night_stars') {
        // Moon for romantic nights (from "Nunca Olvidaré Aquella Noche")
        const moon = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        moon.setAttribute('cx', '650');
        moon.setAttribute('cy', '100');
        moon.setAttribute('r', '50');
        moon.setAttribute('fill', '#FFE5B4');
        moon.setAttribute('opacity', '0.9');
        moon.style.filter = 'drop-shadow(0 0 30px rgba(255, 229, 180, 0.8))';
        moon.style.animation = 'moonGlow 4s ease-in-out infinite';
        svg.appendChild(moon);
        
        // Heart constellations
        for (let i = 0; i < 10; i++) {
            const heart = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const x = 100 + (i % 5) * 150;
            const y = 100 + Math.floor(i / 5) * 200;
            const size = 8 + Math.random() * 8;
            
            const heartPath = `M ${x} ${y + size * 0.3}
                              C ${x - size * 0.5} ${y} ${x - size} ${y + size * 0.2} ${x - size * 0.5} ${y + size * 0.5}
                              C ${x} ${y + size * 0.2} ${x + size * 0.5} ${y + size * 0.2} ${x + size * 0.5} ${y + size * 0.5}
                              C ${x + size} ${y + size * 0.2} ${x + size * 0.5} ${y} ${x} ${y + size * 0.3} Z`;
            heart.setAttribute('d', heartPath);
            heart.setAttribute('fill', '#FFFFFF');
            heart.setAttribute('opacity', '0.8');
            heart.style.filter = 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.9))';
            heart.style.animation = `heartTwinkle ${2 + Math.random() * 2}s ease-in-out infinite`;
            heart.style.animationDelay = `${Math.random() * 1}s`;
            svg.appendChild(heart);
        }
    } else if (theme === 'sky_falling' || theme === 'falling_sky') {
        // Falling sky elements (from "Si el cielo cae")
        for (let i = 0; i < 15; i++) {
            const skyPiece = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            const x = Math.random() * 800;
            const y = -20;
            const size = 20 + Math.random() * 30;
            
            // Polygon automatically closes, so no 'Z' needed
            skyPiece.setAttribute('points', `${x},${y} ${x + size},${y + size} ${x - size/2},${y + size}`);
            skyPiece.setAttribute('fill', getColor());
            skyPiece.setAttribute('opacity', '0.8');
            skyPiece.style.filter = 'drop-shadow(0 0 10px rgba(65, 105, 225, 0.7))';
            const speed = 3 + Math.random() * 2;
            skyPiece.style.animation = `skyFall ${speed}s linear infinite`;
            skyPiece.style.animationDelay = `${Math.random() * 2}s`;
            svg.appendChild(skyPiece);
        }
    }
    
    return svg;
}

function createRippleEffect(index, params = null) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    const centerX = 400;
    const centerY = 250;
    
    // Use custom colors if provided, otherwise use theme colors
    const getColor = params && params.colors 
        ? (i) => params.colors[i % params.colors.length]
        : (i) => getThemeColor(i * 24);
    
    for (let i = 0; i < 15; i++) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', centerX);
        circle.setAttribute('cy', centerY);
        circle.setAttribute('r', i * 20);
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', getColor(i));
        circle.setAttribute('stroke-width', '5');
        circle.setAttribute('opacity', '0.9');
        circle.style.animation = `ripple ${3 + i * 0.2}s ease-out infinite`;
        circle.style.animationDelay = `${i * 0.2}s`;
        svg.appendChild(circle);
    }
    
    // Chill vibes elements
    const theme = params && params.theme ? params.theme : 'default';
    
    if (theme === 'calm' || theme === 'smooth_ripples') {
        // More chill elements
        // Larger, slower ripples (more calming)
        for (let i = 0; i < 25; i++) {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', centerX);
            circle.setAttribute('cy', centerY);
            circle.setAttribute('r', i * 18);
            circle.setAttribute('fill', 'none');
            circle.setAttribute('stroke', getColor(i));
            circle.setAttribute('stroke-width', '6');
            circle.setAttribute('opacity', '0.7');
            circle.style.animation = `chillRipple ${4 + i * 0.3}s ease-out infinite`;
            circle.style.animationDelay = `${i * 0.15}s`;
            svg.appendChild(circle);
        }
        
        // More lily pads for chill vibes
        for (let i = 0; i < 12; i++) {
            const lilyX = 80 + (i % 4) * 200;
            const lilyY = 280 + Math.floor(i / 4) * 120;
            
            const lilyPad = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            lilyPad.setAttribute('cx', lilyX);
            lilyPad.setAttribute('cy', lilyY);
            lilyPad.setAttribute('rx', '40');
            lilyPad.setAttribute('ry', '28');
            lilyPad.setAttribute('fill', '#2E7D32');
            lilyPad.setAttribute('opacity', '0.8');
            lilyPad.setAttribute('stroke', '#1B5E20');
            lilyPad.setAttribute('stroke-width', '2');
            lilyPad.style.filter = 'drop-shadow(0 0 10px rgba(46, 125, 50, 0.5))';
            lilyPad.style.animation = `chillFloat ${6 + Math.random() * 3}s ease-in-out infinite`;
            lilyPad.style.animationDelay = `${Math.random() * 2}s`;
            svg.appendChild(lilyPad);
            
            // Lily flower
            const flower = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            flower.setAttribute('cx', lilyX);
            flower.setAttribute('cy', lilyY - 12);
            flower.setAttribute('r', '14');
            flower.setAttribute('fill', getColor(i));
            flower.setAttribute('opacity', '0.95');
            flower.style.filter = 'drop-shadow(0 0 8px rgba(168, 230, 207, 0.8))';
            flower.style.animation = `chillFloat ${6 + Math.random() * 3}s ease-in-out infinite`;
            svg.appendChild(flower);
        }
        
        // Gentle mist/fog (very chill)
        for (let i = 0; i < 20; i++) {
            const mist = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            mist.setAttribute('cx', Math.random() * 800);
            mist.setAttribute('cy', Math.random() * 500);
            mist.setAttribute('rx', 40 + Math.random() * 60);
            mist.setAttribute('ry', 20 + Math.random() * 30);
            mist.setAttribute('fill', getColor(i));
            mist.setAttribute('opacity', '0.3');
            mist.style.filter = 'blur(15px)';
            mist.style.animation = `chillMist ${10 + Math.random() * 5}s ease-in-out infinite`;
            mist.style.animationDelay = `${Math.random() * 3}s`;
            svg.appendChild(mist);
        }
        
        // Peaceful droplets (more of them)
        for (let i = 0; i < 35; i++) {
            const drop = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            drop.setAttribute('cx', Math.random() * 800);
            drop.setAttribute('cy', Math.random() * 500);
            drop.setAttribute('r', 2 + Math.random() * 4);
            drop.setAttribute('fill', getColor(i));
            drop.setAttribute('opacity', '0.7');
            drop.style.filter = 'drop-shadow(0 0 5px rgba(168, 230, 207, 0.6))';
            drop.style.animation = `chillDrop ${4 + Math.random() * 3}s ease-in-out infinite`;
            drop.style.animationDelay = `${Math.random() * 2}s`;
            svg.appendChild(drop);
        }
    } else {
        // Original lily pads
        for (let i = 0; i < 8; i++) {
            const lilyX = 100 + (i % 4) * 200;
            const lilyY = 300 + Math.floor(i / 4) * 150;
            
            const lilyPad = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            lilyPad.setAttribute('cx', lilyX);
            lilyPad.setAttribute('cy', lilyY);
            lilyPad.setAttribute('rx', '35');
            lilyPad.setAttribute('ry', '25');
            lilyPad.setAttribute('fill', '#2E7D32');
            lilyPad.setAttribute('opacity', '0.7');
            lilyPad.setAttribute('stroke', '#1B5E20');
            lilyPad.setAttribute('stroke-width', '2');
            lilyPad.style.animation = `lilyFloat ${4 + Math.random() * 2}s ease-in-out infinite`;
            lilyPad.style.animationDelay = `${Math.random() * 1}s`;
            svg.appendChild(lilyPad);
            
            const flower = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            flower.setAttribute('cx', lilyX);
            flower.setAttribute('cy', lilyY - 10);
            flower.setAttribute('r', '12');
            flower.setAttribute('fill', getColor(i));
            flower.setAttribute('opacity', '0.9');
            flower.style.filter = 'drop-shadow(0 0 5px rgba(255, 182, 193, 0.6))';
            flower.style.animation = `lilyFloat ${4 + Math.random() * 2}s ease-in-out infinite`;
            svg.appendChild(flower);
        }
        
        // Peaceful droplets
        for (let i = 0; i < 20; i++) {
            const drop = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            drop.setAttribute('cx', Math.random() * 800);
            drop.setAttribute('cy', Math.random() * 500);
            drop.setAttribute('r', '3');
            drop.setAttribute('fill', getColor(i));
            drop.setAttribute('opacity', '0.6');
            drop.style.animation = `dropGentle ${3 + Math.random() * 2}s ease-in-out infinite`;
            drop.style.animationDelay = `${Math.random() * 1.5}s`;
            svg.appendChild(drop);
        }
    }
    
    return svg;
}

function createFloatingCircles(index, params = null) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    // Use custom colors if provided, otherwise use theme colors
    const getColor = params && params.colors 
        ? () => params.colors[Math.floor(Math.random() * params.colors.length)]
        : () => getThemeColorRandom();
    
    for (let i = 0; i < 25; i++) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const r = Math.random() * 30 + 10;
        circle.setAttribute('cx', Math.random() * 800);
        circle.setAttribute('cy', Math.random() * 500);
        circle.setAttribute('r', r);
        circle.setAttribute('fill', getColor());
        circle.setAttribute('opacity', '0.85');
        circle.setAttribute('stroke', getColor());
        circle.setAttribute('stroke-width', '2');
        circle.style.animation = `float ${4 + Math.random() * 3}s ease-in-out infinite`;
        svg.appendChild(circle);
    }
    
    // Hearts floating (from lyrics: "Loving You Is Easy" - romantic theme)
    // Enhanced with many more hearts
    const theme = params && params.theme ? params.theme : 'default';
    const heartCount = (theme === 'romantic' || theme === 'floating_love') ? 40 : 15;
    
    for (let i = 0; i < heartCount; i++) {
        const heart = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const x = Math.random() * 800;
        const y = Math.random() * 500;
        const size = 8 + Math.random() * 18;
        
        // Heart shape
        const heartPath = `M ${x} ${y + size * 0.3}
                          C ${x - size * 0.5} ${y} ${x - size} ${y + size * 0.2} ${x - size * 0.5} ${y + size * 0.5}
                          C ${x} ${y + size * 0.2} ${x + size * 0.5} ${y + size * 0.2} ${x + size * 0.5} ${y + size * 0.5}
                          C ${x + size} ${y + size * 0.2} ${x + size * 0.5} ${y} ${x} ${y + size * 0.3} Z`;
        heart.setAttribute('d', heartPath);
        heart.setAttribute('fill', getColor());
        heart.setAttribute('opacity', '0.85');
        heart.setAttribute('stroke', getColor());
        heart.setAttribute('stroke-width', '1');
        heart.style.filter = 'drop-shadow(0 0 10px rgba(255, 182, 193, 0.8))';
        heart.style.animation = `heartFloat ${4 + Math.random() * 4}s ease-in-out infinite`;
        heart.style.animationDelay = `${Math.random() * 2}s`;
        svg.appendChild(heart);
    }
    
    // Additional small hearts floating up (like love bubbles)
    if (theme === 'romantic' || theme === 'floating_love') {
        for (let i = 0; i < 30; i++) {
            const smallHeart = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const x = Math.random() * 800;
            const y = 500;
            const size = 4 + Math.random() * 6;
            
            const heartPath = `M ${x} ${y + size * 0.3}
                              C ${x - size * 0.5} ${y} ${x - size} ${y + size * 0.2} ${x - size * 0.5} ${y + size * 0.5}
                              C ${x} ${y + size * 0.2} ${x + size * 0.5} ${y + size * 0.2} ${x + size * 0.5} ${y + size * 0.5}
                              C ${x + size} ${y + size * 0.2} ${x + size * 0.5} ${y} ${x} ${y + size * 0.3} Z`;
            smallHeart.setAttribute('d', heartPath);
            smallHeart.setAttribute('fill', getColor());
            smallHeart.setAttribute('opacity', '0.7');
            smallHeart.style.filter = 'drop-shadow(0 0 6px rgba(255, 182, 193, 0.6))';
            const duration = 3 + Math.random() * 4;
            smallHeart.style.animation = `heartRise ${duration}s ease-out infinite`;
            smallHeart.style.animationDelay = `${Math.random() * 2}s`;
            svg.appendChild(smallHeart);
        }
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

function createTreePattern(index, params = null) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    // Use custom colors if provided, otherwise use green theme
    const getColor = params && params.colors 
        ? (depth) => params.colors[(depth - 1) % params.colors.length]
        : (depth) => `hsl(${120 + depth * 10}, 70%, 60%)`;
    
    function drawTree(x, y, length, angle, depth) {
        if (depth === 0) return;
        const x2 = x + length * Math.cos(angle);
        const y2 = y + length * Math.sin(angle);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x);
        line.setAttribute('y1', y);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', getColor(depth));
        line.setAttribute('stroke-width', Math.max(3, depth + 2));
        line.setAttribute('opacity', '0.9');
        svg.appendChild(line);
        drawTree(x2, y2, length * 0.7, angle - 0.5, depth - 1);
        drawTree(x2, y2, length * 0.7, angle + 0.5, depth - 1);
    }
    
    drawTree(400, 450, 80, -Math.PI / 2, 8);
    
    // Ranch elements (from "En el rancho" - lyrics about ranch, horses, cows, mountains)
    // Horses (from lyrics: "Arriba del caballo")
    for (let i = 0; i < 4; i++) {
        const horseX = 150 + i * 170;
        const horseY = 350;
        
        // Horse body
        const body = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        body.setAttribute('cx', horseX);
        body.setAttribute('cy', horseY);
        body.setAttribute('rx', '30');
        body.setAttribute('ry', '18');
        body.setAttribute('fill', '#8B4513');
        body.setAttribute('opacity', '0.8');
        body.style.animation = `horseGallop ${3 + Math.random() * 2}s ease-in-out infinite`;
        body.style.animationDelay = `${i * 0.3}s`;
        svg.appendChild(body);
        
        // Horse head
        const head = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        head.setAttribute('cx', horseX - 25);
        head.setAttribute('cy', horseY - 8);
        head.setAttribute('rx', '12');
        head.setAttribute('ry', '15');
        head.setAttribute('fill', '#8B4513');
        head.setAttribute('opacity', '0.8');
        head.style.animation = `horseGallop ${3 + Math.random() * 2}s ease-in-out infinite`;
        head.style.animationDelay = `${i * 0.3}s`;
        svg.appendChild(head);
        
        // Horse legs
        for (let j = 0; j < 4; j++) {
            const leg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            leg.setAttribute('x', horseX - 20 + (j % 2) * 15);
            leg.setAttribute('y', horseY + 15);
            leg.setAttribute('width', '4');
            leg.setAttribute('height', '25');
            leg.setAttribute('fill', '#5D4037');
            leg.setAttribute('opacity', '0.8');
            leg.style.animation = `horseGallop ${3 + Math.random() * 2}s ease-in-out infinite`;
            leg.style.animationDelay = `${i * 0.3 + j * 0.1}s`;
            svg.appendChild(leg);
        }
    }
    
    // Mountains/sierras (from lyrics: "Esas sierras son mi hogar")
    for (let i = 0; i < 5; i++) {
        const mountainX = i * 160;
        const mountainY = 450;
        const height = 80 + Math.random() * 60;
        
        const mountain = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        mountain.setAttribute('points', `${mountainX},${mountainY} ${mountainX + 50},${mountainY - height} ${mountainX + 100},${mountainY}`);
        mountain.setAttribute('fill', getColor(i + 1));
        mountain.setAttribute('opacity', '0.7');
        mountain.setAttribute('stroke', getColor(i + 2));
        mountain.setAttribute('stroke-width', '2');
        mountain.style.filter = 'drop-shadow(0 0 10px rgba(45, 80, 22, 0.5))';
        svg.appendChild(mountain);
    }
    
    // Cows (from lyrics: "Con las vacas")
    for (let i = 0; i < 6; i++) {
        const cowX = 100 + (i % 3) * 220;
        const cowY = 420 + Math.floor(i / 3) * 30;
        
        // Cow body
        const cowBody = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        cowBody.setAttribute('cx', cowX);
        cowBody.setAttribute('cy', cowY);
        cowBody.setAttribute('rx', '20');
        cowBody.setAttribute('ry', '12');
        cowBody.setAttribute('fill', '#F5F5DC');
        cowBody.setAttribute('opacity', '0.8');
        cowBody.style.animation = `cowGraze ${4 + Math.random() * 2}s ease-in-out infinite`;
        cowBody.style.animationDelay = `${i * 0.2}s`;
        svg.appendChild(cowBody);
        
        // Cow spots
        for (let j = 0; j < 2; j++) {
            const spot = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            spot.setAttribute('cx', cowX - 10 + j * 15);
            spot.setAttribute('cy', cowY);
            spot.setAttribute('rx', '6');
            spot.setAttribute('ry', '4');
            spot.setAttribute('fill', '#8B7355');
            spot.setAttribute('opacity', '0.8');
            svg.appendChild(spot);
        }
    }
    
    return svg;
}

function createLightning(index, params = null) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    // Use custom colors if provided, otherwise use default lightning color
    const getColor = params && params.colors 
        ? () => params.colors[Math.floor(Math.random() * params.colors.length)]
        : () => '#FFC857';
    
    // Storm clouds (from lyrics: "Destruir el Sistema", storm/chaos theme)
    for (let i = 0; i < 8; i++) {
        const cloud = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        const cloudX = 100 + (i % 4) * 180;
        const cloudY = 80 + Math.floor(i / 4) * 150;
        cloud.setAttribute('cx', cloudX);
        cloud.setAttribute('cy', cloudY);
        cloud.setAttribute('rx', '60');
        cloud.setAttribute('ry', '30');
        cloud.setAttribute('fill', '#2C3E50');
        cloud.setAttribute('opacity', '0.8');
        cloud.style.filter = 'drop-shadow(0 0 10px rgba(44, 62, 80, 0.6))';
        cloud.style.animation = `cloudDrift ${10 + Math.random() * 5}s ease-in-out infinite`;
        cloud.style.animationDelay = `${Math.random() * 2}s`;
        svg.appendChild(cloud);
        
        // Additional cloud puffs for depth
        const puff1 = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        puff1.setAttribute('cx', cloudX - 20);
        puff1.setAttribute('cy', cloudY);
        puff1.setAttribute('rx', '40');
        puff1.setAttribute('ry', '25');
        puff1.setAttribute('fill', '#34495E');
        puff1.setAttribute('opacity', '0.7');
        svg.appendChild(puff1);
        
        const puff2 = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        puff2.setAttribute('cx', cloudX + 20);
        puff2.setAttribute('cy', cloudY);
        puff2.setAttribute('rx', '40');
        puff2.setAttribute('ry', '25');
        puff2.setAttribute('fill', '#34495E');
        puff2.setAttribute('opacity', '0.7');
        svg.appendChild(puff2);
    }
    
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
        path.setAttribute('stroke', getColor());
        path.setAttribute('stroke-width', '5');
        path.setAttribute('opacity', '0.95');
        path.style.filter = 'drop-shadow(0 0 10px rgba(255, 200, 87, 0.8))';
        path.setAttribute('fill', 'none');
        path.style.animation = `lightning ${1 + Math.random()}s ease-in-out infinite`;
        svg.appendChild(path);
    }
    
    // Rain drops during storm
    for (let i = 0; i < 80; i++) {
        const rain = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        const x = Math.random() * 800;
        const length = 10 + Math.random() * 15;
        rain.setAttribute('x1', x);
        rain.setAttribute('y1', '-10');
        rain.setAttribute('x2', x);
        rain.setAttribute('y2', `-${10 + length}`);
        rain.setAttribute('stroke', '#7F8C8D');
        rain.setAttribute('stroke-width', '1.5');
        rain.setAttribute('opacity', '0.7');
        const speed = 1.5 + Math.random() * 1;
        rain.style.animation = `rainFall ${speed}s linear infinite`;
        rain.style.animationDelay = `${Math.random() * 1}s`;
        svg.appendChild(rain);
    }
    
    return svg;
}

function createAurora(index, params = null) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    // Use custom colors if provided, otherwise use theme colors
    const getColor = params && params.colors 
        ? (i) => params.colors[i % params.colors.length]
        : (i) => getThemeColor(i * 2, 40);
    
    for (let i = 0; i < 100; i++) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let d = `M ${i * 8} 0`;
        for (let y = 0; y < 500; y += 10) {
            d += ` L ${i * 8 + Math.sin(y / 50 + i) * 20} ${y}`;
        }
        path.setAttribute('d', d);
        path.setAttribute('stroke', getColor(i));
        path.setAttribute('stroke-width', '5');
        path.setAttribute('opacity', '0.85');
        path.setAttribute('fill', 'none');
        path.style.animation = `aurora ${5 + i * 0.05}s ease-in-out infinite`;
        svg.appendChild(path);
    }
    
    // Snowflakes falling (from lyrics: "Nieve cae" - Invierno)
    for (let i = 0; i < 60; i++) {
        const snowflake = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const x = Math.random() * 800;
        const y = -10;
        const size = 2 + Math.random() * 3;
        
        // 6-pointed snowflake
        let d = `M ${x} ${y}`;
        for (let j = 0; j < 6; j++) {
            const angle = (Math.PI * 2 / 6) * j;
            const x1 = x + size * Math.cos(angle);
            const y1 = y + size * Math.sin(angle);
            const x2 = x + size * 0.5 * Math.cos(angle + Math.PI / 6);
            const y2 = y + size * 0.5 * Math.sin(angle + Math.PI / 6);
            d += ` L ${x1} ${y1} L ${x2} ${y2} L ${x} ${y}`;
        }
        
        snowflake.setAttribute('d', d);
        snowflake.setAttribute('fill', '#FFFFFF');
        snowflake.setAttribute('opacity', '0.9');
        snowflake.setAttribute('stroke', '#E0E0E0');
        snowflake.setAttribute('stroke-width', '0.5');
        const speed = 4 + Math.random() * 4;
        snowflake.style.animation = `snowFall ${speed}s linear infinite`;
        snowflake.style.animationDelay = `${Math.random() * 2}s`;
        svg.appendChild(snowflake);
    }
    
    // Winter tree silhouettes (from lyrics: "Las sombras del bosque" - Invierno)
    for (let i = 0; i < 6; i++) {
        const treeX = 100 + i * 120;
        const treeY = 450;
        
        // Tree trunk
        const trunk = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        trunk.setAttribute('x', treeX - 5);
        trunk.setAttribute('y', treeY);
        trunk.setAttribute('width', '10');
        trunk.setAttribute('height', '50');
        trunk.setAttribute('fill', '#5D4037');
        trunk.setAttribute('opacity', '0.8');
        svg.appendChild(trunk);
        
        // Tree branches (triangular shape)
        for (let j = 0; j < 3; j++) {
            const branch = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            const branchY = treeY - j * 15;
            const branchWidth = 40 - j * 10;
            branch.setAttribute('points', `${treeX},${branchY} ${treeX - branchWidth},${branchY + 20} ${treeX + branchWidth},${branchY + 20}`);
            branch.setAttribute('fill', '#2E7D32');
            branch.setAttribute('opacity', '0.7');
            branch.style.filter = 'drop-shadow(0 0 5px rgba(46, 125, 50, 0.5))';
            svg.appendChild(branch);
        }
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

function createFireworks(index, params = null) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    // Use custom colors if provided, otherwise use theme colors
    const getColor = params && params.colors 
        ? (i) => params.colors[i % params.colors.length]
        : (i) => getThemeColor(i * 12);
    
    const centers = [{x: 200, y: 200}, {x: 400, y: 150}, {x: 600, y: 250}];
    centers.forEach((center, i) => {
        for (let j = 0; j < 30; j++) {
            const angle = (Math.PI * 2 / 30) * j;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', center.x);
            line.setAttribute('y1', center.y);
            line.setAttribute('x2', center.x + 50 * Math.cos(angle));
            line.setAttribute('y2', center.y + 50 * Math.sin(angle));
            line.setAttribute('stroke', getColor(j));
            line.setAttribute('stroke-width', '4');
            line.setAttribute('opacity', '0.9');
            line.style.animation = `firework ${2 + i}s ease-out infinite`;
            line.style.animationDelay = `${i * 0.7}s`;
            svg.appendChild(line);
        }
    });
    
    // Theme-based elements
    const theme = params && params.theme ? params.theme : 'default';
    
    // Corridos tumbados mafia imagery (for "Corrido para cantar")
    // Check if this is the corrido song by checking elements parameter
    if (params && params.elements === 'fireworks_celebration' && params.intensity === 'high') {
        // Guns/pistols (from corridos tumbados theme)
        for (let i = 0; i < 8; i++) {
            const gunX = 100 + (i % 4) * 200;
            const gunY = 200 + Math.floor(i / 4) * 150;
            
            // Gun body
            const gunBody = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            gunBody.setAttribute('x', gunX);
            gunBody.setAttribute('y', gunY);
            gunBody.setAttribute('width', '40');
            gunBody.setAttribute('height', '12');
            gunBody.setAttribute('rx', '2');
            gunBody.setAttribute('fill', '#1a1a1a');
            gunBody.setAttribute('opacity', '0.9');
            gunBody.setAttribute('stroke', '#FFD700');
            gunBody.setAttribute('stroke-width', '1');
            gunBody.setAttribute('transform', `rotate(${-20 + Math.random() * 40} ${gunX} ${gunY})`);
            svg.appendChild(gunBody);
            
            // Gun barrel
            const barrel = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            barrel.setAttribute('x', gunX + 35);
            barrel.setAttribute('y', gunY + 2);
            barrel.setAttribute('width', '20');
            barrel.setAttribute('height', '8');
            barrel.setAttribute('rx', '1');
            barrel.setAttribute('fill', '#333333');
            barrel.setAttribute('opacity', '0.9');
            barrel.setAttribute('transform', `rotate(${-20 + Math.random() * 40} ${gunX + 35} ${gunY + 6})`);
            svg.appendChild(barrel);
            
            // Gun handle
            const handle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            handle.setAttribute('x', gunX - 8);
            handle.setAttribute('y', gunY + 10);
            handle.setAttribute('width', '12');
            handle.setAttribute('height', '20');
            handle.setAttribute('rx', '2');
            handle.setAttribute('fill', '#5D4037');
            handle.setAttribute('opacity', '0.9');
            handle.setAttribute('transform', `rotate(${-20 + Math.random() * 40} ${gunX - 2} ${gunY + 20})`);
            svg.appendChild(handle);
        }
        
        // Money stacks/bills
        for (let i = 0; i < 12; i++) {
            const moneyX = 120 + (i % 4) * 180;
            const moneyY = 350 + Math.floor(i / 4) * 100;
            
            // Stack of bills
            for (let j = 0; j < 5; j++) {
                const bill = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                bill.setAttribute('x', moneyX - j * 2);
                bill.setAttribute('y', moneyY - j * 2);
                bill.setAttribute('width', '30');
                bill.setAttribute('height', '15');
                bill.setAttribute('rx', '1');
                bill.setAttribute('fill', j === 0 ? '#006600' : '#004400');
                bill.setAttribute('opacity', '0.9');
                bill.setAttribute('stroke', '#FFD700');
                bill.setAttribute('stroke-width', '1');
                svg.appendChild(bill);
            }
            
            // Dollar sign on top bill
            const dollarSign = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            dollarSign.setAttribute('x', moneyX + 15);
            dollarSign.setAttribute('y', moneyY + 12);
            dollarSign.setAttribute('font-size', '10');
            dollarSign.setAttribute('fill', '#FFFFFF');
            dollarSign.setAttribute('font-weight', 'bold');
            dollarSign.setAttribute('text-anchor', 'middle');
            dollarSign.textContent = '$';
            svg.appendChild(dollarSign);
        }
        
        // Tequila bottles (from lyrics: "Dame tequila")
        for (let i = 0; i < 6; i++) {
            const bottleX = 150 + (i % 3) * 250;
            const bottleY = 400;
            
            // Bottle body
            const bottle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bottle.setAttribute('x', bottleX - 12);
            bottle.setAttribute('y', bottleY - 50);
            bottle.setAttribute('width', '24');
            bottle.setAttribute('height', '50');
            bottle.setAttribute('rx', '3');
            bottle.setAttribute('fill', '#FFFFFF');
            bottle.setAttribute('opacity', '0.9');
            bottle.setAttribute('stroke', '#FFD700');
            bottle.setAttribute('stroke-width', '2');
            svg.appendChild(bottle);
            
            // Bottle neck
            const neck = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            neck.setAttribute('x', bottleX - 6);
            neck.setAttribute('y', bottleY - 65);
            neck.setAttribute('width', '12');
            neck.setAttribute('height', '15');
            neck.setAttribute('rx', '2');
            neck.setAttribute('fill', '#FFFFFF');
            neck.setAttribute('opacity', '0.9');
            svg.appendChild(neck);
            
            // Bottle label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            label.setAttribute('x', bottleX - 10);
            label.setAttribute('y', bottleY - 35);
            label.setAttribute('width', '20');
            label.setAttribute('height', '15');
            label.setAttribute('rx', '1');
            label.setAttribute('fill', '#FF6B35');
            label.setAttribute('opacity', '0.9');
            svg.appendChild(label);
        }
        
        // Harp/sierra symbols (from "Túmbame una sierra, O ponme el arpa")
        for (let i = 0; i < 4; i++) {
            const harpX = 200 + (i % 2) * 400;
            const harpY = 150;
            
            // Harp shape (simplified)
            const harpFrame = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            harpFrame.setAttribute('d', `M ${harpX} ${harpY + 60} 
                                        Q ${harpX - 30} ${harpY} ${harpX} ${harpY - 10}
                                        Q ${harpX + 30} ${harpY} ${harpX} ${harpY + 60} Z`);
            harpFrame.setAttribute('fill', '#8B4513');
            harpFrame.setAttribute('opacity', '0.8');
            harpFrame.setAttribute('stroke', '#654321');
            harpFrame.setAttribute('stroke-width', '2');
            svg.appendChild(harpFrame);
            
            // Harp strings
            for (let s = 0; s < 8; s++) {
                const string = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                string.setAttribute('x1', harpX - 25 + s * 7);
                string.setAttribute('y1', harpY);
                string.setAttribute('x2', harpX - 20 + s * 7);
                string.setAttribute('y2', harpY + 55);
                string.setAttribute('stroke', '#FFD700');
                string.setAttribute('stroke-width', '1');
                string.setAttribute('opacity', '0.8');
                svg.appendChild(string);
            }
        }
    }
    
    // Campfire elements (for "Harmonizing at the Campfire")
    const campfireX = 400;
    const campfireY = 450;
    
    // Fire logs
    for (let i = 0; i < 3; i++) {
        const log = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const angle = (Math.PI * 2 / 3) * i;
        log.setAttribute('x', campfireX - 15 + Math.cos(angle) * 10);
        log.setAttribute('y', campfireY - 5 + Math.sin(angle) * 10);
        log.setAttribute('width', '30');
        log.setAttribute('height', '8');
        log.setAttribute('rx', '4');
        log.setAttribute('transform', `rotate(${angle * 180 / Math.PI} ${campfireX} ${campfireY})`);
        log.setAttribute('fill', '#5D4037');
        log.setAttribute('opacity', '0.8');
        svg.appendChild(log);
    }
    
    // Flames
    for (let i = 0; i < 15; i++) {
        const flame = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const flameX = campfireX - 20 + Math.random() * 40;
        const flameY = campfireY - 30 - Math.random() * 30;
        const width = 5 + Math.random() * 8;
        const height = 15 + Math.random() * 20;
        
        const flamePath = `M ${flameX} ${flameY + height}
                          Q ${flameX - width/2} ${flameY + height/2} ${flameX} ${flameY}
                          Q ${flameX + width/2} ${flameY + height/2} ${flameX} ${flameY + height} Z`;
        flame.setAttribute('d', flamePath);
        flame.setAttribute('fill', getColor(i));
        flame.setAttribute('opacity', '0.9');
        flame.style.animation = `flameFlicker ${0.5 + Math.random() * 0.5}s ease-in-out infinite`;
        flame.style.animationDelay = `${Math.random() * 0.3}s`;
        svg.appendChild(flame);
    }
    
    // Fire sparks
    for (let i = 0; i < 25; i++) {
        const spark = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        spark.setAttribute('cx', campfireX);
        spark.setAttribute('cy', campfireY - 20);
        spark.setAttribute('r', '1.5');
        spark.setAttribute('fill', getColor(i));
        spark.setAttribute('opacity', '0.9');
        const sparkAngle = Math.random() * Math.PI * 2;
        const sparkDistance = 30 + Math.random() * 50;
        spark.style.animation = `sparkRise ${1 + Math.random() * 1.5}s ease-out infinite`;
        spark.style.animationDelay = `${Math.random() * 0.5}s`;
        spark.style.transform = `translate(${sparkDistance * Math.cos(sparkAngle)}px, ${-sparkDistance * Math.sin(sparkAngle)}px)`;
        svg.appendChild(spark);
    }
    
    return svg;
}

function createKaleidoscope(index, params = null) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    const centerX = 400;
    const centerY = 250;
    const segments = 12;
    
    // Use custom colors if provided, otherwise use theme colors
    const getColor = params && params.colors 
        ? (i) => params.colors[i % params.colors.length]
        : (i) => getThemeColor(i * 30);
    
    const theme = params && params.theme ? params.theme : 'default';
    
    // Hypnotizing spiral patterns for "Look at Me Now"
    if (theme === 'reflection' || theme === 'mirror_reflection') {
        // Multiple rotating spirals for hypnotic effect
        for (let spiral = 0; spiral < 8; spiral++) {
            const spiralAngle = (Math.PI * 2 / 8) * spiral;
            const spiralRadius = 100 + spiral * 15;
            
            for (let i = 0; i < 60; i++) {
                const angle = i * 0.2 + spiralAngle;
                const radius = (i / 60) * spiralRadius;
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);
                
                const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                dot.setAttribute('cx', x);
                dot.setAttribute('cy', y);
                dot.setAttribute('r', '3');
                dot.setAttribute('fill', getColor(i + spiral));
                dot.setAttribute('opacity', '0.9');
                dot.style.filter = 'drop-shadow(0 0 8px rgba(255, 200, 87, 0.8))';
                dot.style.animation = `hypnotize ${4 + spiral * 0.5}s linear infinite`;
                dot.style.animationDelay = `${spiral * 0.3 + i * 0.05}s`;
                svg.appendChild(dot);
            }
        }
        
        // Concentric circles pulsing (hypnotic effect)
        for (let ring = 1; ring <= 10; ring++) {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', centerX);
            circle.setAttribute('cy', centerY);
            circle.setAttribute('r', ring * 20);
            circle.setAttribute('fill', 'none');
            circle.setAttribute('stroke', getColor(ring * 3));
            circle.setAttribute('stroke-width', '3');
            circle.setAttribute('opacity', '0.7');
            circle.style.animation = `hypnoticPulse ${2 + ring * 0.2}s ease-in-out infinite`;
            circle.style.animationDelay = `${ring * 0.1}s`;
            svg.appendChild(circle);
        }
        
        // Rotating mandala-like pattern
        for (let i = 0; i < segments; i++) {
            const angle = (Math.PI * 2 / segments) * i;
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let d = `M ${centerX} ${centerY}`;
            for (let r = 0; r < 250; r += 3) {
                const x = centerX + r * Math.cos(angle + r / 30);
                const y = centerY + r * Math.sin(angle + r / 30);
                d += ` L ${x} ${y}`;
            }
            path.setAttribute('d', d);
            path.setAttribute('stroke', getColor(i));
            path.setAttribute('stroke-width', '4');
            path.setAttribute('opacity', '0.9');
            path.setAttribute('fill', 'none');
            path.style.filter = 'drop-shadow(0 0 10px rgba(255, 200, 87, 0.8))';
            path.style.animation = `hypnoticRotate ${5 + i * 0.3}s linear infinite`;
            svg.appendChild(path);
        }
        
        // Eye/center point
        const centerEye = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        centerEye.setAttribute('cx', centerX);
        centerEye.setAttribute('cy', centerY);
        centerEye.setAttribute('r', '15');
        centerEye.setAttribute('fill', getColor(0));
        centerEye.setAttribute('opacity', '1');
        centerEye.style.filter = 'drop-shadow(0 0 20px rgba(255, 200, 87, 1))';
        centerEye.style.animation = 'hypnoticEye 2s ease-in-out infinite';
        svg.appendChild(centerEye);
        
        const innerEye = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        innerEye.setAttribute('cx', centerX);
        innerEye.setAttribute('cy', centerY);
        innerEye.setAttribute('r', '8');
        innerEye.setAttribute('fill', '#000000');
        innerEye.setAttribute('opacity', '1');
        svg.appendChild(innerEye);
    } else {
        // Original kaleidoscope pattern for other themes
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
            path.setAttribute('stroke', getColor(i));
            path.setAttribute('stroke-width', '5');
            path.setAttribute('opacity', '0.85');
            path.setAttribute('fill', 'none');
            path.style.animation = `kaleidoscope ${3 + i * 0.2}s linear infinite`;
            svg.appendChild(path);
        }
        
        // Mirror/reflection elements (India theme)
        for (let i = 0; i < 20; i++) {
            const mirror = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            const x = 100 + (i % 5) * 150;
            const y = 50 + Math.floor(i / 5) * 150;
            const size = 30 + Math.random() * 20;
            mirror.setAttribute('x', x);
            mirror.setAttribute('y', y);
            mirror.setAttribute('width', size);
            mirror.setAttribute('height', size);
            mirror.setAttribute('fill', getColor(i));
            mirror.setAttribute('opacity', '0.6');
            mirror.setAttribute('stroke', getColor(i + 1));
            mirror.setAttribute('stroke-width', '2');
            mirror.style.filter = 'drop-shadow(0 0 10px rgba(255, 200, 87, 0.5))';
            mirror.style.animation = `mirrorReflect ${4 + Math.random() * 2}s ease-in-out infinite`;
            mirror.style.animationDelay = `${Math.random() * 1}s`;
            svg.appendChild(mirror);
        }
        
        // Beautiful Indian elements (for "India")
        if (theme === 'vibrant' || theme === 'patterns') {
            // Lotus flowers (beautiful Indian symbol)
            for (let i = 0; i < 10; i++) {
                const lotusX = 100 + (i % 5) * 150;
                const lotusY = 120 + Math.floor(i / 5) * 200;
                
                // Lotus outer petals (8 petals)
                for (let p = 0; p < 8; p++) {
                    const petalAngle = (Math.PI * 2 / 8) * p;
                    const petal = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
                    const petalX = lotusX + 25 * Math.cos(petalAngle);
                    const petalY = lotusY + 25 * Math.sin(petalAngle);
                    petal.setAttribute('cx', petalX);
                    petal.setAttribute('cy', petalY);
                    petal.setAttribute('rx', '12');
                    petal.setAttribute('ry', '18');
                    petal.setAttribute('fill', getColor(i + p));
                    petal.setAttribute('opacity', '0.9');
                    petal.setAttribute('transform', `rotate(${petalAngle * 180 / Math.PI} ${petalX} ${petalY})`);
                    petal.style.filter = 'drop-shadow(0 0 10px rgba(255, 107, 53, 0.8))';
                    petal.style.animation = `lotusBloom ${4 + Math.random() * 2}s ease-in-out infinite`;
                    petal.style.animationDelay = `${p * 0.1}s`;
                    svg.appendChild(petal);
                }
                
                // Lotus inner petals (4 petals)
                for (let p = 0; p < 4; p++) {
                    const petalAngle = (Math.PI * 2 / 4) * p;
                    const petal = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
                    const petalX = lotusX + 10 * Math.cos(petalAngle);
                    const petalY = lotusY + 10 * Math.sin(petalAngle);
                    petal.setAttribute('cx', petalX);
                    petal.setAttribute('cy', petalY);
                    petal.setAttribute('rx', '8');
                    petal.setAttribute('ry', '12');
                    petal.setAttribute('fill', getColor(i * 2 + p));
                    petal.setAttribute('opacity', '0.95');
                    petal.setAttribute('transform', `rotate(${petalAngle * 180 / Math.PI + 45} ${petalX} ${petalY})`);
                    petal.style.filter = 'drop-shadow(0 0 8px rgba(255, 217, 61, 0.9))';
                    petal.style.animation = `lotusBloom ${4 + Math.random() * 2}s ease-in-out infinite`;
                    petal.style.animationDelay = `${p * 0.15}s`;
                    svg.appendChild(petal);
                }
                
                // Lotus center
                const center = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                center.setAttribute('cx', lotusX);
                center.setAttribute('cy', lotusY);
                center.setAttribute('r', '8');
                center.setAttribute('fill', getColor(i * 3));
                center.setAttribute('opacity', '1');
                center.style.filter = 'drop-shadow(0 0 12px rgba(255, 107, 53, 1))';
                svg.appendChild(center);
            }
            
            // Peacocks (beautiful Indian birds)
            for (let i = 0; i < 6; i++) {
                const peacockX = 150 + (i % 3) * 250;
                const peacockY = 350 + Math.floor(i / 3) * 100;
                
                // Peacock body
                const body = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
                body.setAttribute('cx', peacockX);
                body.setAttribute('cy', peacockY);
                body.setAttribute('rx', '15');
                body.setAttribute('ry', '20');
                body.setAttribute('fill', '#003366');
                body.setAttribute('opacity', '0.9');
                svg.appendChild(body);
                
                // Peacock head
                const head = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                head.setAttribute('cx', peacockX);
                head.setAttribute('cy', peacockY - 25);
                head.setAttribute('r', '8');
                head.setAttribute('fill', '#003366');
                head.setAttribute('opacity', '0.9');
                svg.appendChild(head);
                
                // Peacock crown
                const crown = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                crown.setAttribute('points', `${peacockX - 3} ${peacockY - 33} ${peacockX} ${peacockY - 40} ${peacockX + 3} ${peacockY - 33}`);
                crown.setAttribute('fill', getColor(i));
                crown.setAttribute('opacity', '1');
                crown.style.filter = 'drop-shadow(0 0 5px rgba(255, 107, 53, 0.8))';
                svg.appendChild(crown);
                
                // Peacock tail feathers (beautiful fan)
                for (let f = 0; f < 12; f++) {
                    const featherAngle = (Math.PI / 6) * f - Math.PI / 2;
                    const feather = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    const startX = peacockX;
                    const startY = peacockY + 15;
                    const endX = peacockX + 60 * Math.cos(featherAngle);
                    const endY = peacockY + 15 + 60 * Math.sin(featherAngle);
                    
                    feather.setAttribute('d', `M ${startX} ${startY} Q ${startX + 20 * Math.cos(featherAngle)} ${startY + 20} ${endX} ${endY}`);
                    feather.setAttribute('stroke', getColor(i + f % 4));
                    feather.setAttribute('stroke-width', '4');
                    feather.setAttribute('fill', 'none');
                    feather.setAttribute('stroke-linecap', 'round');
                    feather.setAttribute('opacity', '0.9');
                    feather.style.filter = 'drop-shadow(0 0 8px rgba(255, 107, 53, 0.7))';
                    feather.style.animation = `peacockFeather ${3 + Math.random() * 2}s ease-in-out infinite`;
                    feather.style.animationDelay = `${f * 0.1}s`;
                    svg.appendChild(feather);
                }
            }
            
            // Mandala patterns (beautiful Indian geometric designs)
            for (let i = 0; i < 5; i++) {
                const mandalaX = 200 + (i % 3) * 200;
                const mandalaY = 250 + Math.floor(i / 3) * 100;
                const mandalaSize = 50 + Math.random() * 30;
                
                // Outer ring of mandala
                for (let ring = 0; ring < 3; ring++) {
                    const ringRadius = mandalaSize - ring * 15;
                    const mandalaRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    mandalaRing.setAttribute('cx', mandalaX);
                    mandalaRing.setAttribute('cy', mandalaY);
                    mandalaRing.setAttribute('r', ringRadius);
                    mandalaRing.setAttribute('fill', 'none');
                    mandalaRing.setAttribute('stroke', getColor(i * 2 + ring));
                    mandalaRing.setAttribute('stroke-width', '2');
                    mandalaRing.setAttribute('opacity', '0.8');
                    mandalaRing.style.filter = 'drop-shadow(0 0 8px rgba(255, 107, 53, 0.7))';
                    mandalaRing.style.animation = `mandalaRotate ${6 + ring * 2}s linear infinite`;
                    mandalaRing.style.animationDelay = `${ring * 0.5}s`;
                    svg.appendChild(mandalaRing);
                }
                
                // Mandala center design
                const centerDesign = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                const points = [];
                for (let p = 0; p < 8; p++) {
                    const angle = (Math.PI * 2 / 8) * p;
                    const px = mandalaX + (mandalaSize / 3) * Math.cos(angle);
                    const py = mandalaY + (mandalaSize / 3) * Math.sin(angle);
                    points.push(`${px},${py}`);
                }
                centerDesign.setAttribute('points', points.join(' '));
                centerDesign.setAttribute('fill', getColor(i * 2));
                centerDesign.setAttribute('opacity', '0.9');
                centerDesign.style.filter = 'drop-shadow(0 0 10px rgba(255, 217, 61, 0.9))';
                centerDesign.style.animation = `mandalaPulse ${4 + Math.random() * 2}s ease-in-out infinite`;
                svg.appendChild(centerDesign);
            }
            
            // Ornamental patterns (beautiful decorative elements)
            for (let i = 0; i < 20; i++) {
                const patternX = Math.random() * 800;
                const patternY = Math.random() * 500;
                
                // Decorative star pattern
                const star = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                const starSize = 6 + Math.random() * 8;
                const starPoints = [];
                for (let s = 0; s < 8; s++) {
                    const angle = (Math.PI * 2 / 8) * s - Math.PI / 2;
                    starPoints.push(`${patternX + starSize * Math.cos(angle)},${patternY + starSize * Math.sin(angle)}`);
                }
                star.setAttribute('points', starPoints.join(' '));
                star.setAttribute('fill', getColor(i));
                star.setAttribute('opacity', '0.8');
                star.style.filter = 'drop-shadow(0 0 8px rgba(255, 107, 53, 0.7))';
                star.style.animation = `indianSparkle ${2 + Math.random() * 2}s ease-in-out infinite`;
                star.style.animationDelay = `${Math.random() * 1}s`;
                svg.appendChild(star);
            }
        } else {
            // Original pattern decorations
            for (let i = 0; i < 15; i++) {
                const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                pattern.setAttribute('cx', Math.random() * 800);
                pattern.setAttribute('cy', Math.random() * 500);
                pattern.setAttribute('r', '4');
                pattern.setAttribute('fill', getColor(i));
                pattern.setAttribute('opacity', '0.8');
                pattern.style.filter = 'drop-shadow(0 0 5px rgba(255, 200, 87, 0.6))';
                pattern.style.animation = `patternPulse ${2 + Math.random()}s ease-in-out infinite`;
                pattern.style.animationDelay = `${Math.random() * 1}s`;
                svg.appendChild(pattern);
            }
        }
    }
    
    return svg;
}

function createSoundWaves(index, params = null) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    // Use custom colors if provided, otherwise use theme colors
    const getColor = params && params.colors 
        ? (i) => params.colors[i % params.colors.length]
        : (i) => getThemeColor(i * 7);
    
    for (let i = 0; i < 50; i++) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const x = i * 16;
        const height = 50 + Math.sin(i) * 30;
        rect.setAttribute('x', x);
        rect.setAttribute('y', 250 - height / 2);
        rect.setAttribute('width', 12);
        rect.setAttribute('height', height);
        rect.setAttribute('fill', getColor(i));
        rect.setAttribute('stroke', getColor(i));
        rect.setAttribute('stroke-width', '1');
        rect.setAttribute('opacity', '0.9');
        rect.style.animation = `soundWave ${1 + i * 0.05}s ease-in-out infinite`;
        rect.style.animationDelay = `${i * 0.05}s`;
        svg.appendChild(rect);
    }
    
    // Police elements (from lyrics: "los policías" - urban/police theme)
    const theme = params && params.theme ? params.theme : 'default';
    
    // Police sirens
    for (let i = 0; i < 3; i++) {
        const sirenX = 150 + i * 250;
        const sirenY = 100;
        
        // Police light - red
        const redLight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        redLight.setAttribute('cx', sirenX);
        redLight.setAttribute('cy', sirenY);
        redLight.setAttribute('r', '15');
        redLight.setAttribute('fill', '#FF0000');
        redLight.setAttribute('opacity', '0.9');
        redLight.style.filter = 'drop-shadow(0 0 15px rgba(255, 0, 0, 0.8))';
        redLight.style.animation = `sirenFlash ${1 + Math.random() * 0.5}s ease-in-out infinite`;
        svg.appendChild(redLight);
        
        // Police light - blue
        const blueLight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        blueLight.setAttribute('cx', sirenX);
        blueLight.setAttribute('cy', sirenY + 35);
        blueLight.setAttribute('r', '15');
        blueLight.setAttribute('fill', '#0000FF');
        blueLight.setAttribute('opacity', '0.9');
        blueLight.style.filter = 'drop-shadow(0 0 15px rgba(0, 0, 255, 0.8))';
        blueLight.style.animation = `sirenFlash ${1 + Math.random() * 0.5}s ease-in-out infinite`;
        blueLight.style.animationDelay = '0.5s';
        svg.appendChild(blueLight);
        
        // Siren base
        const base = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        base.setAttribute('x', sirenX - 10);
        base.setAttribute('y', sirenY + 50);
        base.setAttribute('width', '20');
        base.setAttribute('height', '8');
        base.setAttribute('rx', '2');
        base.setAttribute('fill', '#333333');
        base.setAttribute('opacity', '0.8');
        svg.appendChild(base);
    }
    
    // Police cars (from "los policías" - police cars with lights)
    if (theme === 'urban_energy' || theme === 'sound_waves') {
        for (let i = 0; i < 5; i++) {
            const carX = -100 + (i % 3) * 300;
            const carY = 380 + Math.floor(i / 3) * 80;
            
            // Car body
            const carBody = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            carBody.setAttribute('x', carX);
            carBody.setAttribute('y', carY);
            carBody.setAttribute('width', '80');
            carBody.setAttribute('height', '35');
            carBody.setAttribute('rx', '5');
            carBody.setAttribute('fill', '#000080');
            carBody.setAttribute('opacity', '0.9');
            carBody.style.animation = `policeCarDrive ${12 + Math.random() * 4}s ease-in-out infinite`;
            carBody.style.animationDelay = `${i * 0.5}s`;
            svg.appendChild(carBody);
            
            // Car roof
            const roof = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            roof.setAttribute('x', carX + 15);
            roof.setAttribute('y', carY - 20);
            roof.setAttribute('width', '50');
            roof.setAttribute('height', '20');
            roof.setAttribute('rx', '5');
            roof.setAttribute('fill', '#000080');
            roof.setAttribute('opacity', '0.9');
            roof.style.animation = `policeCarDrive ${12 + Math.random() * 4}s ease-in-out infinite`;
            roof.style.animationDelay = `${i * 0.5}s`;
            svg.appendChild(roof);
            
            // Police light bar on roof - red
            const lightBar1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            lightBar1.setAttribute('x', carX + 20);
            lightBar1.setAttribute('y', carY - 25);
            lightBar1.setAttribute('width', '10');
            lightBar1.setAttribute('height', '8');
            lightBar1.setAttribute('rx', '2');
            lightBar1.setAttribute('fill', '#FF0000');
            lightBar1.setAttribute('opacity', '1');
            lightBar1.style.filter = 'drop-shadow(0 0 10px rgba(255, 0, 0, 0.9))';
            lightBar1.style.animation = `policeLightFlash ${0.8}s ease-in-out infinite`;
            svg.appendChild(lightBar1);
            
            // Police light bar on roof - blue
            const lightBar2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            lightBar2.setAttribute('x', carX + 50);
            lightBar2.setAttribute('y', carY - 25);
            lightBar2.setAttribute('width', '10');
            lightBar2.setAttribute('height', '8');
            lightBar2.setAttribute('rx', '2');
            lightBar2.setAttribute('fill', '#0000FF');
            lightBar2.setAttribute('opacity', '1');
            lightBar2.style.filter = 'drop-shadow(0 0 10px rgba(0, 0, 255, 0.9))';
            lightBar2.style.animation = `policeLightFlash ${0.8}s ease-in-out infinite`;
            lightBar2.style.animationDelay = '0.4s';
            svg.appendChild(lightBar2);
            
            // Car wheels - slower and smoother
            for (let j = 0; j < 2; j++) {
                const wheel = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                wheel.setAttribute('cx', carX + 20 + j * 40);
                wheel.setAttribute('cy', carY + 35);
                wheel.setAttribute('r', '8');
                wheel.setAttribute('fill', '#333333');
                wheel.setAttribute('opacity', '0.9');
                wheel.style.animation = `wheelRotate ${1.5}s linear infinite`;
                wheel.style.animationDelay = `${i * 0.5}s`;
                svg.appendChild(wheel);
            }
        }
    }
    
    return svg;
}

function createFractalTree(index, params = null) {
    return createTreePattern(index, params);
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

function createLiquid(index, params = null) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    // Use custom colors if provided, otherwise use theme colors
    const getColor = params && params.colors 
        ? (i) => params.colors[i % params.colors.length]
        : (i) => getThemeColor(i * 5, 35);
    
    for (let i = 0; i < 20; i++) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let d = `M 0 ${250 + i * 10}`;
        for (let x = 0; x < 800; x += 5) {
            d += ` L ${x} ${250 + i * 10 + Math.sin(x / 30 + i) * 20}`;
        }
        path.setAttribute('d', d);
        path.setAttribute('stroke', getColor(i));
        path.setAttribute('stroke-width', '5');
        path.setAttribute('opacity', '0.85');
        path.setAttribute('fill', 'none');
        path.style.animation = `liquid ${3 + i * 0.1}s ease-in-out infinite`;
        svg.appendChild(path);
    }
    
    // Alcohol bubbles (from lyrics: "Me ahogo en alcohol" - drowning in alcohol)
    for (let i = 0; i < 60; i++) {
        const bubble = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const x = Math.random() * 800;
        const y = 400 + Math.random() * 100;
        const r = 3 + Math.random() * 8;
        bubble.setAttribute('cx', x);
        bubble.setAttribute('cy', y);
        bubble.setAttribute('r', r);
        bubble.setAttribute('fill', getColor(i));
        bubble.setAttribute('opacity', '0.7');
        bubble.setAttribute('stroke', getColor(i));
        bubble.setAttribute('stroke-width', '1');
        bubble.style.filter = 'drop-shadow(0 0 5px rgba(138, 90, 159, 0.5))';
        bubble.style.animation = `bubbleRise ${3 + Math.random() * 3}s ease-out infinite`;
        bubble.style.animationDelay = `${Math.random() * 2}s`;
        svg.appendChild(bubble);
    }
    
    // Bottle/glass silhouette
    for (let i = 0; i < 3; i++) {
        const bottleX = 150 + i * 250;
        
        // Bottle body
        const bottle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bottle.setAttribute('x', bottleX - 15);
        bottle.setAttribute('y', 350);
        bottle.setAttribute('width', '30');
        bottle.setAttribute('height', '80');
        bottle.setAttribute('rx', '5');
        bottle.setAttribute('fill', getColor(i * 2));
        bottle.setAttribute('opacity', '0.5');
        bottle.setAttribute('stroke', getColor(i * 2 + 1));
        bottle.setAttribute('stroke-width', '2');
        bottle.style.filter = 'drop-shadow(0 0 10px rgba(138, 90, 159, 0.6))';
        svg.appendChild(bottle);
        
        // Bottle neck
        const neck = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        neck.setAttribute('x', bottleX - 8);
        neck.setAttribute('y', 340);
        neck.setAttribute('width', '16');
        neck.setAttribute('height', '20');
        neck.setAttribute('rx', '2');
        neck.setAttribute('fill', getColor(i * 2));
        neck.setAttribute('opacity', '0.5');
        svg.appendChild(neck);
    }
    
    return svg;
}

// Custom visualizer for Lluvia (Rain) - Enhanced liquid with rain drops
function createLluvia(index, params = null) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    const colors = params && params.colors 
        ? params.colors 
        : ['#4A90E2', '#5BA3F5', '#6BB6FF', '#7CC7FF', '#8DD8FF'];
    
    // Water waves at bottom (liquid effect)
    for (let i = 0; i < 20; i++) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let d = `M 0 ${400 + i * 5}`;
        for (let x = 0; x < 800; x += 5) {
            d += ` L ${x} ${400 + i * 5 + Math.sin(x / 30 + i) * 15}`;
        }
        path.setAttribute('d', d);
        path.setAttribute('stroke', colors[i % colors.length]);
        path.setAttribute('stroke-width', '4');
        path.setAttribute('opacity', '0.85');
        path.setAttribute('fill', 'none');
        path.style.animation = `liquid ${3 + i * 0.1}s ease-in-out infinite`;
        svg.appendChild(path);
    }
    
    // Rain drops falling from top
    for (let i = 0; i < 100; i++) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        const x = Math.random() * 800;
        const length = 15 + Math.random() * 20;
        const speed = 2 + Math.random() * 2;
        
        line.setAttribute('x1', x);
        line.setAttribute('y1', '-10');
        line.setAttribute('x2', x);
        line.setAttribute('y2', `-${10 + length}`);
        line.setAttribute('stroke', colors[Math.floor(Math.random() * colors.length)]);
        line.setAttribute('stroke-width', '2');
        line.setAttribute('opacity', '0.8');
        
        // Animation for falling rain
        const delay = Math.random() * 5;
        line.style.animation = `rainFall ${speed}s linear infinite`;
        line.style.animationDelay = `${delay}s`;
        line.style.transform = `translateY(-${delay * 100}px)`;
        
        svg.appendChild(line);
    }
    
    // Cars on the road (from lyrics: "Las luces de los autos reflejan el asfalto")
    for (let i = 0; i < 5; i++) {
        const carX = 50 + i * 150 + Math.random() * 50;
        const carY = 420;
        
        // Car body
        const carBody = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        carBody.setAttribute('x', carX);
        carBody.setAttribute('y', carY);
        carBody.setAttribute('width', '60');
        carBody.setAttribute('height', '30');
        carBody.setAttribute('rx', '5');
        carBody.setAttribute('fill', colors[(i * 2) % colors.length]);
        carBody.setAttribute('opacity', '0.7');
        carBody.style.filter = 'drop-shadow(0 0 10px rgba(74, 144, 226, 0.5))';
        carBody.style.animation = `carDrive ${8 + i * 2}s linear infinite`;
        svg.appendChild(carBody);
        
        // Car windshield
        const windshield = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        windshield.setAttribute('x', carX + 5);
        windshield.setAttribute('y', carY + 5);
        windshield.setAttribute('width', '25');
        windshield.setAttribute('height', '15');
        windshield.setAttribute('rx', '2');
        windshield.setAttribute('fill', '#2C3E50');
        windshield.setAttribute('opacity', '0.6');
        svg.appendChild(windshield);
        
        // Car lights (reflecting on asphalt)
        const light1 = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        light1.setAttribute('cx', carX + 10);
        light1.setAttribute('cy', carY + 35);
        light1.setAttribute('rx', '8');
        light1.setAttribute('ry', '4');
        light1.setAttribute('fill', '#FFD700');
        light1.setAttribute('opacity', '0.8');
        light1.style.animation = `lightFlash ${1 + Math.random()}s ease-in-out infinite`;
        svg.appendChild(light1);
        
        const light2 = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        light2.setAttribute('cx', carX + 50);
        light2.setAttribute('cy', carY + 35);
        light2.setAttribute('rx', '8');
        light2.setAttribute('ry', '4');
        light2.setAttribute('fill', '#FFD700');
        light2.setAttribute('opacity', '0.8');
        light2.style.animation = `lightFlash ${1 + Math.random()}s ease-in-out infinite`;
        light2.style.animationDelay = '0.5s';
        svg.appendChild(light2);
    }
    
    // Trees swaying in the rain (from lyrics: "los árboles se mecen")
    for (let i = 0; i < 8; i++) {
        const treeX = 80 + i * 90;
        const treeY = 380;
        
        // Tree trunk
        const trunk = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        trunk.setAttribute('x', treeX);
        trunk.setAttribute('y', treeY);
        trunk.setAttribute('width', '12');
        trunk.setAttribute('height', '60');
        trunk.setAttribute('fill', '#5D4037');
        trunk.setAttribute('opacity', '0.8');
        trunk.style.animation = `treeSway ${3 + Math.random() * 2}s ease-in-out infinite`;
        svg.appendChild(trunk);
        
        // Tree leaves (simplified circles)
        for (let j = 0; j < 5; j++) {
            const leaf = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            leaf.setAttribute('cx', treeX + 6 + (j % 3 - 1) * 15);
            leaf.setAttribute('cy', treeY - 10 - j * 12);
            leaf.setAttribute('rx', '20');
            leaf.setAttribute('ry', '25');
            leaf.setAttribute('fill', '#2E7D32');
            leaf.setAttribute('opacity', '0.7');
            leaf.style.animation = `treeSway ${3 + Math.random() * 2}s ease-in-out infinite`;
            leaf.style.animationDelay = `${j * 0.1}s`;
            svg.appendChild(leaf);
        }
    }
    
    // Water drops on glass (from lyrics: "El agua sobre el vidrio")
    for (let i = 0; i < 20; i++) {
        const drop = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        drop.setAttribute('cx', 200 + Math.random() * 400);
        drop.setAttribute('cy', 100 + Math.random() * 200);
        drop.setAttribute('r', 2 + Math.random() * 3);
        drop.setAttribute('fill', colors[Math.floor(Math.random() * colors.length)]);
        drop.setAttribute('opacity', '0.6');
        drop.style.animation = `dropSlide ${4 + Math.random() * 3}s ease-in-out infinite`;
        drop.style.animationDelay = `${Math.random() * 2}s`;
        svg.appendChild(drop);
    }
    
    return svg;
}

// Custom visualizer for Berlin - Aurora with city/northern lights theme
function createBerlin(index, params = null) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    const colors = params && params.colors 
        ? params.colors 
        : ['#4A5568', '#5A6578', '#6A7588', '#7A8598', '#8A95A8', '#9BA5B8'];
    
    // Aurora effect (curved flowing lines)
    for (let i = 0; i < 80; i++) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let d = `M ${i * 10} 0`;
        for (let y = 0; y < 500; y += 10) {
            const wave = Math.sin(y / 80 + i * 0.1) * 15;
            d += ` L ${i * 10 + wave} ${y}`;
        }
        path.setAttribute('d', d);
        path.setAttribute('stroke', colors[i % colors.length]);
        path.setAttribute('stroke-width', '4');
        path.setAttribute('opacity', '0.75');
        path.setAttribute('fill', 'none');
        path.style.animation = `aurora ${5 + i * 0.05}s ease-in-out infinite`;
        path.style.animationDelay = `${i * 0.05}s`;
        svg.appendChild(path);
    }
    
    // Snowflakes falling (from lyrics: "De la nieve en mi nariz")
    for (let i = 0; i < 50; i++) {
        const snowflake = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const x = Math.random() * 800;
        const y = -10;
        const size = 3 + Math.random() * 4;
        
        // Simple snowflake shape (6-pointed star)
        let d = `M ${x} ${y}`;
        for (let j = 0; j < 6; j++) {
            const angle1 = (Math.PI * 2 / 6) * j;
            const angle2 = (Math.PI * 2 / 6) * j + Math.PI / 6;
            const x1 = x + size * Math.cos(angle1);
            const y1 = y + size * Math.sin(angle1);
            const x2 = x + size * 0.5 * Math.cos(angle2);
            const y2 = y + size * 0.5 * Math.sin(angle2);
            d += ` L ${x1} ${y1} L ${x2} ${y2} L ${x} ${y}`;
        }
        
        snowflake.setAttribute('d', d);
        snowflake.setAttribute('fill', '#FFFFFF');
        snowflake.setAttribute('opacity', '0.9');
        snowflake.setAttribute('stroke', '#E0E0E0');
        snowflake.setAttribute('stroke-width', '0.5');
        const speed = 3 + Math.random() * 3;
        snowflake.style.animation = `snowFall ${speed}s linear infinite`;
        snowflake.style.animationDelay = `${Math.random() * 2}s`;
        svg.appendChild(snowflake);
    }
    
    // City silhouette at bottom (simple geometric shapes)
    for (let i = 0; i < 15; i++) {
        const width = 30 + Math.random() * 40;
        const height = 50 + Math.random() * 100;
        const x = i * 55;
        
        // Building body
        const building = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        building.setAttribute('x', x);
        building.setAttribute('y', 500 - height);
        building.setAttribute('width', width);
        building.setAttribute('height', height);
        building.setAttribute('fill', colors[colors.length - 1]);
        building.setAttribute('opacity', '0.6');
        building.setAttribute('stroke', colors[colors.length - 2]);
        building.setAttribute('stroke-width', '1');
        svg.appendChild(building);
        
        // Window lights (from lyrics: "Y las luces en mi ventana")
        const windowsPerFloor = Math.floor(width / 12);
        const floors = Math.floor(height / 20);
        for (let floor = 0; floor < floors; floor++) {
            for (let win = 0; win < windowsPerFloor; win++) {
                if (Math.random() > 0.3) { // Some windows lit
                    const window = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    window.setAttribute('x', x + 5 + win * 12);
                    window.setAttribute('y', 500 - height + 5 + floor * 20);
                    window.setAttribute('width', '6');
                    window.setAttribute('height', '10');
                    window.setAttribute('fill', '#FFD700');
                    window.setAttribute('opacity', '0.8');
                    window.style.animation = `windowFlicker ${2 + Math.random() * 3}s ease-in-out infinite`;
                    window.style.animationDelay = `${Math.random() * 1}s`;
                    svg.appendChild(window);
                }
            }
        }
    }
    
    // Northern lights/Baltic theme elements (from lyrics: "Me bañé en el Báltico")
    for (let i = 0; i < 10; i++) {
        const wave = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const waveY = 300 + i * 20;
        let d = `M 0 ${waveY}`;
        for (let x = 0; x < 800; x += 10) {
            d += ` L ${x} ${waveY + Math.sin(x / 50 + i) * 10}`;
        }
        wave.setAttribute('d', d);
        wave.setAttribute('stroke', colors[i % colors.length]);
        wave.setAttribute('stroke-width', '3');
        wave.setAttribute('opacity', '0.4');
        wave.setAttribute('fill', 'none');
        wave.style.animation = `aurora ${6 + i * 0.2}s ease-in-out infinite`;
        svg.appendChild(wave);
    }
    
    return svg;
}

function createSolarSystem(index, params = null) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    svg.style.transform = 'perspective(1500px) rotateX(15deg)';
    svg.style.transformStyle = 'preserve-3d';
    
    const centerX = 400;
    const centerY = 250;
    
    // Use custom colors if provided, otherwise use theme colors
    const getColor = params && params.colors 
        ? (i) => params.colors[i % params.colors.length]
        : (i) => getThemeColor(i * 8);
    
    const sunColor = params && params.colors 
        ? params.colors[0] 
        : '#FF9500';
    
    // Sun
    const sun = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    sun.setAttribute('cx', centerX);
    sun.setAttribute('cy', centerY);
    sun.setAttribute('r', 40);
    sun.setAttribute('fill', sunColor);
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
        planet.setAttribute('fill', getColor(i));
        planet.setAttribute('opacity', '0.95');
        const orbitZ = i * -30;
        planet.style.transform = `translateZ(${orbitZ}px)`;
        planet.style.transformOrigin = `${centerX}px ${centerY}px`;
        planet.style.animation = `orbit3D ${12 + i * 2}s linear infinite`;
        planet.style.animationDelay = `${i * 1.5}s`;
        planet.style.filter = 'drop-shadow(0 0 15px rgba(255, 149, 0, 0.8))';
        svg.appendChild(planet);
    }
    
    // Religious elements (from "Mi religión", "Siempre traigo cruz" - spiritual/faith themes)
    const theme = params && params.theme ? params.theme : 'default';
    
    if (theme === 'faith' || theme === 'celestial_faith' || theme === 'spiritual' || theme === 'celestial' || theme === 'solar_system') {
        // More crosses for "Siempre traigo cruz" (I always carry a cross)
        const crossCount = (theme === 'faith' || theme === 'celestial_faith') ? 20 : 12;
        // More crosses (Latin crosses)
        for (let i = 0; i < crossCount; i++) {
            const crossX = 60 + (i % 5) * 160;
            const crossY = 60 + Math.floor(i / 5) * 120;
            
            // Cross vertical
            const vertical = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            vertical.setAttribute('x', crossX - 8);
            vertical.setAttribute('y', crossY - 30);
            vertical.setAttribute('width', '16');
            vertical.setAttribute('height', '60');
            vertical.setAttribute('fill', sunColor);
            vertical.setAttribute('opacity', '0.9');
            vertical.setAttribute('rx', '2');
            vertical.style.filter = 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.9))';
            vertical.style.animation = `crossGlow ${3 + i * 0.15}s ease-in-out infinite`;
            svg.appendChild(vertical);
            
            // Cross horizontal
            const horizontal = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            horizontal.setAttribute('x', crossX - 30);
            horizontal.setAttribute('y', crossY - 8);
            horizontal.setAttribute('width', '60');
            horizontal.setAttribute('height', '16');
            horizontal.setAttribute('fill', sunColor);
            horizontal.setAttribute('opacity', '0.9');
            horizontal.setAttribute('rx', '2');
            horizontal.style.filter = 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.9))';
            horizontal.style.animation = `crossGlow ${3 + i * 0.15}s ease-in-out infinite`;
            svg.appendChild(horizontal);
        }
        
        // Rosary beads
        for (let i = 0; i < 4; i++) {
            const rosaryX = 150 + (i % 2) * 500;
            const rosaryY = 150 + Math.floor(i / 2) * 200;
            
            for (let bead = 0; bead < 10; bead++) {
                const angle = (Math.PI * 2 / 10) * bead;
                const beadX = rosaryX + 40 * Math.cos(angle);
                const beadY = rosaryY + 40 * Math.sin(angle);
                
                const beadCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                beadCircle.setAttribute('cx', beadX);
                beadCircle.setAttribute('cy', beadY);
                beadCircle.setAttribute('r', '4');
                beadCircle.setAttribute('fill', sunColor);
                beadCircle.setAttribute('opacity', '0.8');
                beadCircle.style.filter = 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.7))';
                beadCircle.style.animation = `rosaryFloat ${4 + Math.random() * 2}s ease-in-out infinite`;
                beadCircle.style.animationDelay = `${bead * 0.1}s`;
                svg.appendChild(beadCircle);
            }
        }
        
        // Candles/flames (religious candles)
        for (let i = 0; i < 6; i++) {
            const candleX = 120 + (i % 3) * 250;
            const candleY = 400 + Math.floor(i / 3) * 50;
            
            // Candle body
            const candle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            candle.setAttribute('x', candleX - 8);
            candle.setAttribute('y', candleY - 40);
            candle.setAttribute('width', '16');
            candle.setAttribute('height', '40');
            candle.setAttribute('fill', '#FFFFFF');
            candle.setAttribute('opacity', '0.8');
            candle.setAttribute('rx', '2');
            svg.appendChild(candle);
            
            // Flame
            const flame = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            flame.setAttribute('cx', candleX);
            flame.setAttribute('cy', candleY - 45);
            flame.setAttribute('rx', '5');
            flame.setAttribute('ry', '12');
            flame.setAttribute('fill', sunColor);
            flame.setAttribute('opacity', '0.9');
            flame.style.filter = 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.9))';
            flame.style.animation = `candleFlicker ${1.5 + Math.random() * 1}s ease-in-out infinite`;
            flame.style.animationDelay = `${i * 0.2}s`;
            svg.appendChild(flame);
        }
        
        // Holy dove/bird symbols
        for (let i = 0; i < 5; i++) {
            const doveX = 200 + (i % 3) * 200;
            const doveY = 120 + Math.floor(i / 3) * 150;
            
            // Dove body (simplified)
            const dove = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            dove.setAttribute('cx', doveX);
            dove.setAttribute('cy', doveY);
            dove.setAttribute('rx', '20');
            dove.setAttribute('ry', '12');
            dove.setAttribute('fill', '#FFFFFF');
            dove.setAttribute('opacity', '0.9');
            dove.setAttribute('stroke', sunColor);
            dove.setAttribute('stroke-width', '2');
            dove.style.filter = 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.7))';
            dove.style.animation = `doveFloat ${4 + Math.random() * 2}s ease-in-out infinite`;
            dove.style.animationDelay = `${i * 0.3}s`;
            svg.appendChild(dove);
            
            // Wings
            const wing1 = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            wing1.setAttribute('cx', doveX - 15);
            wing1.setAttribute('cy', doveY);
            wing1.setAttribute('rx', '8');
            wing1.setAttribute('ry', '15');
            wing1.setAttribute('fill', '#FFFFFF');
            wing1.setAttribute('opacity', '0.8');
            wing1.setAttribute('transform', `rotate(-30 ${doveX - 15} ${doveY})`);
            svg.appendChild(wing1);
            
            const wing2 = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            wing2.setAttribute('cx', doveX + 15);
            wing2.setAttribute('cy', doveY);
            wing2.setAttribute('rx', '8');
            wing2.setAttribute('ry', '15');
            wing2.setAttribute('fill', '#FFFFFF');
            wing2.setAttribute('opacity', '0.8');
            wing2.setAttribute('transform', `rotate(30 ${doveX + 15} ${doveY})`);
            svg.appendChild(wing2);
        }
    }
    
    return svg;
}

function createMetaballs(index, params = null) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    // Use custom colors if provided, otherwise use theme colors
    const getColor = params && params.colors 
        ? (i) => params.colors[i % params.colors.length]
        : (i) => getThemeColor(i * 36);
    
    for (let i = 0; i < 10; i++) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', 100 + i * 70);
        circle.setAttribute('cy', 250);
        circle.setAttribute('r', 40);
        circle.setAttribute('fill', getColor(i));
        circle.setAttribute('opacity', '0.9');
        circle.setAttribute('stroke', getColor(i));
        circle.setAttribute('stroke-width', '2');
        circle.style.animation = `metaball ${3 + i * 0.3}s ease-in-out infinite`;
        svg.appendChild(circle);
    }
    
    // Kiss/heart elements (from "Un Beso Más Antes de Irme" - passion/kiss theme)
    for (let i = 0; i < 12; i++) {
        const heart = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const x = Math.random() * 800;
        const y = Math.random() * 500;
        const size = 12 + Math.random() * 15;
        
        const heartPath = `M ${x} ${y + size * 0.3}
                          C ${x - size * 0.5} ${y} ${x - size} ${y + size * 0.2} ${x - size * 0.5} ${y + size * 0.5}
                          C ${x} ${y + size * 0.2} ${x + size * 0.5} ${y + size * 0.2} ${x + size * 0.5} ${y + size * 0.5}
                          C ${x + size} ${y + size * 0.2} ${x + size * 0.5} ${y} ${x} ${y + size * 0.3} Z`;
        heart.setAttribute('d', heartPath);
        heart.setAttribute('fill', getColor(i));
        heart.setAttribute('opacity', '0.9');
        heart.style.filter = 'drop-shadow(0 0 12px rgba(255, 20, 147, 0.8))';
        heart.style.animation = `passionPulse ${2 + Math.random() * 2}s ease-in-out infinite`;
        heart.style.animationDelay = `${Math.random() * 1}s`;
        svg.appendChild(heart);
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

function createVectorField(index, params = null) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    // Use custom colors if provided, otherwise use theme colors
    const getColor = params && params.colors 
        ? (i) => params.colors[Math.floor(i) % params.colors.length]
        : (i) => getThemeColor(i * 10);
    
    // Theme-based simplified field
    const theme = params && params.theme ? params.theme : 'default';
    
    if (theme === 'speed' || theme === 'speed_lines') {
        // Large unraveling spiral from center
        const centerX = 400;
        const centerY = 250;
        const largeSpiral = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const maxRadius = 350;
        const spiralTurns = 4;
        
        // Create a large spiral that unravels
        let spiralPath = '';
        for (let step = 0; step <= 100; step++) {
            const progress = step / 100;
            const angle = progress * Math.PI * 2 * spiralTurns;
            const currentRadius = maxRadius * progress;
            const x = centerX + currentRadius * Math.cos(angle);
            const y = centerY + currentRadius * Math.sin(angle);
            if (step === 0) {
                spiralPath = `M ${x} ${y}`;
            } else {
                spiralPath += ` L ${x} ${y}`;
            }
        }
        
        largeSpiral.setAttribute('d', spiralPath);
        largeSpiral.setAttribute('stroke', getColor(0));
        largeSpiral.setAttribute('stroke-width', '6');
        largeSpiral.setAttribute('opacity', '0.9');
        largeSpiral.setAttribute('fill', 'none');
        largeSpiral.setAttribute('stroke-linecap', 'round');
        largeSpiral.style.filter = 'drop-shadow(0 0 20px rgba(255, 69, 0, 1))';
        largeSpiral.style.animation = `spiralUnravel ${4}s ease-in-out infinite`;
        svg.appendChild(largeSpiral);
        
        // Medium unraveling spiral
        const mediumSpiral = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const mediumMaxRadius = 250;
        const mediumTurns = 3;
        
        let mediumPath = '';
        for (let step = 0; step <= 80; step++) {
            const progress = step / 80;
            const angle = progress * Math.PI * 2 * mediumTurns;
            const currentRadius = mediumMaxRadius * progress;
            const x = centerX + currentRadius * Math.cos(angle);
            const y = centerY + currentRadius * Math.sin(angle);
            if (step === 0) {
                mediumPath = `M ${x} ${y}`;
            } else {
                mediumPath += ` L ${x} ${y}`;
            }
        }
        
        mediumSpiral.setAttribute('d', mediumPath);
        mediumSpiral.setAttribute('stroke', getColor(1));
        mediumSpiral.setAttribute('stroke-width', '5');
        mediumSpiral.setAttribute('opacity', '0.85');
        mediumSpiral.setAttribute('fill', 'none');
        mediumSpiral.setAttribute('stroke-linecap', 'round');
        mediumSpiral.style.filter = 'drop-shadow(0 0 15px rgba(255, 69, 0, 0.95))';
        mediumSpiral.style.animation = `spiralUnravel ${3.5}s ease-in-out infinite`;
        mediumSpiral.style.animationDelay = '0.5s';
        svg.appendChild(mediumSpiral);
        
        // For FAST! - only satisfying swirls, no straight lines
        // Create smooth swirling paths
        for (let i = 0; i < 12; i++) {
            const swirl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const swirlCenterX = 100 + (i % 4) * 200;
            const swirlCenterY = 100 + Math.floor(i / 4) * 200;
            const radius = 40 + Math.random() * 60;
            const turns = 2 + Math.random() * 2;
            
            // Create a smooth spiral/swirl path
            let pathData = '';
            for (let step = 0; step <= 50; step++) {
                const angle = (step / 50) * Math.PI * 2 * turns;
                const currentRadius = radius * (step / 50);
                const x = swirlCenterX + currentRadius * Math.cos(angle);
                const y = swirlCenterY + currentRadius * Math.sin(angle);
                if (step === 0) {
                    pathData = `M ${x} ${y}`;
                } else {
                    pathData += ` L ${x} ${y}`;
                }
            }
            
            swirl.setAttribute('d', pathData);
            swirl.setAttribute('stroke', getColor(i + 2));
            swirl.setAttribute('stroke-width', '4');
            swirl.setAttribute('opacity', '0.8');
            swirl.setAttribute('fill', 'none');
            swirl.setAttribute('stroke-linecap', 'round');
            swirl.style.filter = 'drop-shadow(0 0 12px rgba(255, 69, 0, 0.9))';
            swirl.style.animation = `swirlRotate ${3 + Math.random() * 2}s ease-in-out infinite`;
            swirl.style.animationDelay = `${i * 0.2}s`;
            svg.appendChild(swirl);
        }
        
        // Smooth speed bursts - fewer, larger
        for (let i = 0; i < 6; i++) {
            const burst = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            const burstX = 200 + (i % 3) * 200;
            const burstY = 150 + Math.floor(i / 3) * 200;
            const burstRadius = 30 + Math.random() * 20;
            
            burst.setAttribute('cx', burstX);
            burst.setAttribute('cy', burstY);
            burst.setAttribute('r', burstRadius);
            burst.setAttribute('fill', getColor(i));
            burst.setAttribute('opacity', '0.8');
            burst.setAttribute('stroke', getColor(i + 1));
            burst.setAttribute('stroke-width', '4');
            burst.style.filter = 'drop-shadow(0 0 25px rgba(255, 69, 0, 1))';
            burst.style.animation = `speedBurst ${2 + Math.random() * 1.5}s ease-in-out infinite`;
            burst.style.animationDelay = `${i * 0.3}s`;
            svg.appendChild(burst);
        }
    } else {
        // Reduced vector field for other themes
        const fieldDensity = (theme === 'stumbling' || theme === 'disorienting') ? 12 : 25;
        
        for (let y = 0; y < fieldDensity; y++) {
            for (let x = 0; x < fieldDensity * 1.6; x++) {
                const angle = (x + y) * 0.2;
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                const spacing = 800 / (fieldDensity * 1.6);
                line.setAttribute('x1', x * spacing);
                line.setAttribute('y1', y * (500 / fieldDensity));
                line.setAttribute('x2', x * spacing + 20 * Math.cos(angle));
                line.setAttribute('y2', y * (500 / fieldDensity) + 20 * Math.sin(angle));
                line.setAttribute('stroke', getColor(angle));
                line.setAttribute('stroke-width', '3');
                line.setAttribute('opacity', '0.6');
                line.style.animation = `vector ${2.5 + (x + y) * 0.05}s ease-in-out infinite`;
                svg.appendChild(line);
            }
        }
    }
    
    if (theme === 'stumbling' || theme === 'disorienting') {
        // Cleaner stumbling/falling elements (from "De nuevo tropiezo")
        // Fewer, larger falling figures
        for (let i = 0; i < 3; i++) {
            const figureX = 200 + i * 200;
            const figureY = 200;
            const angle = -25 - Math.random() * 15; // Falling angle
            
            // Body (torso) - larger
            const body = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            body.setAttribute('cx', figureX);
            body.setAttribute('cy', figureY);
            body.setAttribute('rx', '25');
            body.setAttribute('ry', '40');
            body.setAttribute('fill', getColor(i));
            body.setAttribute('opacity', '0.75');
            body.setAttribute('transform', `rotate(${angle} ${figureX} ${figureY})`);
            body.style.animation = `stumbleFall ${3 + Math.random() * 2}s ease-in-out infinite`;
            body.style.animationDelay = `${i * 0.4}s`;
            svg.appendChild(body);
            
            // Head - larger
            const head = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            head.setAttribute('cx', figureX + Math.sin(angle * Math.PI / 180) * 45);
            head.setAttribute('cy', figureY - 45 + Math.cos(angle * Math.PI / 180) * 15);
            head.setAttribute('r', '18');
            head.setAttribute('fill', getColor(i));
            head.setAttribute('opacity', '0.75');
            head.setAttribute('transform', `rotate(${angle} ${figureX + Math.sin(angle * Math.PI / 180) * 45} ${figureY - 45})`);
            head.style.animation = `stumbleFall ${3 + Math.random() * 2}s ease-in-out infinite`;
            head.style.animationDelay = `${i * 0.4}s`;
            svg.appendChild(head);
            
            // Arms/legs - simpler
            const limb = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            limb.setAttribute('x1', figureX - 15);
            limb.setAttribute('y1', figureY);
            limb.setAttribute('x2', figureX - 35);
            limb.setAttribute('y2', figureY + 30);
            limb.setAttribute('stroke', getColor(i));
            limb.setAttribute('stroke-width', '6');
            limb.setAttribute('opacity', '0.75');
            limb.setAttribute('stroke-linecap', 'round');
            limb.style.animation = `stumbleFall ${3 + Math.random() * 2}s ease-in-out infinite`;
            limb.style.animationDelay = `${i * 0.4}s`;
            svg.appendChild(limb);
        }
        
        // Single subtle floor line (from "Sigo en el suelo", "Caigo al piso")
        const floor = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        floor.setAttribute('x1', 0);
        floor.setAttribute('y1', 450);
        floor.setAttribute('x2', '800');
        floor.setAttribute('y2', 450);
        floor.setAttribute('stroke', getColor(1));
        floor.setAttribute('stroke-width', '4');
        floor.setAttribute('opacity', '0.6');
        floor.setAttribute('stroke-linecap', 'round');
        floor.style.animation = `floorShift ${4}s ease-in-out infinite`;
        svg.appendChild(floor);
        
        // Fewer, larger boiling bubbles (from "El agua está hirviendo")
        for (let i = 0; i < 8; i++) {
            const bubble = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            const bubbleX = 150 + (i % 4) * 180;
            const bubbleY = 460 + Math.random() * 30;
            bubble.setAttribute('cx', bubbleX);
            bubble.setAttribute('cy', bubbleY);
            bubble.setAttribute('r', 8 + Math.random() * 10);
            bubble.setAttribute('fill', getColor(i));
            bubble.setAttribute('opacity', '0.7');
            bubble.style.filter = 'drop-shadow(0 0 8px rgba(68, 78, 98, 0.6))';
            bubble.style.animation = `bubbleBoil ${2 + Math.random() * 2}s ease-in-out infinite`;
            bubble.style.animationDelay = `${i * 0.3}s`;
            svg.appendChild(bubble);
        }
    }
    
    return svg;
}

function createTunnel(index, params = null) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    svg.style.transform = 'perspective(2000px)';
    svg.style.transformStyle = 'preserve-3d';
    
    const centerX = 400;
    const centerY = 250;
    
    // Use custom colors if provided
    const getColor = params && params.colors 
        ? (i) => params.colors[i % params.colors.length]
        : (i) => getThemeColor(i * 12);
    
    for (let i = 0; i < 40; i++) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const z = i * -30;
        // Calculate scale but ensure it doesn't go below 0.1
        const scale = Math.max(0.1, 1 + z / 500);
        // Base radius decreases as we go back, but always stays positive
        const baseRadius = Math.max(5, 200 - i * 5);
        // Use the base radius and let CSS scale handle the perspective
        const radius = baseRadius;
        
        circle.setAttribute('cx', centerX);
        circle.setAttribute('cy', centerY);
        circle.setAttribute('r', Math.max(1, radius)); // Ensure minimum radius of 1
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', getColor(i));
        circle.setAttribute('stroke-width', '6');
        circle.style.transform = `translateZ(${z}px) scale(${scale})`;
        circle.style.opacity = Math.max(0.5, 1 - (i / 40) * 0.5);
        circle.style.animation = `tunnel3D ${1.5 + i * 0.05}s linear infinite`;
        circle.style.animationDelay = `${i * 0.05}s`;
        svg.appendChild(circle);
    }
    
    // Theme-based disappearing elements
    const theme = params && params.theme ? params.theme : 'default';
    
    if (theme === 'fading' || theme === 'tunnel_disappear') {
        // Enhanced disappearing elements (for "Desaparecer")
        // Fading silhouette shapes
        for (let i = 0; i < 15; i++) {
            const silhouette = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const x = centerX + (Math.random() - 0.5) * 250;
            const y = centerY + (Math.random() - 0.5) * 200;
            const size = 20 + Math.random() * 25;
            const z = i * -35;
            
            // Person silhouette fading away
            const silhouettePath = `M ${x} ${y + size * 1.2}
                                   Q ${x} ${y + size * 0.3} ${x} ${y}
                                   Q ${x - size * 0.2} ${y - size * 0.3} ${x} ${y - size * 0.4}
                                   Q ${x + size * 0.2} ${y - size * 0.3} ${x} ${y}
                                   Q ${x} ${y + size * 0.3} ${x} ${y + size * 1.2}
                                   M ${x - size * 0.3} ${y + size * 0.6}
                                   Q ${x - size * 0.5} ${y + size * 0.8} ${x - size * 0.4} ${y + size * 1.2}
                                   M ${x + size * 0.3} ${y + size * 0.6}
                                   Q ${x + size * 0.5} ${y + size * 0.8} ${x + size * 0.4} ${y + size * 1.2}`;
            silhouette.setAttribute('d', silhouettePath);
            silhouette.setAttribute('fill', getColor(i));
            silhouette.setAttribute('opacity', Math.max(0.2, 0.8 - (i / 15) * 0.6));
            silhouette.setAttribute('stroke', getColor(i + 1));
            silhouette.setAttribute('stroke-width', '1');
            silhouette.setAttribute('stroke-dasharray', '4,4');
            silhouette.style.transform = `translateZ(${z}px) scale(${Math.max(0.3, 1 + z / 450)})`;
            silhouette.style.animation = `disappear ${3 + i * 0.15}s ease-out infinite`;
            silhouette.style.animationDelay = `${i * 0.1}s`;
            svg.appendChild(silhouette);
        }
        
        // Dissolving particles (disappearing)
        for (let i = 0; i < 50; i++) {
            const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            const particleX = centerX + (Math.random() - 0.5) * 300;
            const particleY = centerY + (Math.random() - 0.5) * 250;
            const z = i * -15;
            
            particle.setAttribute('cx', particleX);
            particle.setAttribute('cy', particleY);
            particle.setAttribute('r', 3 + Math.random() * 4);
            particle.setAttribute('fill', getColor(i));
            particle.setAttribute('opacity', Math.max(0.1, 0.7 - (i / 50) * 0.6));
            particle.style.transform = `translateZ(${z}px) scale(${Math.max(0.2, 1 + z / 500)})`;
            particle.style.filter = 'drop-shadow(0 0 5px rgba(44, 62, 80, 0.6))';
            particle.style.animation = `particleDissolve ${2 + i * 0.05}s ease-out infinite`;
            particle.style.animationDelay = `${i * 0.04}s`;
            svg.appendChild(particle);
        }
        
        // Fading connection lines (from "Nos perdimos tú y yo")
        for (let i = 0; i < 10; i++) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            const startX = centerX + (Math.random() - 0.5) * 200;
            const startY = centerY + (Math.random() - 0.5) * 150;
            const endX = centerX + (Math.random() - 0.5) * 200;
            const endY = centerY + (Math.random() - 0.5) * 150;
            const z = i * -30;
            
            line.setAttribute('x1', startX);
            line.setAttribute('y1', startY);
            line.setAttribute('x2', endX);
            line.setAttribute('y2', endY);
            line.setAttribute('stroke', getColor(i));
            line.setAttribute('stroke-width', '3');
            line.setAttribute('opacity', Math.max(0.2, 0.6 - (i / 10) * 0.4));
            line.setAttribute('stroke-dasharray', '5,5');
            line.style.transform = `translateZ(${z}px)`;
            line.style.animation = `connectionFade ${3 + i * 0.2}s ease-out infinite`;
            line.style.animationDelay = `${i * 0.15}s`;
            svg.appendChild(line);
        }
        
        // Vanishing traces (from "Es mejor dejar que todo acabe mal")
        for (let i = 0; i < 20; i++) {
            const trace = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const traceX = centerX + (Math.random() - 0.5) * 350;
            const traceY = centerY + (Math.random() - 0.5) * 300;
            const traceSize = 5 + Math.random() * 10;
            const z = i * -20;
            
            let tracePath = `M ${traceX} ${traceY}`;
            for (let j = 0; j < 5; j++) {
                tracePath += ` L ${traceX + (Math.random() - 0.5) * 30} ${traceY + (Math.random() - 0.5) * 30}`;
            }
            
            trace.setAttribute('d', tracePath);
            trace.setAttribute('fill', 'none');
            trace.setAttribute('stroke', getColor(i));
            trace.setAttribute('stroke-width', '2');
            trace.setAttribute('opacity', Math.max(0.15, 0.5 - (i / 20) * 0.35));
            trace.style.transform = `translateZ(${z}px) scale(${Math.max(0.3, 1 + z / 400)})`;
            trace.style.animation = `traceVanish ${4 + Math.random() * 2}s ease-out infinite`;
            trace.style.animationDelay = `${Math.random() * 2}s`;
            svg.appendChild(trace);
        }
    }
    
    return svg;
}

function createNebula(index, params = null) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    // Use custom colors if provided, otherwise use theme colors
    const getColor = params && params.colors 
        ? () => params.colors[Math.floor(Math.random() * params.colors.length)]
        : () => getThemeColorRandom();
    
    // PERFORMANCE FIX: Reduce particle count to prevent crashes (was 200, now 80)
    for (let i = 0; i < 80; i++) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const x = 400 + (Math.random() - 0.5) * 400;
        const y = 250 + (Math.random() - 0.5) * 300;
        const r = Math.random() * 15 + 2;
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', r);
        circle.setAttribute('fill', getColor());
        circle.setAttribute('opacity', '0.6');
        circle.style.animation = `nebula ${5 + Math.random() * 5}s ease-in-out infinite`;
        svg.appendChild(circle);
    }
    
    // Theme-based elements
    const theme = params && params.theme ? params.theme : 'default';
    
    if (theme === 'distant' || theme === 'distant_space' || theme === 'melancholic') {
        // California-themed elements (from "Nunca vuelvo a California")
        // Palm trees in the distance
        for (let i = 0; i < 6; i++) {
            const palmX = 100 + (i % 3) * 250;
            const palmY = 450;
            
            // Palm trunk
            const trunk = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            trunk.setAttribute('x', palmX - 8);
            trunk.setAttribute('y', palmY - 60);
            trunk.setAttribute('width', '16');
            trunk.setAttribute('height', '60');
            trunk.setAttribute('fill', '#8B4513');
            trunk.setAttribute('opacity', '0.7');
            trunk.setAttribute('rx', '2');
            svg.appendChild(trunk);
            
            // Palm fronds
            for (let j = 0; j < 8; j++) {
                const frondAngle = (Math.PI * 2 / 8) * j;
                const frond = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const startX = palmX;
                const startY = palmY - 60;
                const endX = palmX + 40 * Math.cos(frondAngle);
                const endY = palmY - 60 + 30 * Math.sin(frondAngle);
                frond.setAttribute('d', `M ${startX} ${startY} Q ${startX + 20 * Math.cos(frondAngle)} ${startY + 10} ${endX} ${endY}`);
                frond.setAttribute('stroke', getColor(i * 2));
                frond.setAttribute('stroke-width', '3');
                frond.setAttribute('fill', 'none');
                frond.setAttribute('opacity', '0.6');
                frond.style.animation = `palmSway ${3 + Math.random() * 2}s ease-in-out infinite`;
                frond.style.animationDelay = `${j * 0.1}s`;
                svg.appendChild(frond);
            }
        }
        
        // Distant horizon/beach line
        const horizon = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        horizon.setAttribute('x1', '0');
        horizon.setAttribute('y1', '420');
        horizon.setAttribute('x2', '800');
        horizon.setAttribute('y2', '420');
        horizon.setAttribute('stroke', getColor(0));
        horizon.setAttribute('stroke-width', '2');
        horizon.setAttribute('opacity', '0.5');
        svg.appendChild(horizon);
        
        // Sun setting in the distance
        const sun = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        sun.setAttribute('cx', '650');
        sun.setAttribute('cy', '380');
        sun.setAttribute('r', '35');
        sun.setAttribute('fill', '#FF9500');
        sun.setAttribute('opacity', '0.8');
        sun.style.filter = 'drop-shadow(0 0 30px rgba(255, 149, 0, 0.9))';
        sun.style.animation = 'californiaSun 6s ease-in-out infinite';
        svg.appendChild(sun);
        
        // Ocean waves in the distance
        for (let i = 0; i < 5; i++) {
            const wave = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            let wavePath = `M 0 ${420 + i * 8}`;
            for (let x = 0; x < 800; x += 20) {
                wavePath += ` Q ${x + 10} ${420 + i * 8 + Math.sin(x / 40) * 5} ${x + 20} ${420 + i * 8}`;
            }
            wave.setAttribute('d', wavePath);
            wave.setAttribute('stroke', getColor(i));
            wave.setAttribute('stroke-width', '2');
            wave.setAttribute('fill', 'none');
            wave.setAttribute('opacity', '0.4');
            wave.style.animation = `waveRoll ${3 + i * 0.5}s ease-in-out infinite`;
            wave.style.animationDelay = `${i * 0.3}s`;
            svg.appendChild(wave);
        }
    } else if (theme === 'longing' || theme === 'distant_nebula' || theme === 'melancholic') {
        // Longing/missing elements (from "Odio cuando no estás aquí" - missing someone)
        // Question marks floating (from "¿dónde tú estás?")
        for (let i = 0; i < 12; i++) {
            const qMark = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const x = 100 + (i % 4) * 200;
            const y = 100 + Math.floor(i / 4) * 150;
            const size = 15 + Math.random() * 10;
            
            // Question mark shape
            const qPath = `M ${x} ${y}
                          A ${size * 0.4} ${size * 0.4} 0 0 1 ${x + size * 0.3} ${y - size * 0.3}
                          Q ${x + size * 0.5} ${y - size * 0.5} ${x + size * 0.3} ${y - size * 0.7}
                          Q ${x} ${y - size * 0.9} ${x - size * 0.2} ${y - size * 0.8}
                          M ${x} ${y + size * 0.1}
                          L ${x} ${y + size * 0.4}`;
            qMark.setAttribute('d', qPath);
            qMark.setAttribute('fill', 'none');
            qMark.setAttribute('stroke', getColor(i));
            qMark.setAttribute('stroke-width', '3');
            qMark.setAttribute('stroke-linecap', 'round');
            qMark.setAttribute('opacity', '0.8');
            qMark.style.filter = 'drop-shadow(0 0 10px rgba(200, 200, 200, 0.8))';
            qMark.style.animation = `questionFloat ${4 + Math.random() * 3}s ease-in-out infinite`;
            qMark.style.animationDelay = `${i * 0.2}s`;
            svg.appendChild(qMark);
        }
        
        // Phone/calling symbols (from "No sé ni a quién llamar")
        for (let i = 0; i < 8; i++) {
            const phoneX = 120 + (i % 4) * 180;
            const phoneY = 300 + Math.floor(i / 4) * 150;
            
            // Phone body
            const phoneBody = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            phoneBody.setAttribute('x', phoneX - 12);
            phoneBody.setAttribute('y', phoneY - 20);
            phoneBody.setAttribute('width', '24');
            phoneBody.setAttribute('height', '40');
            phoneBody.setAttribute('rx', '3');
            phoneBody.setAttribute('fill', getColor(i));
            phoneBody.setAttribute('opacity', '0.7');
            svg.appendChild(phoneBody);
            
            // Phone screen
            const screen = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            screen.setAttribute('x', phoneX - 8);
            screen.setAttribute('y', phoneY - 15);
            screen.setAttribute('width', '16');
            screen.setAttribute('height', '20');
            screen.setAttribute('rx', '1');
            screen.setAttribute('fill', '#000000');
            screen.setAttribute('opacity', '0.8');
            svg.appendChild(screen);
            
            // Call icon (handset)
            const handset = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            handset.setAttribute('d', `M ${phoneX - 8} ${phoneY + 22} Q ${phoneX - 12} ${phoneY + 25} ${phoneX - 10} ${phoneY + 28}
                                      Q ${phoneX - 5} ${phoneY + 32} ${phoneX} ${phoneY + 30}
                                      Q ${phoneX + 5} ${phoneY + 32} ${phoneX + 10} ${phoneY + 28}
                                      Q ${phoneX + 12} ${phoneY + 25} ${phoneX + 8} ${phoneY + 22} Z`);
            handset.setAttribute('fill', getColor(i));
            handset.setAttribute('opacity', '0.7');
            handset.style.animation = `phonePulse ${2 + Math.random()}s ease-in-out infinite`;
            handset.style.animationDelay = `${i * 0.3}s`;
            svg.appendChild(handset);
        }
        
        // Empty silhouette/void shapes (representing missing person)
        for (let i = 0; i < 6; i++) {
            const voidShape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const x = 150 + (i % 3) * 250;
            const y = 150 + Math.floor(i / 3) * 200;
            const size = 30 + Math.random() * 20;
            
            // Person silhouette (empty outline)
            const silhouettePath = `M ${x} ${y + size * 1.2}
                                   Q ${x} ${y + size * 0.3} ${x} ${y}
                                   Q ${x - size * 0.2} ${y - size * 0.3} ${x} ${y - size * 0.4}
                                   Q ${x + size * 0.2} ${y - size * 0.3} ${x} ${y}
                                   Q ${x} ${y + size * 0.3} ${x} ${y + size * 1.2}
                                   M ${x - size * 0.3} ${y + size * 0.6}
                                   Q ${x - size * 0.5} ${y + size * 0.8} ${x - size * 0.4} ${y + size * 1.2}
                                   M ${x + size * 0.3} ${y + size * 0.6}
                                   Q ${x + size * 0.5} ${y + size * 0.8} ${x + size * 0.4} ${y + size * 1.2}`;
            voidShape.setAttribute('d', silhouettePath);
            voidShape.setAttribute('fill', 'none');
            voidShape.setAttribute('stroke', getColor(i));
            voidShape.setAttribute('stroke-width', '2');
            voidShape.setAttribute('stroke-dasharray', '5,5');
            voidShape.setAttribute('opacity', '0.5');
            voidShape.style.filter = 'drop-shadow(0 0 8px rgba(200, 200, 200, 0.6))';
            voidShape.style.animation = `voidFade ${5 + Math.random() * 3}s ease-in-out infinite`;
            voidShape.style.animationDelay = `${i * 0.5}s`;
            svg.appendChild(voidShape);
        }
    } else {
        // Original distant stars for other themes
        for (let i = 0; i < 40; i++) {
            const star = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            const x = Math.random() * 800;
            const y = Math.random() * 500;
            const size = Math.random() * 3 + 1;
            const points = [];
            for (let j = 0; j < 5; j++) {
                const angle = (Math.PI * 2 / 5) * j - Math.PI / 2;
                points.push(`${x + size * Math.cos(angle)},${y + size * Math.sin(angle)}`);
            }
            star.setAttribute('points', points.join(' '));
            star.setAttribute('fill', '#FFFFFF');
            star.setAttribute('opacity', '0.7');
            star.style.filter = 'drop-shadow(0 0 3px rgba(255, 255, 255, 0.8))';
            star.style.animation = `starTwinkle ${2 + Math.random() * 3}s ease-in-out infinite`;
            star.style.animationDelay = `${Math.random() * 2}s`;
            svg.appendChild(star);
        }
        
        // Distant planets/celestial bodies
        for (let i = 0; i < 4; i++) {
            const planet = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            const x = 150 + (i % 2) * 500;
            const y = 100 + Math.floor(i / 2) * 300;
            planet.setAttribute('cx', x);
            planet.setAttribute('cy', y);
            planet.setAttribute('r', '20');
            planet.setAttribute('fill', getColor());
            planet.setAttribute('opacity', '0.5');
            planet.style.filter = 'drop-shadow(0 0 20px rgba(255, 200, 87, 0.4))';
            planet.style.animation = `planetFloat ${8 + Math.random() * 4}s ease-in-out infinite`;
            planet.style.animationDelay = `${Math.random() * 2}s`;
            svg.appendChild(planet);
        }
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

function createOrbs(index, params = null) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    // Use custom colors if provided, otherwise use theme colors
    const getColor = params && params.colors 
        ? () => params.colors[Math.floor(Math.random() * params.colors.length)]
        : () => getThemeColorRandom();
    
    // Cleaner, less chaotic version for "Soy Quien Soy"
    const theme = params && params.theme ? params.theme : 'default';
    
    if (theme === 'identity' || theme === 'identity_orbs') {
        // Fewer, larger orbs - cleaner
        for (let i = 0; i < 6; i++) {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            const r = 45 + Math.random() * 25;
            const x = 150 + (i % 3) * 250;
            const y = 150 + Math.floor(i / 3) * 200;
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', r);
            circle.setAttribute('fill', getColor(i));
            circle.setAttribute('opacity', '0.85');
            circle.setAttribute('stroke', getColor(i + 1));
            circle.setAttribute('stroke-width', '3');
            circle.style.filter = 'drop-shadow(0 0 20px rgba(255, 149, 0, 0.8))';
            circle.style.animation = `orb ${5 + Math.random() * 3}s ease-in-out infinite`;
            circle.style.animationDelay = `${i * 0.3}s`;
            svg.appendChild(circle);
        }
        
        // Single gentle path (from "Almas que caminan al camino")
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M 200 450 Q 400 200 600 100');
        path.setAttribute('stroke', getColor(2));
        path.setAttribute('stroke-width', '5');
        path.setAttribute('fill', 'none');
        path.setAttribute('opacity', '0.6');
        path.setAttribute('stroke-linecap', 'round');
        path.style.filter = 'drop-shadow(0 0 15px rgba(255, 149, 0, 0.7))';
        path.style.animation = `pathGlow ${6}s ease-in-out infinite`;
        svg.appendChild(path);
        
        // Fewer flowers - more elegant (from "Una flor que da vida a la esperanza")
        for (let i = 0; i < 4; i++) {
            const flowerX = 200 + (i % 2) * 400;
            const flowerY = 200 + Math.floor(i / 2) * 200;
            
            // Simpler flower - just outer petals
            for (let p = 0; p < 6; p++) {
                const petalAngle = (Math.PI * 2 / 6) * p;
                const petal = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
                petal.setAttribute('cx', flowerX + 20 * Math.cos(petalAngle));
                petal.setAttribute('cy', flowerY + 20 * Math.sin(petalAngle));
                petal.setAttribute('rx', '10');
                petal.setAttribute('ry', '15');
                petal.setAttribute('fill', getColor(i + p));
                petal.setAttribute('opacity', '0.9');
                petal.style.animation = `flowerBloom ${4 + Math.random() * 2}s ease-in-out infinite`;
                petal.style.animationDelay = `${p * 0.15}s`;
                svg.appendChild(petal);
            }
            
            // Flower center
            const center = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            center.setAttribute('cx', flowerX);
            center.setAttribute('cy', flowerY);
            center.setAttribute('r', '8');
            center.setAttribute('fill', getColor(i * 2));
            center.setAttribute('opacity', '1');
            svg.appendChild(center);
        }
        
        // Subtle rays of light (fewer, larger)
        for (let i = 0; i < 4; i++) {
            const rayAngle = (Math.PI * 2 / 4) * i;
            const ray = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            ray.setAttribute('x1', '400');
            ray.setAttribute('y1', '250');
            ray.setAttribute('x2', 400 + 350 * Math.cos(rayAngle));
            ray.setAttribute('y2', 250 + 350 * Math.sin(rayAngle));
            ray.setAttribute('stroke', getColor(i));
            ray.setAttribute('stroke-width', '4');
            ray.setAttribute('opacity', '0.5');
            ray.setAttribute('stroke-linecap', 'round');
            ray.style.filter = 'drop-shadow(0 0 20px rgba(255, 149, 0, 0.9))';
            ray.style.animation = `rayPulse ${3 + i * 0.3}s ease-in-out infinite`;
            ray.style.animationDelay = `${i * 0.2}s`;
            svg.appendChild(ray);
        }
    } else {
        // Original identity symbols
        for (let i = 0; i < 8; i++) {
            const person = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const x = 150 + (i % 4) * 180;
            const y = 150 + Math.floor(i / 4) * 200;
            
            const personPath = `M ${x} ${y + 30}
                               L ${x - 8} ${y + 20}
                               L ${x} ${y + 10}
                               L ${x + 8} ${y + 20}
                               Z
                               M ${x} ${y + 30}
                               L ${x - 12} ${y + 40}
                               M ${x} ${y + 30}
                               L ${x + 12} ${y + 40}`;
            person.setAttribute('d', personPath);
            person.setAttribute('fill', getColor());
            person.setAttribute('opacity', '0.9');
            person.setAttribute('stroke', getColor());
            person.setAttribute('stroke-width', '3');
            person.style.filter = 'drop-shadow(0 0 10px rgba(255, 149, 0, 0.7))';
            person.style.animation = `identityFloat ${3 + Math.random() * 2}s ease-in-out infinite`;
            person.style.animationDelay = `${Math.random() * 1}s`;
            svg.appendChild(person);
        }
    }
    
    return svg;
}

function createEnergyWaves(index, params = null) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 500');
    
    const centerX = 400;
    const centerY = 250;
    
    // Use custom colors if provided, otherwise use theme colors
    const getColor = params && params.colors 
        ? (i) => params.colors[i % params.colors.length]
        : (i) => getThemeColor(i * 7);
    
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
        path.setAttribute('stroke', getColor(i));
        path.setAttribute('stroke-width', '5');
        path.setAttribute('opacity', '0.85');
        path.setAttribute('fill', 'none');
        path.style.animation = `energyWave ${3 + i * 0.05}s ease-in-out infinite`;
        svg.appendChild(path);
    }
    
    // Lion elements (from "El León" - lyrics about lion, power, danger)
    const theme = params && params.theme ? params.theme : 'default';
    
    if (theme === 'power' || theme === 'energy_power') {
        // More detailed lions with full bodies
        for (let i = 0; i < 8; i++) {
            const lionX = 100 + (i % 4) * 180;
            const lionY = 150 + Math.floor(i / 4) * 180;
            
            // Lion body (torso)
            const body = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            body.setAttribute('cx', lionX);
            body.setAttribute('cy', lionY + 30);
            body.setAttribute('rx', '35');
            body.setAttribute('ry', '25');
            body.setAttribute('fill', getColor(i * 2));
            body.setAttribute('opacity', '0.9');
            body.style.animation = `lionMane ${3 + i * 0.2}s ease-in-out infinite`;
            svg.appendChild(body);
            
            // Lion mane (larger, more detailed)
            const mane = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            mane.setAttribute('cx', lionX);
            mane.setAttribute('cy', lionY);
            mane.setAttribute('r', '40');
            mane.setAttribute('fill', getColor(i * 2));
            mane.setAttribute('opacity', '0.9');
            mane.setAttribute('stroke', getColor(i * 2 + 1));
            mane.setAttribute('stroke-width', '3');
            mane.style.filter = 'drop-shadow(0 0 25px rgba(255, 149, 0, 0.9))';
            mane.style.animation = `lionMane ${3 + i * 0.2}s ease-in-out infinite`;
            svg.appendChild(mane);
            
            // Mane spikes (more detailed mane)
            for (let s = 0; s < 12; s++) {
                const spikeAngle = (Math.PI * 2 / 12) * s;
                const spike = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const spikeX = lionX + 35 * Math.cos(spikeAngle);
                const spikeY = lionY + 35 * Math.sin(spikeAngle);
                spike.setAttribute('d', `M ${lionX} ${lionY} L ${spikeX} ${spikeY} L ${lionX + 45 * Math.cos(spikeAngle)} ${lionY + 45 * Math.sin(spikeAngle)} Z`);
                spike.setAttribute('fill', getColor(i * 2 + s % 2));
                spike.setAttribute('opacity', '0.8');
                svg.appendChild(spike);
            }
            
            // Lion face
            const face = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            face.setAttribute('cx', lionX);
            face.setAttribute('cy', lionY);
            face.setAttribute('r', '25');
            face.setAttribute('fill', getColor(i * 2 + 1));
            face.setAttribute('opacity', '0.9');
            svg.appendChild(face);
            
            // Lion eyes (glowing)
            const eye1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            eye1.setAttribute('cx', lionX - 10);
            eye1.setAttribute('cy', lionY - 5);
            eye1.setAttribute('r', '5');
            eye1.setAttribute('fill', '#FF0000');
            eye1.setAttribute('opacity', '1');
            eye1.style.filter = 'drop-shadow(0 0 8px rgba(255, 0, 0, 1))';
            eye1.style.animation = `lionBlink ${2 + Math.random()}s ease-in-out infinite`;
            svg.appendChild(eye1);
            
            const eye2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            eye2.setAttribute('cx', lionX + 10);
            eye2.setAttribute('cy', lionY - 5);
            eye2.setAttribute('r', '5');
            eye2.setAttribute('fill', '#FF0000');
            eye2.setAttribute('opacity', '1');
            eye2.style.filter = 'drop-shadow(0 0 8px rgba(255, 0, 0, 1))';
            eye2.style.animation = `lionBlink ${2 + Math.random()}s ease-in-out infinite`;
            eye2.style.animationDelay = '0.5s';
            svg.appendChild(eye2);
            
            // Lion nose
            const nose = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            nose.setAttribute('points', `${lionX},${lionY + 5} ${lionX - 5},${lionY + 12} ${lionX + 5},${lionY + 12}`);
            nose.setAttribute('fill', '#000000');
            nose.setAttribute('opacity', '0.9');
            svg.appendChild(nose);
            
            // Lion mouth (roaring)
            const mouth = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            mouth.setAttribute('d', `M ${lionX - 6} ${lionY + 12} Q ${lionX} ${lionY + 18} ${lionX + 6} ${lionY + 12}`);
            mouth.setAttribute('stroke', '#000000');
            mouth.setAttribute('stroke-width', '3');
            mouth.setAttribute('fill', 'none');
            mouth.setAttribute('stroke-linecap', 'round');
            svg.appendChild(mouth);
            
            // Lion front paws
            const paw1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            paw1.setAttribute('cx', lionX - 20);
            paw1.setAttribute('cy', lionY + 50);
            paw1.setAttribute('r', '8');
            paw1.setAttribute('fill', getColor(i * 2));
            paw1.setAttribute('opacity', '0.9');
            paw1.style.animation = `lionPaw ${2 + Math.random()}s ease-in-out infinite`;
            svg.appendChild(paw1);
            
            const paw2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            paw2.setAttribute('cx', lionX + 20);
            paw2.setAttribute('cy', lionY + 50);
            paw2.setAttribute('r', '8');
            paw2.setAttribute('fill', getColor(i * 2));
            paw2.setAttribute('opacity', '0.9');
            paw2.style.animation = `lionPaw ${2 + Math.random()}s ease-in-out infinite`;
            paw2.style.animationDelay = '0.3s';
            svg.appendChild(paw2);
            
            // Lion tail (swishing)
            const tail = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            tail.setAttribute('d', `M ${lionX + 30} ${lionY + 35} Q ${lionX + 40} ${lionY + 20} ${lionX + 50} ${lionY + 15} Q ${lionX + 55} ${lionY + 10} ${lionX + 60} ${lionY}`);
            tail.setAttribute('stroke', getColor(i * 2));
            tail.setAttribute('stroke-width', '6');
            tail.setAttribute('fill', 'none');
            tail.setAttribute('stroke-linecap', 'round');
            tail.style.animation = `lionTail ${1.5 + Math.random()}s ease-in-out infinite`;
            svg.appendChild(tail);
            
            // Tail tuft
            const tailTuft = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            tailTuft.setAttribute('cx', lionX + 60);
            tailTuft.setAttribute('cy', lionY);
            tailTuft.setAttribute('r', '6');
            tailTuft.setAttribute('fill', getColor(i * 2));
            tailTuft.setAttribute('opacity', '0.9');
            svg.appendChild(tailTuft);
        }
        
        // More cages/bars (from lyrics: "En su jaula está mejor")
        for (let i = 0; i < 4; i++) {
            const cageX = 80 + i * 200;
            const cageY = 450;
            
            // Cage bars
            for (let j = 0; j < 6; j++) {
                const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                bar.setAttribute('x', cageX - 35 + j * 14);
                bar.setAttribute('y', cageY - 50);
                bar.setAttribute('width', '4');
                bar.setAttribute('height', '50');
                bar.setAttribute('fill', '#666666');
                bar.setAttribute('opacity', '0.8');
                bar.style.filter = 'drop-shadow(0 0 5px rgba(0, 0, 0, 0.5))';
                svg.appendChild(bar);
            }
            
            // Cage top and bottom
            const topBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            topBar.setAttribute('x', cageX - 35);
            topBar.setAttribute('y', cageY - 50);
            topBar.setAttribute('width', '70');
            topBar.setAttribute('height', '4');
            topBar.setAttribute('fill', '#666666');
            topBar.setAttribute('opacity', '0.8');
            topBar.style.filter = 'drop-shadow(0 0 5px rgba(0, 0, 0, 0.5))';
            svg.appendChild(topBar);
            
            const bottomBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bottomBar.setAttribute('x', cageX - 35);
            bottomBar.setAttribute('y', cageY);
            bottomBar.setAttribute('width', '70');
            bottomBar.setAttribute('height', '4');
            bottomBar.setAttribute('fill', '#666666');
            bottomBar.setAttribute('opacity', '0.8');
            bottomBar.style.filter = 'drop-shadow(0 0 5px rgba(0, 0, 0, 0.5))';
            svg.appendChild(bottomBar);
        }
        
        // Lion paw prints (from the lion walking)
        for (let i = 0; i < 12; i++) {
            const printX = 50 + (i % 6) * 130;
            const printY = 430 + Math.floor(i / 6) * 40;
            
            // Paw pad
            const pad = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            pad.setAttribute('cx', printX);
            pad.setAttribute('cy', printY);
            pad.setAttribute('rx', '8');
            pad.setAttribute('ry', '6');
            pad.setAttribute('fill', getColor(i));
            pad.setAttribute('opacity', '0.7');
            svg.appendChild(pad);
            
            // Toe pads
            for (let t = 0; t < 4; t++) {
                const toe = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                toe.setAttribute('cx', printX - 6 + t * 4);
                toe.setAttribute('cy', printY - 6);
                toe.setAttribute('r', '3');
                toe.setAttribute('fill', getColor(i));
                toe.setAttribute('opacity', '0.7');
                svg.appendChild(toe);
            }
        }
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
    @keyframes carDrive {
        0% { transform: translateX(-100px); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateX(900px); opacity: 0; }
    }
    @keyframes lightFlash {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
    }
    @keyframes treeSway {
        0%, 100% { transform: rotate(-2deg); }
        50% { transform: rotate(2deg); }
    }
    @keyframes dropSlide {
        0% { transform: translateY(0) translateX(0); opacity: 0.6; }
        100% { transform: translateY(200px) translateX(30px); opacity: 0.2; }
    }
    @keyframes snowFall {
        0% { transform: translateY(0) rotate(0deg); opacity: 0.9; }
        100% { transform: translateY(510px) rotate(360deg); opacity: 0.3; }
    }
    @keyframes windowFlicker {
        0%, 100% { opacity: 0.8; }
        25% { opacity: 0.5; }
        50% { opacity: 1; }
        75% { opacity: 0.6; }
    }
    @keyframes crownGlow {
        0%, 100% { filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.8)); transform: scale(1); }
        50% { filter: drop-shadow(0 0 25px rgba(255, 215, 0, 1)); transform: scale(1.05); }
    }
    @keyframes jewelSparkle {
        0%, 100% { opacity: 0.9; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
    }
    @keyframes trophyRise {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
    @keyframes arrowSpeed {
        0% { transform: translateX(0) translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateX(300px) translateY(-150px) rotate(45deg); opacity: 0; }
    }
    @keyframes motionBlur {
        0%, 100% { opacity: 0.3; transform: translateX(0); }
        50% { opacity: 0.7; transform: translateX(20px); }
    }
    @keyframes flameFlicker {
        0%, 100% { opacity: 0.7; transform: scaleY(1); }
        25% { opacity: 1; transform: scaleY(1.1); }
        50% { opacity: 0.9; transform: scaleY(0.95); }
        75% { opacity: 1; transform: scaleY(1.05); }
    }
    @keyframes sparkRise {
        0% { opacity: 1; transform: translate(0, 0) scale(1); }
        100% { opacity: 0; transform: translate(var(--spark-x, 50px), var(--spark-y, -50px)) scale(0.3); }
    }
    @keyframes leafFloat {
        0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.8; }
        50% { transform: translate(30px, -40px) rotate(180deg); opacity: 0.9; }
    }
    @keyframes windParticle {
        0% { transform: translateX(0) translateY(0); opacity: 0.6; }
        100% { transform: translateX(100px) translateY(-50px); opacity: 0.3; }
    }
    @keyframes cloudDrift {
        0%, 100% { transform: translateX(0); opacity: 0.8; }
        50% { transform: translateX(20px); opacity: 0.9; }
    }
    @keyframes lilyFloat {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-5px) scale(1.02); }
    }
    @keyframes dropGentle {
        0%, 100% { opacity: 0.6; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.1); }
    }
    @keyframes heartFloat {
        0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.9; }
        50% { transform: translateY(-15px) rotate(10deg); opacity: 1; }
    }
    @keyframes sirenFlash {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 1; }
    }
    @keyframes mirrorReflect {
        0%, 100% { opacity: 0.6; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.05); }
    }
    @keyframes patternPulse {
        0%, 100% { opacity: 0.8; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
    }
    @keyframes planetFloat {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(15px, -15px) scale(1.1); }
    }
    @keyframes bubbleRise {
        0% { transform: translateY(0); opacity: 0.7; }
        100% { transform: translateY(-400px); opacity: 0; }
    }
    @keyframes tunnelFade {
        0% { transform: translateZ(0) scale(1); opacity: 0.9; }
        100% { transform: translateZ(-500px) scale(0.1); opacity: 0; }
    }
    @keyframes crossGlow {
        0%, 100% { filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.8)); opacity: 0.9; }
        50% { filter: drop-shadow(0 0 20px rgba(255, 215, 0, 1)); opacity: 1; }
    }
    @keyframes passionPulse {
        0%, 100% { opacity: 0.9; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.1); }
    }
    @keyframes identityFloat {
        0%, 100% { transform: translateY(0); opacity: 0.9; }
        50% { transform: translateY(-10px); opacity: 1; }
    }
    @keyframes horseGallop {
        0%, 100% { transform: translateX(0) translateY(0); }
        25% { transform: translateX(10px) translateY(-5px); }
        50% { transform: translateX(20px) translateY(0); }
        75% { transform: translateX(10px) translateY(-3px); }
    }
    @keyframes cowGraze {
        0%, 100% { transform: translateX(0) scale(1); }
        50% { transform: translateX(5px) scale(1.05); }
    }
    @keyframes crescentGlow {
        0%, 100% { filter: drop-shadow(0 0 10px rgba(255, 200, 87, 0.7)); opacity: 0.9; }
        50% { filter: drop-shadow(0 0 20px rgba(255, 200, 87, 1)); opacity: 1; }
    }
    @keyframes domeShine {
        0%, 100% { filter: drop-shadow(0 0 15px rgba(139, 111, 71, 0.6)); opacity: 0.8; }
        50% { filter: drop-shadow(0 0 25px rgba(139, 111, 71, 0.9)); opacity: 1; }
    }
    @keyframes crownShine {
        0%, 100% { filter: drop-shadow(0 0 15px rgba(255, 107, 157, 0.8)); opacity: 0.9; }
        50% { filter: drop-shadow(0 0 25px rgba(255, 107, 157, 1)); opacity: 1; }
    }
    @keyframes beautyFloat {
        0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
        50% { transform: translateY(-20px) rotate(10deg); opacity: 1; }
    }
    @keyframes windowTwinkle {
        0%, 100% { opacity: 0.8; }
        50% { opacity: 1; }
    }
    @keyframes lionMane {
        0%, 100% { transform: scale(1); opacity: 0.9; }
        50% { transform: scale(1.1); opacity: 1; }
    }
    @keyframes lionBlink {
        0%, 90%, 100% { opacity: 1; }
        95% { opacity: 0.3; }
    }
    @keyframes moonGlow {
        0%, 100% { filter: drop-shadow(0 0 30px rgba(255, 229, 180, 0.8)); opacity: 0.9; }
        50% { filter: drop-shadow(0 0 50px rgba(255, 229, 180, 1)); opacity: 1; }
    }
    @keyframes heartTwinkle {
        0%, 100% { opacity: 0.8; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
    }
    @keyframes skyFall {
        0% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
        100% { transform: translateY(520px) rotate(180deg); opacity: 0.3; }
    }
    @keyframes stumbleFall {
        0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.7; }
        50% { transform: translateY(10px) rotate(15deg); opacity: 0.8; }
    }
    @keyframes floorShift {
        0%, 100% { transform: translateX(0); opacity: 0.5; }
        50% { transform: translateX(5px); opacity: 0.6; }
    }
    @keyframes bubbleBoil {
        0%, 100% { transform: scale(1) translateY(0); opacity: 0.6; }
        50% { transform: scale(1.2) translateY(-5px); opacity: 0.8; }
    }
    @keyframes hypnotize {
        0% { transform: rotate(0deg); opacity: 0.9; }
        100% { transform: rotate(360deg); opacity: 0.9; }
    }
    @keyframes hypnoticPulse {
        0%, 100% { transform: scale(1); opacity: 0.7; stroke-width: 3; }
        50% { transform: scale(1.1); opacity: 1; stroke-width: 4; }
    }
    @keyframes hypnoticRotate {
        0% { transform: rotate(0deg); opacity: 0.9; }
        100% { transform: rotate(360deg); opacity: 0.9; }
    }
    @keyframes hypnoticEye {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.9; }
    }
    @keyframes heartRise {
        0% { transform: translateY(0) scale(1); opacity: 0.7; }
        100% { transform: translateY(-550px) scale(0.5); opacity: 0; }
    }
    @keyframes rosaryFloat {
        0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
        50% { transform: translateY(-5px) rotate(5deg); opacity: 1; }
    }
    @keyframes candleFlicker {
        0%, 100% { transform: scaleY(1) scaleX(1); opacity: 0.9; }
        25% { transform: scaleY(1.1) scaleX(0.95); opacity: 1; }
        50% { transform: scaleY(0.95) scaleX(1.05); opacity: 0.95; }
        75% { transform: scaleY(1.05) scaleX(0.98); opacity: 1; }
    }
    @keyframes doveFloat {
        0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.9; }
        50% { transform: translateY(-10px) rotate(5deg); opacity: 1; }
    }
    @keyframes palmSway {
        0%, 100% { transform: rotate(0deg); opacity: 0.6; }
        50% { transform: rotate(10deg); opacity: 0.8; }
    }
    @keyframes californiaSun {
        0%, 100% { opacity: 0.8; filter: drop-shadow(0 0 30px rgba(255, 149, 0, 0.9)); }
        50% { opacity: 1; filter: drop-shadow(0 0 50px rgba(255, 149, 0, 1)); }
    }
    @keyframes waveRoll {
        0%, 100% { transform: translateX(0); opacity: 0.4; }
        50% { transform: translateX(10px); opacity: 0.5; }
    }
    @keyframes questionFloat {
        0%, 100% { transform: translateY(0) scale(1); opacity: 0.8; }
        50% { transform: translateY(-10px) scale(1.1); opacity: 1; }
    }
    @keyframes phonePulse {
        0%, 100% { transform: scale(1); opacity: 0.7; }
        50% { transform: scale(1.1); opacity: 0.9; }
    }
    @keyframes voidFade {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 0.8; }
    }
    @keyframes policeCarDrive {
        0% { transform: translateX(0); opacity: 0.9; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateX(900px); opacity: 0.9; }
    }
    @keyframes wheelRotate {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    @keyframes policeLightFlash {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
    }
    @keyframes pathGlow {
        0%, 100% { opacity: 0.7; stroke-width: 4; }
        50% { opacity: 1; stroke-width: 5; }
    }
    @keyframes flowerBloom {
        0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.9; }
        50% { transform: scale(1.1) rotate(5deg); opacity: 1; }
    }
    @keyframes rayPulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
    }
    @keyframes arrowRise {
        0% { transform: translateY(0) scale(1); opacity: 0.8; }
        100% { transform: translateY(-400px) scale(0.8); opacity: 0; }
    }
    @keyframes identityRise {
        0%, 100% { transform: translateY(0) scale(1); opacity: 1; }
        50% { transform: translateY(-15px) scale(1.1); opacity: 1; }
    }
    @keyframes speedBurst {
        0% { transform: scale(0) rotate(0deg); opacity: 0.7; }
        50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
        100% { transform: scale(0) rotate(360deg); opacity: 0; }
    }
    @keyframes swirlRotate {
        0% { transform: rotate(0deg) scale(1); opacity: 0.8; }
        50% { transform: rotate(180deg) scale(1.1); opacity: 1; }
        100% { transform: rotate(360deg) scale(1); opacity: 0.8; }
    }
    @keyframes spiralUnravel {
        0% { 
            stroke-dasharray: 0, 3000;
            stroke-dashoffset: 0;
            opacity: 0.9;
            transform: rotate(0deg);
        }
        50% {
            stroke-dasharray: 1500, 3000;
            stroke-dashoffset: -500;
            opacity: 1;
            transform: rotate(180deg);
        }
        100% { 
            stroke-dasharray: 3000, 3000;
            stroke-dashoffset: -1500;
            opacity: 0.9;
            transform: rotate(360deg);
        }
    }
    @keyframes speedStreak {
        0% { transform: translateX(0) translateY(0); opacity: 0.9; }
        100% { transform: translateX(900px) translateY(550px); opacity: 0; }
    }
    @keyframes velocityParticle {
        0% { transform: translateX(0) translateY(0); opacity: 0.9; }
        100% { transform: translateX(900px) translateY(-300px); opacity: 0; }
    }
    @keyframes breezeFlow {
        0%, 100% { opacity: 0.7; transform: translateX(0); }
        50% { opacity: 1; transform: translateX(20px); }
    }
    @keyframes freshBreeze {
        0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0.85; }
        50% { transform: translateY(-30px) translateX(40px) rotate(180deg); opacity: 1; }
    }
    @keyframes breezeSwirl {
        0%, 100% { transform: rotate(0deg) scale(1); opacity: 0.6; }
        50% { transform: rotate(360deg) scale(1.2); opacity: 0.8; }
    }
    @keyframes freshBubble {
        0% { transform: translateY(0) scale(1); opacity: 0.7; }
        100% { transform: translateY(-550px) scale(0.5); opacity: 0; }
    }
    @keyframes chillRipple {
        0% { transform: scale(0); opacity: 0.7; }
        50% { opacity: 1; }
        100% { transform: scale(3); opacity: 0; }
    }
    @keyframes chillFloat {
        0%, 100% { transform: translateY(0) scale(1); opacity: 0.8; }
        50% { transform: translateY(-8px) scale(1.03); opacity: 1; }
    }
    @keyframes chillMist {
        0%, 100% { transform: translateX(0) scale(1); opacity: 0.3; }
        50% { transform: translateX(30px) scale(1.2); opacity: 0.5; }
    }
    @keyframes chillDrop {
        0%, 100% { transform: scale(1); opacity: 0.7; }
        50% { transform: scale(1.3); opacity: 1; }
    }
    @keyframes trophySatisfy {
        0%, 100% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0.9; }
        25% { transform: translateY(-5px) scale(1.05) rotate(-2deg); opacity: 1; }
        75% { transform: translateY(-5px) scale(1.05) rotate(2deg); opacity: 1; }
    }
    @keyframes victorySparkle {
        0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.9; }
        50% { transform: scale(1.5) rotate(180deg); opacity: 1; }
    }
    @keyframes lionPaw {
        0%, 100% { transform: translateY(0); opacity: 0.9; }
        50% { transform: translateY(3px); opacity: 1; }
    }
    @keyframes lionTail {
        0%, 100% { transform: rotate(0deg); opacity: 0.9; }
        50% { transform: rotate(15deg); opacity: 1; }
    }
    @keyframes lotusBloom {
        0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.9; }
        50% { transform: scale(1.1) rotate(5deg); opacity: 1; }
    }
    @keyframes peacockFeather {
        0%, 100% { transform: translateY(0); opacity: 0.9; }
        50% { transform: translateY(-5px); opacity: 1; }
    }
    @keyframes mandalaRotate {
        0% { transform: rotate(0deg); opacity: 0.8; }
        100% { transform: rotate(360deg); opacity: 0.8; }
    }
    @keyframes mandalaPulse {
        0%, 100% { transform: scale(1); opacity: 0.9; }
        50% { transform: scale(1.1); opacity: 1; }
    }
    @keyframes indianSparkle {
        0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
        50% { transform: scale(1.3) rotate(180deg); opacity: 1; }
    }
    @keyframes spiralGoodbye {
        0% { transform: translateZ(0) scale(1) rotate(0deg); opacity: 0.9; }
        100% { transform: translateZ(-300px) scale(0.3) rotate(360deg); opacity: 0.2; }
    }
    @keyframes tearFall {
        0% { transform: translateY(0) scale(1); opacity: 0.7; }
        100% { transform: translateY(250px) scale(0.8); opacity: 0; }
    }
    @keyframes brokenPiece {
        0%, 100% { transform: rotate(0deg) scale(1); opacity: 0.6; }
        50% { transform: rotate(180deg) scale(0.8); opacity: 0.4; }
    }
    @keyframes memoryFade {
        0%, 100% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.2); opacity: 0.7; }
    }
    @keyframes disappear {
        0% { transform: translateZ(0) scale(1); opacity: 0.8; }
        100% { transform: translateZ(-400px) scale(0.1); opacity: 0.1; }
    }
    @keyframes particleDissolve {
        0% { transform: translateZ(0) scale(1); opacity: 0.7; }
        100% { transform: translateZ(-400px) scale(0.2); opacity: 0; }
    }
    @keyframes connectionFade {
        0% { opacity: 0.6; stroke-dashoffset: 0; }
        100% { opacity: 0.1; stroke-dashoffset: 20; }
    }
    @keyframes traceVanish {
        0% { transform: translateZ(0) scale(1); opacity: 0.5; }
        100% { transform: translateZ(-350px) scale(0.3); opacity: 0; }
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

