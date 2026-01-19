
document.addEventListener('DOMContentLoaded', () => {
    // State
    const state = {
        distro: 'debian', // 'debian', 'fedora', 'arch'
        hrtfName: 'atmos' // Base name, no extension
    };

    // DOM Elements
    const hrtfInput = document.getElementById('hrtf-input');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const nameHighlights = document.querySelectorAll('.name-highlight');

    // Command Templates
    const commands = {
        install: {
            debian: 'sudo apt install pipewire pipewire-pulse pipewire-audio-client-libraries',
            fedora: 'sudo dnf install pipewire pipewire-pulseaudio pipewire-utils',
            arch: 'sudo pacman -S pipewire pipewire-pulse pipewire-alsa'
        },
        restart: {
            all: 'systemctl --user restart pipewire pipewire-pulse wireplumber'
        }
    };

    // Init
    function init() {
        updateUI();
        setupListeners();
    }

    function setupListeners() {
        // Tab Buttons
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                state.distro = e.target.dataset.distro;
                updateUI();
            });
        });

        // HRTF Input
        hrtfInput.addEventListener('input', (e) => {
            // Remove extensions if user types them by accident
            let val = e.target.value.trim();
            val = val.replace(/\.zip$/i, '').replace(/\.wav$/i, '');
            state.hrtfName = val || 'atmos';
            updateUI();
        });

        // Copy Buttons
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', handleCopy);
        });
    }

    function updateUI() {
        // 1. Update Tab Active States (Sync all groups)
        tabButtons.forEach(btn => {
            if (btn.dataset.distro === state.distro) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // 2. Update Install Command
        const installCmd = commands.install[state.distro];
        document.getElementById('cmd-install').textContent = installCmd;

        // 3. Update Visual Highlights for Filename
        nameHighlights.forEach(span => {
            span.textContent = state.hrtfName;
        });

        // 4. Update Sed Command
        // Logic: Use absolute path with ${HOME} expansion
        const sedCmd = `sed -i "s|hrir_hesuvi/hrir.wav|\${HOME}/.config/pipewire/hrtf/${state.hrtfName}.wav|g" ~/.config/pipewire/filter-chain.conf.d/99-virtual-surround.conf`;
        document.getElementById('cmd-sed').textContent = sedCmd;

        // 5. Update Restart Command
        document.getElementById('cmd-restart').textContent = commands.restart.all;
    }

    async function handleCopy(e) {
        const btn = e.currentTarget;
        const targetId = btn.dataset.target;
        const text = document.getElementById(targetId).textContent;

        try {
            await navigator.clipboard.writeText(text);

            const originalHTML = btn.innerHTML;
            btn.classList.add('copied');
            btn.innerHTML = '<span class="material-icons">check</span> Copied!';

            setTimeout(() => {
                btn.classList.remove('copied');
                btn.innerHTML = originalHTML;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    }

    init();
});
