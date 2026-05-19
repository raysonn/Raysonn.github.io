/**
 * ImageGalleryComponent.js
 * Galeria de imagens multimídia usando API pública da NASA
 *
 * @author Raysonn Backend
 * @version 1.0.0
 */

import BaseComponent from '../BaseComponent.js';
import APIClient from '../services/APIClient.js';

class ImageGalleryComponent extends BaseComponent {
    constructor(container, options = {}) {
        super(container, options);
        this.apiClient = new APIClient({
            timeout: 7000,
            maxRetries: 2,
            cacheTTL: 3600000 // 1 hora
        });
        this.query = options.query || 'technology';
        this.pageSize = options.displayCount || 8;
        this.images = [];
        this.queries = ['technology', 'coding', 'server', 'artificial intelligence', 'machine learning'];
        this.paginationOptions = [4, 6, 8, 12];
        this.searchHandler = this.performSearch.bind(this);
        this.searchKeydownHandler = event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.performSearch();
            }
        };
        this.pageSizeHandler = this.updatePageSize.bind(this);
        this.filterHandler = this.applyFilter.bind(this);
    }

    async init() {
        this.render();
        await this.loadImages();
    }

    render() {
        this.container.innerHTML = `
            <div class="image-gallery-container">
                <div class="image-gallery-header">
                    <h3>🖼️ Galeria Multimídia</h3>
                    <p class="image-gallery-subtitle">Imagens técnicas puxadas de uma API pública com lazy loading e fallback inteligente.</p>
                </div>

                <div class="image-gallery-actions">
                    <div class="image-gallery-search">
                        <input id="gallerySearchInput" type="text" placeholder="Pesquisar palavra-chave..." value="${this.escapeHTML(this.query)}" />
                        <button id="gallerySearchBtn" class="btn btn-sm btn-outline-primary">Buscar</button>
                    </div>
                    <div class="image-gallery-page-size">
                        <label for="pageSizeSelect">Itens por página</label>
                        <select id="pageSizeSelect">
                            ${this.paginationOptions.map(size => `
                                <option value="${size}" ${size === this.pageSize ? 'selected' : ''}>${size}</option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                <span class="image-gallery-note">Busca por: <strong>${this.escapeHTML(this.query)}</strong></span>

                <div class="image-gallery-filters" id="imageGalleryFilters">
                    ${this.queries.map(query => `
                        <button class="filter-btn${query === this.query ? ' active' : ''}" data-query="${this.escapeHTML(query)}">
                            ${this.escapeHTML(query)}
                        </button>
                    `).join('')}
                </div>

                <div id="imageGalleryGrid" class="image-gallery-grid">
                    ${Array(this.pageSize).fill(0).map(() => '<div class="gallery-skeleton"></div>').join('')}
                </div>
            </div>

            <style>
                .image-gallery-container {
                    padding: 16px;
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                    border-radius: 12px;
                    color: #0f172a;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
                }

                .image-gallery-header {
                    margin-bottom: 18px;
                }

                .image-gallery-header h3 {
                    font-size: 20px;
                    margin-bottom: 6px;
                    color: #111827;
                }

                .image-gallery-subtitle {
                    margin: 0;
                    font-size: 13px;
                    color: #475569;
                }

                .image-gallery-actions {
                    display: grid;
                    grid-template-columns: minmax(220px, 1fr) auto;
                    gap: 12px;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .image-gallery-search {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    width: 100%;
                }

                .image-gallery-search input {
                    flex: 1;
                    min-width: 180px;
                    padding: 10px 14px;
                    border: 1px solid #d1d5db;
                    border-radius: 10px;
                    background: white;
                    color: #111827;
                    font-size: 13px;
                }

                .image-gallery-search input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
                }

                .image-gallery-search button {
                    white-space: nowrap;
                    padding: 10px 16px;
                    border-radius: 10px;
                }

                .image-gallery-page-size {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    align-items: center;
                    justify-content: flex-end;
                }

                .image-gallery-page-size label {
                    font-size: 12px;
                    color: #4b5563;
                }

                .image-gallery-page-size select {
                    padding: 10px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 10px;
                    background: white;
                    color: #111827;
                    font-size: 13px;
                    min-width: 96px;
                }

                .image-gallery-note {
                    font-size: 12px;
                    color: #4b5563;
                }

                .image-gallery-filters {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-bottom: 18px;
                }

                .filter-btn {
                    padding: 8px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 999px;
                    background: white;
                    color: #111827;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .filter-btn:hover {
                    border-color: #3b82f6;
                    color: #1d4ed8;
                }

                .filter-btn.active {
                    background: #3b82f6;
                    color: white;
                    border-color: #3b82f6;
                }

                .image-gallery-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 14px;
                }

                .gallery-item {
                    position: relative;
                    overflow: hidden;
                    border-radius: 12px;
                    background: white;
                    border: 1px solid #d1d5db;
                    transition: transform 0.25s ease, box-shadow 0.25s ease;
                }

                .gallery-item:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
                }

                .gallery-item img {
                    width: 100%;
                    height: 200px;
                    object-fit: cover;
                    display: block;
                }

                .gallery-item-info {
                    padding: 12px;
                }

                .gallery-item-title {
                    margin: 0 0 8px 0;
                    font-size: 14px;
                    font-weight: 600;
                    color: #0f172a;
                }

                .gallery-item-description {
                    margin: 0;
                    font-size: 12px;
                    color: #475569;
                    line-height: 1.6;
                    white-space: pre-wrap;
                    overflow: visible;
                    max-height: none;
                    min-height: 3.2em;
                }

                .gallery-item-meta {
                    margin-top: 10px;
                    font-size: 11px;
                    color: #6b7280;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .gallery-skeleton {
                    height: 240px;
                    border-radius: 12px;
                    background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                }

                .error-message {
                    grid-column: 1 / -1;
                    background: #fee2e2;
                    border: 1px solid #fca5a5;
                    color: #b91c1c;
                    padding: 14px;
                    border-radius: 10px;
                    font-size: 13px;
                }

                @keyframes loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            </style>
        `;

        const searchButton = this.container.querySelector('#gallerySearchBtn');
        const searchInput = this.container.querySelector('#gallerySearchInput');
        const pageSizeSelect = this.container.querySelector('#pageSizeSelect');
        if (searchButton) {
            searchButton.addEventListener('click', this.searchHandler);
        }
        if (searchInput) {
            searchInput.addEventListener('keydown', this.searchKeydownHandler);
        }
        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', this.pageSizeHandler);
        }

        const filterButtons = this.container.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', this.filterHandler);
        });
    }

    async loadImages(forceReload = false) {
        const grid = this.container.querySelector('#imageGalleryGrid');

        try {
            const endpoint = `https://images-api.nasa.gov/search?q=${encodeURIComponent(this.query)}&media_type=image&page=1`;
            const response = await this.apiClient.request(endpoint, { noCache: forceReload });
            const items = response?.collection?.items || [];

            this.images = items
                .map(item => {
                    const data = item.data?.[0] || {};
                    const preview = Array.isArray(item.links)
                        ? item.links.find(link => link.render === 'image' && link.rel === 'preview') || item.links[0]
                        : null;

                    return {
                        title: data.title || 'Imagem NASA',
                        description: data.description || data.photographer || 'Conteúdo multimídia da NASA.',
                        source: preview?.href || null,
                        center: data.center || 'NASA',
                        date: data.date_created ? new Date(data.date_created).toLocaleDateString() : 'Data desconhecida'
                    };
                })
                .filter(image => image.source)
                .slice(0, this.pageSize);

            if (this.images.length === 0) {
                throw new Error('Nenhuma imagem disponível no momento');
            }

            this.renderGallery(this.images);
            this.eventBus?.publish('gallery:loaded', {
                count: this.images.length,
                timestamp: Date.now()
            });
        } catch (error) {
            grid.innerHTML = `
                <div class="error-message">
                    ⚠️ Não foi possível carregar a galeria multimídia. ${this.escapeHTML(error.message || 'Tente novamente mais tarde.')}
                </div>
            `;
            this.eventBus?.publish('gallery:error', {
                error: error.message || 'unknown'
            });
        }
    }

    renderGallery(images) {
        const grid = this.container.querySelector('#imageGalleryGrid');
        grid.innerHTML = images.map(image => `
            <div class="gallery-item">
                <a href="${this.escapeHTML(image.source)}" target="_blank" rel="noopener noreferrer">
                    <img loading="lazy" src="${this.escapeHTML(image.source)}" alt="${this.escapeHTML(image.title)}" />
                </a>
                <div class="gallery-item-info">
                    <h4 class="gallery-item-title">${this.escapeHTML(image.title)}</h4>
                    <p class="gallery-item-description">${this.escapeHTML(image.description)}</p>
                    <div class="gallery-item-meta">
                        <span>${this.escapeHTML(image.center)}</span>
                        <span>${this.escapeHTML(image.date)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async refreshGallery() {
        await this.loadImages(true);
    }

    async performSearch() {
        const searchInput = this.container.querySelector('#gallerySearchInput');
        if (!searchInput) {
            return;
        }

        const value = searchInput.value.trim();
        if (!value) {
            return;
        }

        this.query = value;
        this.render();
        await this.loadImages(true);
    }

    updatePageSize(event) {
        const selectedSize = Number(event.target.value);
        if (!selectedSize || selectedSize === this.pageSize) {
            return;
        }

        this.pageSize = selectedSize;
        this.render();
        this.loadImages(true);
    }

    applyFilter(event) {
        const button = event.currentTarget;
        const selectedQuery = button.dataset.query;
        if (!selectedQuery || selectedQuery === this.query) {
            return;
        }

        this.query = selectedQuery;
        this.render();
        this.loadImages(true);
    }

    escapeHTML(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    destroy() {
        const searchButton = this.container.querySelector('#gallerySearchBtn');
        const searchInput = this.container.querySelector('#gallerySearchInput');
        const pageSizeSelect = this.container.querySelector('#pageSizeSelect');
        if (searchButton) {
            searchButton.removeEventListener('click', this.searchHandler);
        }
        if (searchInput) {
            searchInput.removeEventListener('keydown', this.searchKeydownHandler);
        }
        if (pageSizeSelect) {
            pageSizeSelect.removeEventListener('change', this.pageSizeHandler);
        }
        this.apiClient.destroy();
        super.destroy();
    }
}

export default ImageGalleryComponent;
