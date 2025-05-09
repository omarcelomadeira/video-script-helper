// Main application wrapper
const ScriptMaker = (() => {
    // Private variables
    let scenes = [];
    let selectedColor = null;
    let editingIndex = -1;

    // Available colors for scenes with their respective emojis
    const availableColors = [
        { color: 'red', emoji: '😡' },
        { color: 'blue', emoji: '😄' },
        { color: 'green', emoji: '😀' },
        { color: 'yellow', emoji: '🙂' },
        { color: 'purple', emoji: '😊' },
        { color: 'orange', emoji: '🤩' },
        { color: 'pink', emoji: '😍' },
        { color: 'brown', emoji: '💩' },
        { color: 'gray', emoji: '☠️' },
        { color: 'black', emoji: '🥶' },
        { color: 'white', emoji: '🤡' },
        { color: 'cyan', emoji: '👀' },
        { color: 'magenta', emoji: '👹' },
        { color: 'lime', emoji: '😎' },
        { color: 'olive', emoji: '😬' },
        { color: 'navy', emoji: '🙄' },
        { color: 'teal', emoji: '👍' },
        { color: 'maroon', emoji: '✍️' }
    ];

    // Scene object structure
    const createScene = (name, text, color) => ({
        isRecorded: false,
        name: name,
        text: text,
        color: color || availableColors[Math.floor(Math.random() * availableColors.length)].color
    });

    // UI Elements
    const elements = {
        form: document.getElementById('addSceneForm'),
        nameInput: document.getElementById('sceneName'),
        textInput: document.getElementById('sceneText'),
        colorPicker: document.getElementById('colorPicker'),
        scenesList: document.getElementById('scenesList'),
        exportButton: document.getElementById('exportJson'),
        importInput: document.getElementById('importJson'),
        sceneTemplate: document.getElementById('sceneTemplate'),
        totalTime: document.getElementById('totalTime'),
        totalScenes: document.getElementById('totalScenes')
    };

    // Calculate estimated time for a text (in seconds)
    const calculateEstimatedTime = (text) => {
        const characters = text.length;
        const seconds = Math.ceil(characters * 0.058);
        return seconds;
    };

    // Format time in MM:SS format
    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Update total time display
    const updateTotalTime = () => {
        const totalSeconds = scenes.reduce((total, scene) => {
            return total + calculateEstimatedTime(scene.text);
        }, 0);
        elements.totalTime.textContent = formatTime(totalSeconds);
        elements.totalScenes.textContent = scenes.length;
    };

    // Save scenes to localStorage
    const saveToLocalStorage = () => {
        try {
            localStorage.setItem('scriptMakerScenes', JSON.stringify(scenes));
            console.log('Cenas salvas com sucesso no localStorage');
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
        }
    };

    // Load scenes from localStorage
    const loadFromLocalStorage = () => {
        try {
            const savedScenes = localStorage.getItem('scriptMakerScenes');
            if (savedScenes) {
                scenes = JSON.parse(savedScenes);
                renderScenes();
                updateTotalTime();
                console.log('Cenas carregadas com sucesso do localStorage');
            }
        } catch (error) {
            console.error('Erro ao carregar do localStorage:', error);
        }
    };

    // Create color picker
    const createColorPicker = () => {
        elements.colorPicker.innerHTML = '';
        availableColors.forEach(({ color, emoji }) => {
            const colorDiv = document.createElement('div');
            colorDiv.className = 'color-option ma1 pointer';
            colorDiv.style.cssText = `
                width: 24px;
                height: 24px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                filter: grayscale(100%);
                transition: transform 0.2s;
            `;
            colorDiv.textContent = emoji;
            
            colorDiv.addEventListener('click', () => {
                // Remove selected class from all colors
                document.querySelectorAll('.color-option').forEach(opt => {
                    opt.style.filter = 'grayscale(100%)';
                    opt.style.transform = 'scale(1)';
                });
                // Add selected class to clicked color
                colorDiv.style.filter = 'none';
                colorDiv.style.transform = 'scale(1.2)';
                selectedColor = color;
            });

            elements.colorPicker.appendChild(colorDiv);
        });
    };

    // Set form to edit mode
    const setEditMode = (index) => {
        const scene = scenes[index];
        elements.nameInput.value = scene.name;
        elements.textInput.value = scene.text;
        selectedColor = scene.color;
        
        // Update color picker selection
        document.querySelectorAll('.color-option').forEach((opt, i) => {
            if (availableColors[i].color === scene.color) {
                opt.style.filter = 'none';
                opt.style.transform = 'scale(1.2)';
            } else {
                opt.style.filter = 'grayscale(100%)';
                opt.style.transform = 'scale(1)';
            }
        });

        // Change form button text
        const submitButton = elements.form.querySelector('button[type="submit"]');
        submitButton.textContent = 'Salvar';
        submitButton.classList.remove('bg-green');
        submitButton.classList.add('bg-blue');

        editingIndex = index;
    };

    // Reset form to add mode
    const resetForm = () => {
        elements.nameInput.value = '';
        elements.textInput.value = '';
        selectedColor = null;
        
        // Reset color picker selection
        document.querySelectorAll('.color-option').forEach(opt => {
            opt.style.filter = 'grayscale(100%)';
            opt.style.transform = 'scale(1)';
        });

        // Reset form button
        const submitButton = elements.form.querySelector('button[type="submit"]');
        submitButton.textContent = 'Adicionar';
        submitButton.classList.remove('bg-blue');
        submitButton.classList.add('bg-green');

        editingIndex = -1;
    };

    // Create scene element
    const createSceneElement = (scene, index) => {
        // Clone o template
        const sceneDiv = elements.sceneTemplate.content.cloneNode(true).querySelector('.scene-item');
        
        // Configura os elementos
        const colorDot = sceneDiv.querySelector('.color-dot');
        const sceneName = sceneDiv.querySelector('.scene-name');
        const sceneText = sceneDiv.querySelector('.scene-text');
        const moveUpBtn = sceneDiv.querySelector('.move-up');
        const moveDownBtn = sceneDiv.querySelector('.move-down');
        const deleteBtn = sceneDiv.querySelector('.delete-scene');
        const checkbox = sceneDiv.querySelector('input[type="checkbox"]');

        // Define os valores
        const colorInfo = availableColors.find(c => c.color === scene.color);
        colorDot.style.borderColor = scene.color;
        colorDot.textContent = colorInfo ? colorInfo.emoji : '';
        sceneName.textContent = scene.name;
        sceneText.textContent = scene.text;
        checkbox.checked = scene.isRecorded;

        // Desabilita botões de movimento quando necessário
        if (index === 0) moveUpBtn.disabled = true;
        if (index === scenes.length - 1) moveDownBtn.disabled = true;

        // Adiciona event listeners
        sceneDiv.addEventListener('click', (e) => {
            // Don't trigger edit if clicking on controls
            if (!e.target.closest('.move-up') && 
                !e.target.closest('.move-down') && 
                !e.target.closest('.delete-scene') &&
                !e.target.closest('input[type="checkbox"]')) {
                setEditMode(index);
            }
        });

        moveUpBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (ScriptMaker.moveSceneUp(index)) {
                renderScenes();
                saveToLocalStorage();
                updateTotalTime();
            }
        });

        moveDownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (ScriptMaker.moveSceneDown(index)) {
                renderScenes();
                saveToLocalStorage();
                updateTotalTime();
            }
        });

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            ScriptMaker.removeScene(index);
            renderScenes();
            saveToLocalStorage();
            updateTotalTime();
            if (editingIndex === index) {
                resetForm();
            }
        });

        checkbox.addEventListener('change', (e) => {
            e.stopPropagation();
            if (e.target.checked) {
                ScriptMaker.markAsRecorded(index);
                saveToLocalStorage();
            }
        });

        return sceneDiv;
    };

    // Render all scenes
    const renderScenes = () => {
        elements.scenesList.innerHTML = '';
        scenes.forEach((scene, index) => {
            elements.scenesList.appendChild(createSceneElement(scene, index));
        });
    };

    // Export scenes to JSON
    const exportToJson = () => {
        const dataStr = JSON.stringify(scenes, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'script-maker-export.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    // Import scenes from JSON
    const importFromJson = (file) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const importedScenes = JSON.parse(e.target.result);
                if (Array.isArray(importedScenes)) {
                    // Ensure all imported scenes have a color
                    scenes = importedScenes.map(scene => ({
                        ...scene,
                        color: scene.color || availableColors[Math.floor(Math.random() * availableColors.length)].color
                    }));
                    renderScenes();
                    saveToLocalStorage();
                    updateTotalTime();
                    alert('Script importado com sucesso!');
                } else {
                    throw new Error('Formato inválido');
                }
            } catch (error) {
                alert('Erro ao importar o arquivo. Verifique se é um JSON válido.');
                console.error('Erro na importação:', error);
            }
        };
        
        reader.readAsText(file);
    };

    // Initialize UI
    const initUI = () => {
        createColorPicker();

        elements.form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = elements.nameInput.value;
            const text = elements.textInput.value;
            
            if (editingIndex >= 0) {
                // Update existing scene
                scenes[editingIndex].name = name;
                scenes[editingIndex].text = text;
                scenes[editingIndex].color = selectedColor || scenes[editingIndex].color;
                resetForm();
            } else {
                // Add new scene
                ScriptMaker.addScene(name, text, selectedColor);
            }
            
            renderScenes();
            saveToLocalStorage();
            updateTotalTime();
        });

        elements.exportButton.addEventListener('click', exportToJson);
        
        elements.importInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                importFromJson(e.target.files[0]);
                // Reset input value to allow importing the same file again
                e.target.value = '';
            }
        });
    };

    // Public methods
    return {
        // Add a new scene to the script
        addScene: (name, text, color) => {
            scenes.push(createScene(name, text, color));
        },

        // Get all scenes
        getScenes: () => scenes,

        // Mark a scene as recorded
        markAsRecorded: (index) => {
            if (scenes[index]) {
                scenes[index].isRecorded = true;
            }
        },

        // Remove a scene
        removeScene: (index) => {
            if (scenes[index]) {
                scenes.splice(index, 1);
            }
        },

        // Update scene content
        updateScene: (index, name, text) => {
            if (scenes[index]) {
                scenes[index].name = name;
                scenes[index].text = text;
            }
        },

        // Move scene up in the list
        moveSceneUp: (index) => {
            if (index > 0 && index < scenes.length) {
                const temp = scenes[index];
                scenes[index] = scenes[index - 1];
                scenes[index - 1] = temp;
                return true;
            }
            return false;
        },

        // Move scene down in the list
        moveSceneDown: (index) => {
            if (index >= 0 && index < scenes.length - 1) {
                const temp = scenes[index];
                scenes[index] = scenes[index + 1];
                scenes[index + 1] = temp;
                return true;
            }
            return false;
        },

        // Initialize the application
        init: () => {
            initUI();
            loadFromLocalStorage();
            renderScenes();
            updateTotalTime();
        }
    };
})();

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Script Maker initialized');
    ScriptMaker.init();
}); 
