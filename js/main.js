// Main application wrapper
const ScriptMaker = (() => {
    // Private variables
    let scenes = [];
    let selectedColor = null;

    // Available colors for scenes
    const availableColors = [
        'red', 'blue', 'green', 'yellow', 'purple', 'orange', 
        'pink', 'brown', 'gray', 'black', 'white', 'cyan',
        'magenta', 'lime', 'olive', 'navy', 'teal', 'maroon'
    ];

    // Scene object structure
    const createScene = (name, text, color) => ({
        isRecorded: false,
        name: name,
        text: text,
        color: color || availableColors[Math.floor(Math.random() * availableColors.length)]
    });

    // UI Elements
    const elements = {
        form: document.getElementById('addSceneForm'),
        nameInput: document.getElementById('sceneName'),
        textInput: document.getElementById('sceneText'),
        colorPicker: document.getElementById('colorPicker'),
        scenesList: document.getElementById('scenesList'),
        exportButton: document.getElementById('exportJson'),
        importInput: document.getElementById('importJson')
    };

    // Create color picker
    const createColorPicker = () => {
        elements.colorPicker.innerHTML = '';
        availableColors.forEach(color => {
            const colorDiv = document.createElement('div');
            colorDiv.className = 'color-option ma1 pointer';
            colorDiv.style.cssText = `
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background-color: ${color};
                border: 2px solid transparent;
                cursor: pointer;
            `;
            
            colorDiv.addEventListener('click', () => {
                // Remove selected class from all colors
                document.querySelectorAll('.color-option').forEach(opt => {
                    opt.style.border = '2px solid transparent';
                });
                // Add selected class to clicked color
                colorDiv.style.border = '2px solid #000';
                selectedColor = color;
            });

            elements.colorPicker.appendChild(colorDiv);
        });
    };

    // Create scene element
    const createSceneElement = (scene, index) => {
        const sceneDiv = document.createElement('div');
        sceneDiv.className = 'ba br2 pa3 mb3 bg-near-white';
        sceneDiv.innerHTML = `
            <div class="flex justify-between items-center mb2">
                <div class="flex items-center">
                    <div class="color-dot mr2" style="background-color: ${scene.color}; width: 12px; height: 12px; border-radius: 50%; border: 1px solid #ccc;"></div>
                    <h3 class="ma0">${scene.name}</h3>
                </div>
                <div class="flex">
                    <button class="move-up bn bg-blue white pa2 br2 pointer mr2" ${index === 0 ? 'disabled' : ''}>↑</button>
                    <button class="move-down bn bg-blue white pa2 br2 pointer mr2" ${index === scenes.length - 1 ? 'disabled' : ''}>↓</button>
                    <button class="delete-scene bn bg-red white pa2 br2 pointer">×</button>
                </div>
            </div>
            <p class="ma0">${scene.text}</p>
            <div class="mt2">
                <label class="flex items-center">
                    <input type="checkbox" class="mr2" ${scene.isRecorded ? 'checked' : ''}>
                    Gravado
                </label>
            </div>
        `;

        // Add event listeners
        sceneDiv.querySelector('.move-up').addEventListener('click', () => {
            if (ScriptMaker.moveSceneUp(index)) {
                renderScenes();
            }
        });

        sceneDiv.querySelector('.move-down').addEventListener('click', () => {
            if (ScriptMaker.moveSceneDown(index)) {
                renderScenes();
            }
        });

        sceneDiv.querySelector('.delete-scene').addEventListener('click', () => {
            ScriptMaker.removeScene(index);
            renderScenes();
        });

        sceneDiv.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
            if (e.target.checked) {
                ScriptMaker.markAsRecorded(index);
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
                        color: scene.color || availableColors[Math.floor(Math.random() * availableColors.length)]
                    }));
                    renderScenes();
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
            
            ScriptMaker.addScene(name, text, selectedColor);
            renderScenes();
            
            elements.nameInput.value = '';
            elements.textInput.value = '';
            selectedColor = null;
            // Reset color picker selection
            document.querySelectorAll('.color-option').forEach(opt => {
                opt.style.border = '2px solid transparent';
            });
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
            renderScenes();
        }
    };
})();

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Script Maker initialized');
    ScriptMaker.init();
}); 
