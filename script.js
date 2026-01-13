const searchInput = document.getElementById('searchInput');
const categories = document.querySelectorAll('.category');
const tabButtons = document.querySelectorAll('.tab-button');
const favoritesSection = document.getElementById('favoritesSection');
const favoritesGrid = document.getElementById('favoritesGrid');

// Load favorites from localStorage
let favorites = JSON.parse(localStorage.getItem('fallout4Favorites') || '[]');

// Add copy and favorite buttons to all command items
function initializeCommands() {
    const allCommandItems = document.querySelectorAll('.command-item');
    allCommandItems.forEach((item) => {
        const codeElement = item.querySelector('.command-code');
        const command = codeElement.textContent.trim();

        if (!item.hasAttribute('data-command')) {
            item.setAttribute('data-command', command);
        }

        if (item.querySelector('.command-actions')) {
            return;
        }

        const header = document.createElement('div');
        header.className = 'command-header';

        const actions = document.createElement('div');
        actions.className = 'command-actions';

        const copyBtn = document.createElement('button');
        copyBtn.className = 'btn-icon btn-copy';
        copyBtn.title = 'Copy command';
        copyBtn.innerHTML = '📋 Copy';
        copyBtn.onclick = () => copyCommand(command, copyBtn);

        const favBtn = document.createElement('button');
        favBtn.className = 'btn-icon btn-favorite';
        favBtn.title = 'Add to favorites';
        favBtn.innerHTML = favorites.includes(command) ? '★' : '☆';
        if (favorites.includes(command)) {
            favBtn.classList.add('favorited');
            item.classList.add('favorited');
        }
        favBtn.onclick = () => toggleFavorite(command, item, favBtn);

        actions.appendChild(copyBtn);
        actions.appendChild(favBtn);

        item.insertBefore(header, item.firstChild);
        header.appendChild(codeElement);
        header.appendChild(actions);
    });
}

// Copy command to clipboard
function copyCommand(command, button) {
    navigator.clipboard.writeText(command).then(() => {
        const originalText = button.innerHTML;
        button.innerHTML = '✓ Copied!';
        button.style.background = '#238636';
        button.style.borderColor = '#238636';
        button.style.color = '#fff';

        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
            button.style.borderColor = '';
            button.style.color = '';
        }, 1500);
    });
}

// Toggle favorite
function toggleFavorite(command, item, button) {
    const index = favorites.indexOf(command);
    if (index > -1) {
        favorites.splice(index, 1);
        button.innerHTML = '☆';
        button.classList.remove('favorited');
        item.classList.remove('favorited');
    } else {
        favorites.push(command);
        button.innerHTML = '★';
        button.classList.add('favorited');
        item.classList.add('favorited');
    }
    localStorage.setItem('fallout4Favorites', JSON.stringify(favorites));
    updateFavoritesView();
}

// Update favorites view
function updateFavoritesView() {
    if (favorites.length === 0) {
        favoritesGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⭐</div>
                <p>No favorites yet</p>
                <small>Click the star icon on any command to add it to your favorites</small>
            </div>
        `;
        return;
    }

    favoritesGrid.innerHTML = '';
    favorites.forEach((command) => {
        const originalItem = document.querySelector(`.command-item[data-command="${CSS.escape(command)}"]`);
        if (originalItem) {
            const clone = originalItem.cloneNode(true);
            const copyBtn = clone.querySelector('.btn-copy');
            const favBtn = clone.querySelector('.btn-favorite');
            copyBtn.onclick = () => copyCommand(command, copyBtn);
            favBtn.onclick = () => {
                toggleFavorite(command, originalItem, originalItem.querySelector('.btn-favorite'));
                favBtn.innerHTML = favorites.includes(command) ? '★' : '☆';
                if (!favorites.includes(command)) {
                    clone.remove();
                }
            };
            favoritesGrid.appendChild(clone);
        }
    });
}

// Tab navigation
tabButtons.forEach((button) => {
    button.addEventListener('click', function () {
        tabButtons.forEach((btn) => btn.classList.remove('active'));
        this.classList.add('active');

        const target = this.getAttribute('data-target');

        searchInput.value = '';

        if (target === 'favorites') {
            favoritesSection.classList.remove('hidden');
            categories.forEach((cat) => cat.classList.add('hidden'));
            updateFavoritesView();
        } else {
            favoritesSection.classList.add('hidden');

            categories.forEach((category) => {
                if (target === 'all') {
                    category.classList.remove('hidden');
                    category.querySelectorAll('.command-item').forEach((item) => {
                        item.classList.remove('hidden');
                    });
                } else {
                    const categoryType = category.getAttribute('data-category');
                    if (categoryType === target) {
                        category.classList.remove('hidden');
                        category.querySelectorAll('.command-item').forEach((item) => {
                            item.classList.remove('hidden');
                        });
                    } else {
                        category.classList.add('hidden');
                    }
                }
            });
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// Search functionality
searchInput.addEventListener('input', function () {
    const searchTerm = this.value.toLowerCase();

    favoritesSection.classList.add('hidden');

    if (searchTerm) {
        tabButtons.forEach((btn) => btn.classList.remove('active'));
        tabButtons[0].classList.add('active');
    }

    categories.forEach((category) => {
        let hasVisibleCommands = false;
        const items = category.querySelectorAll('.command-item');

        items.forEach((item) => {
            const code = item.querySelector('.command-code').textContent.toLowerCase();
            const description = item
                .querySelector('.command-description')
                .textContent.toLowerCase();

            if (code.includes(searchTerm) || description.includes(searchTerm)) {
                item.classList.remove('hidden');
                hasVisibleCommands = true;
            } else {
                item.classList.add('hidden');
            }
        });

        if (hasVisibleCommands || searchTerm === '') {
            category.classList.remove('hidden');
        } else {
            category.classList.add('hidden');
        }
    });
});

initializeCommands();
