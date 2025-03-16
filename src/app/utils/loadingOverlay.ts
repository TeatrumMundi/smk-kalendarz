/**
 * Utility to create and manage a loading overlay with progress bar
 */

export interface LoadingOverlayOptions {
    message?: string;
    zIndex?: number;
    backgroundColor?: string;
    textColor?: string;
    progressBarColor?: string;
    progressBarBackgroundColor?: string;
}

export interface LoadingOverlayControls {
    updateProgress: (percent: number) => void;
    updateMessage: (message: string) => void;
    close: () => void;
}

export const createLoadingOverlay = (
    options: LoadingOverlayOptions = {}
): LoadingOverlayControls => {
    const {
        message = 'Loading...',
        zIndex = 9999,
        backgroundColor = 'rgba(0, 0, 0, 0.7)',
        textColor = 'white',
        progressBarColor = '#4CAF50',
        progressBarBackgroundColor = '#333'
    } = options;

    // Create loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.style.position = 'fixed';
    loadingOverlay.style.top = '0';
    loadingOverlay.style.left = '0';
    loadingOverlay.style.width = '100%';
    loadingOverlay.style.height = '100%';
    loadingOverlay.style.backgroundColor = backgroundColor;
    loadingOverlay.style.zIndex = zIndex.toString();
    loadingOverlay.style.display = 'flex';
    loadingOverlay.style.justifyContent = 'center';
    loadingOverlay.style.alignItems = 'center';
    loadingOverlay.style.flexDirection = 'column';

    // Create loading text
    const loadingText = document.createElement('div');
    loadingText.textContent = message;
    loadingText.style.color = textColor;
    loadingText.style.marginBottom = '20px';
    loadingText.style.fontSize = '18px';

    // Create progress container
    const progressContainer = document.createElement('div');
    progressContainer.style.width = '300px';
    progressContainer.style.height = '10px';
    progressContainer.style.backgroundColor = progressBarBackgroundColor;
    progressContainer.style.borderRadius = '5px';

    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.style.width = '0%';
    progressBar.style.height = '100%';
    progressBar.style.backgroundColor = progressBarColor;
    progressBar.style.borderRadius = '5px';
    progressBar.style.transition = 'width 0.3s';

    // Assemble the overlay
    progressContainer.appendChild(progressBar);
    loadingOverlay.appendChild(loadingText);
    loadingOverlay.appendChild(progressContainer);
    document.body.appendChild(loadingOverlay);

    // Return control functions
    return {
        updateProgress: (percent: number) => {
            progressBar.style.width = `${percent}%`;
            loadingText.textContent = `${message} ${Math.round(percent)}%`;
        },
        updateMessage: (newMessage: string) => {
            loadingText.textContent = newMessage;
        },
        close: () => {
            if (document.body.contains(loadingOverlay)) {
                document.body.removeChild(loadingOverlay);
            }
        }
    };
};

/**
 * Helper function to clean up any existing loading overlays
 * Useful when handling errors to ensure the UI isn't blocked
 */
export const removeExistingOverlays = () => {
    const existingOverlay = document.querySelector('div[style*="position: fixed"][style*="display: flex"][style*="zIndex"]');
    if (existingOverlay && existingOverlay.parentNode) {
        existingOverlay.parentNode.removeChild(existingOverlay);
    }
};