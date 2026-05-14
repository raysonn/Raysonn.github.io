/**
 * CountriesComponent.js
 * Exibe dados sobre países usando REST Countries API
 * 
 * @author Raysonn Backend
 * @version 1.0.0
 */

import BaseComponent from '../BaseComponent.js';
import APIClient from '../services/APIClient.js';

class CountriesComponent extends BaseComponent {
    constructor(container, options = {}) {
        super(container, options);
        this.apiClient = new APIClient({
            timeout: 5000,
            maxRetries: 2,
            cacheTTL: 86400000 // 24 horas
        });
        this.countries = [];
        this.displayCount = options.displayCount || 8;
        this.region = options.region || null;
    }

    async init() {
        this.render();
        await this.loadCountries();
    }

    render() {
        this.container.innerHTML = `
            <div class="countries-container">
                <div class="countries-header">
                    <h3>🌍 Países & Capitais</h3>
                    <p class="countries-subtitle">Dados em tempo real da REST Countries API</p>
                </div>

                <div class="filter-buttons" id="filterButtons"></div>

                <div class="countries-grid" id="countriesGrid">
                    <div class="loading-skeleton">
                        ${Array(4).fill(0).map(() => '<div class="skeleton-card"></div>').join('')}
                    </div>
                </div>
            </div>

            <style>
                .countries-container {
                    padding: 20px;
                    background: linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%);
                    border-radius: 12px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
                }

                .countries-header {
                    margin-bottom: 20px;
                }

                .countries-header h3 {
                    font-size: 20px;
                    margin: 0 0 8px 0;
                    color: #1f2937;
                }

                .countries-subtitle {
                    margin: 0;
                    font-size: 13px;
                    color: #6b7280;
                }

                .filter-buttons {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }

                .filter-btn {
                    padding: 6px 14px;
                    border: 1px solid #d1d5db;
                    background: white;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.2s;
                    color: #374151;
                    font-weight: 500;
                }

                .filter-btn:hover {
                    border-color: #3b82f6;
                    color: #3b82f6;
                }

                .filter-btn.active {
                    background: #3b82f6;
                    color: white;
                    border-color: #3b82f6;
                }

                .countries-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 16px;
                }

                .country-card {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }

                .country-card:hover {
                    border-color: #3b82f6;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
                    transform: translateY(-2px);
                }

                .country-flag {
                    font-size: 48px;
                    height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 100%);
                }

                .country-info {
                    padding: 12px;
                }

                .country-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 8px;
                }

                .country-data {
                    font-size: 12px;
                    color: #6b7280;
                    line-height: 1.6;
                }

                .country-data-item {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 4px;
                }

                .country-data-label {
                    font-weight: 500;
                    color: #374151;
                }

                .country-data-value {
                    color: #6b7280;
                }

                .loading-skeleton {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 16px;
                }

                .skeleton-card {
                    background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                    height: 240px;
                    border-radius: 8px;
                }

                @keyframes loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                .error-message {
                    background: #fee2e2;
                    border: 1px solid #fca5a5;
                    color: #dc2626;
                    padding: 12px;
                    border-radius: 6px;
                    font-size: 13px;
                }
            </style>
        `;
    }

    async loadCountries() {
        try {
            const fields = 'name,capital,region,population,languages,flag';
            const endpoint = this.region
                ? `https://restcountries.com/v3.1/region/${this.region}?fields=${fields}`
                : `https://restcountries.com/v3.1/all?fields=${fields}`;

            let countries = await this.apiClient.request(endpoint);

            // Ordenar por população (maior primeiro)
            countries = countries
                .sort((a, b) => (b.population || 0) - (a.population || 0))
                .slice(0, this.displayCount);

            this.countries = countries;
            this.renderCountries(countries);
            this.renderFilters();

            this.eventBus?.publish('countries:loaded', {
                count: countries.length,
                timestamp: Date.now()
            });

        } catch (error) {
            this.renderError(error);
            this.eventBus?.publish('countries:error', {
                error: error.message
            });
        }
    }

    renderFilters() {
        // Botões de regiões populares
        const regions = ['Americas', 'Europe', 'Africa', 'Asia', 'Oceania'];
        const filterButtons = this.container.querySelector('#filterButtons');
        
        filterButtons.innerHTML = regions.map(region => `
            <button class="filter-btn" data-region="${region}">
                ${region}
            </button>
        `).join('');

        filterButtons.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => this.filterByRegion(btn.dataset.region));
        });
    }

    async filterByRegion(region) {
        this.region = region;
        this.render();
        await this.loadCountries();
    }

    renderCountries(countries) {
        const grid = this.container.querySelector('#countriesGrid');
        
        if (countries.length === 0) {
            grid.innerHTML = '<div class="error-message">Nenhum país encontrado</div>';
            return;
        }

        grid.innerHTML = countries.map(country => {
            const name = country.name?.common || country.name || 'N/A';
            const capital = country.capital?.[0] || 'N/A';
            const region = country.region || 'N/A';
            const population = country.population
                ? (country.population / 1000000).toFixed(1) + 'M'
                : 'N/A';
            const languages = country.languages
                ? Object.values(country.languages).join(', ')
                : 'N/A';
            const flag = country.flag || '🏳️';

            return `
                <div class="country-card">
                    <div class="country-flag">${flag}</div>
                    <div class="country-info">
                        <div class="country-name">${this.escapeHTML(name)}</div>
                        <div class="country-data">
                            <div class="country-data-item">
                                <span class="country-data-label">Capital:</span>
                                <span class="country-data-value">${this.escapeHTML(capital)}</span>
                            </div>
                            <div class="country-data-item">
                                <span class="country-data-label">Região:</span>
                                <span class="country-data-value">${this.escapeHTML(region)}</span>
                            </div>
                            <div class="country-data-item">
                                <span class="country-data-label">População:</span>
                                <span class="country-data-value">${population}</span>
                            </div>
                            <div class="country-data-item">
                                <span class="country-data-label">Idioma:</span>
                                <span class="country-data-value">${this.escapeHTML(languages)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderError(error) {
        const grid = this.container.querySelector('#countriesGrid');
        grid.innerHTML = `
            <div class="error-message">
                ⚠️ Erro ao carregar países: ${error.message}
            </div>
        `;
    }

    escapeHTML(text) {
        if (!text) return 'N/A';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    destroy() {
        this.apiClient.destroy();
        super.destroy();
    }
}

export default CountriesComponent;
