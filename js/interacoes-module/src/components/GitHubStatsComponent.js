/**
 * GitHubStatsComponent.js
 * Exibe estatísticas de repositórios GitHub
 * 
 * @author Raysonn Backend
 * @version 1.0.0
 */

import BaseComponent from '../BaseComponent.js';
import APIClient from '../services/APIClient.js';

class GitHubStatsComponent extends BaseComponent {
    constructor(container, options = {}) {
        super(container, options);
        this.apiClient = new APIClient({
            timeout: 5000,
            maxRetries: 2,
            cacheTTL: 3600000 // 1 hora
        });
        this.repositories = [];
        this.username = options.username || 'raysonn'; // Seu username GitHub
        this.maxRepos = options.maxRepos || 6;
    }

    async init() {
        this.render();
        await this.loadRepositories();
    }

    render() {
        this.container.innerHTML = `
            <div class="github-stats-container">
                <div class="github-header">
                    <h3>📊 GitHub Repositories</h3>
                    <p class="github-subtitle">Repositórios públicos com melhores estatísticas</p>
                </div>

                <div class="repos-grid" id="reposGrid">
                    <div class="loading-skeleton">
                        <div class="skeleton-card"></div>
                        <div class="skeleton-card"></div>
                        <div class="skeleton-card"></div>
                    </div>
                </div>

                <div class="github-stats-footer">
                    <a href="https://github.com/${this.username}" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       class="view-profile-btn">
                        Ver Perfil Completo →
                    </a>
                </div>
            </div>

            <style>
                .github-stats-container {
                    padding: 20px;
                    background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
                    border-radius: 12px;
                    color: #c9d1d9;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
                }

                .github-header {
                    margin-bottom: 24px;
                }

                .github-header h3 {
                    font-size: 20px;
                    margin: 0 0 8px 0;
                    color: #58a6ff;
                }

                .github-subtitle {
                    margin: 0;
                    font-size: 13px;
                    color: #8b949e;
                }

                .repos-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 16px;
                    margin-bottom: 20px;
                }

                .repo-card {
                    background: #0d1117;
                    border: 1px solid #30363d;
                    border-radius: 8px;
                    padding: 16px;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .repo-card:hover {
                    border-color: #58a6ff;
                    background: #161b22;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(88, 166, 255, 0.15);
                }

                .repo-name {
                    display: flex;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .repo-name a {
                    font-size: 16px;
                    font-weight: 600;
                    color: #58a6ff;
                    text-decoration: none;
                    margin-right: 8px;
                }

                .repo-name a:hover {
                    text-decoration: underline;
                }

                .repo-visibility {
                    display: inline-block;
                    font-size: 11px;
                    color: #8b949e;
                    border: 1px solid #30363d;
                    padding: 2px 8px;
                    border-radius: 12px;
                    background: rgba(48, 54, 61, 0.3);
                }

                .repo-description {
                    font-size: 12px;
                    color: #8b949e;
                    margin-bottom: 12px;
                    line-height: 1.5;
                    min-height: 36px;
                }

                .repo-language {
                    display: inline-block;
                    font-size: 11px;
                    padding: 2px 8px;
                    background: rgba(88, 166, 255, 0.1);
                    border-radius: 4px;
                    color: #58a6ff;
                    margin-bottom: 12px;
                }

                .repo-stats {
                    display: flex;
                    gap: 16px;
                    font-size: 12px;
                    color: #8b949e;
                    border-top: 1px solid #30363d;
                    padding-top: 12px;
                }

                .stat {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .stat-icon {
                    font-size: 14px;
                }

                .loading-skeleton {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 16px;
                }

                .skeleton-card {
                    background: linear-gradient(90deg, #30363d 25%, #21262d 50%, #30363d 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                    height: 180px;
                    border-radius: 8px;
                }

                @keyframes loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                .error-message {
                    background: rgba(248, 81, 73, 0.1);
                    border: 1px solid #f85149;
                    color: #f85149;
                    padding: 12px;
                    border-radius: 6px;
                    font-size: 13px;
                    margin-bottom: 12px;
                }

                .error-message a {
                    color: #58a6ff;
                    text-decoration: none;
                }

                .error-message a:hover {
                    text-decoration: underline;
                }

                .github-stats-footer {
                    text-align: center;
                }

                .view-profile-btn {
                    display: inline-block;
                    padding: 8px 16px;
                    background: #238636;
                    color: #fff;
                    border: 1px solid #2ea043;
                    border-radius: 6px;
                    text-decoration: none;
                    font-size: 13px;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .view-profile-btn:hover {
                    background: #2ea043;
                    box-shadow: 0 8px 24px rgba(36, 134, 58, 0.4);
                }
            </style>
        `;
    }

    async loadRepositories() {
        try {
            const grid = this.container.querySelector('#reposGrid');
            
            const repos = await this.apiClient.request(
                `https://api.github.com/users/${this.username}/repos?sort=stars&per_page=${this.maxRepos}`
            );

            this.repositories = repos;
            this.renderRepositories(repos);

            // Publicar evento
            this.eventBus?.publish('github:loaded', {
                repos: repos.length,
                timestamp: Date.now()
            });

        } catch (error) {
            this.renderError(error);
            this.eventBus?.publish('github:error', {
                error: error.message,
                type: error.type
            });
        }
    }

    renderRepositories(repos) {
        const grid = this.container.querySelector('#reposGrid');
        
        if (repos.length === 0) {
            grid.innerHTML = '<div class="error-message">Nenhum repositório encontrado</div>';
            return;
        }

        grid.innerHTML = repos.map(repo => `
            <div class="repo-card">
                <div class="repo-name">
                    <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
                        ${this.escapeHTML(repo.name)}
                    </a>
                    <span class="repo-visibility">${repo.private ? 'Private' : 'Public'}</span>
                </div>

                ${repo.description ? `
                    <div class="repo-description">${this.escapeHTML(repo.description)}</div>
                ` : '<div class="repo-description">Sem descrição</div>'}

                ${repo.language ? `
                    <div class="repo-language">🔹 ${repo.language}</div>
                ` : ''}

                <div class="repo-stats">
                    <div class="stat">
                        <span class="stat-icon">⭐</span>
                        <span>${repo.stargazers_count}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-icon">🔀</span>
                        <span>${repo.forks_count}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-icon">👁️</span>
                        <span>${repo.watchers_count}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderError(error) {
        const grid = this.container.querySelector('#reposGrid');
        
        let errorMessage = 'Erro ao carregar repositórios';
        if (error.type === 'TIMEOUT') {
            errorMessage = 'Requisição expirou. Tente novamente em alguns momentos.';
        } else if (error.type === 'NETWORK_ERROR') {
            errorMessage = 'Sem conexão de internet. Verifique sua conexão.';
        } else if (error.type === 'NOT_FOUND') {
            errorMessage = `Usuário GitHub "${this.username}" não encontrado.`;
        }

        grid.innerHTML = `
            <div class="error-message">
                ⚠️ ${errorMessage}
                <br><br>
                <small>Verifique <a href="https://github.com/${this.username}" target="_blank">o perfil diretamente</a></small>
            </div>
        `;
    }

    escapeHTML(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    destroy() {
        this.apiClient.destroy();
        super.destroy();
    }
}

export default GitHubStatsComponent;
