/**
 * CryptoComponent.js
 * Exibe dados de criptomoedasusando CoinGecko API
 * 
 * @author Raysonn Backend
 * @version 1.0.0
 */

import BaseComponent from '../BaseComponent.js';
import APIClient from '../services/APIClient.js';

class CryptoComponent extends BaseComponent {
    constructor(container, options = {}) {
        super(container, options);
        this.apiClient = new APIClient({
            timeout: 5000,
            maxRetries: 2,
            cacheTTL: 600000 // 10 minutos
        });
        this.cryptos = [];
        this.displayCount = options.displayCount || 5;
        this.currency = options.currency || 'usd';
    }

    async init() {
        this.render();
        await this.loadCryptos();
    }

    render() {
        this.container.innerHTML = `
            <div class="crypto-container">
                <div class="crypto-header">
                    <h3>₿ Criptocurrências</h3>
                    <p class="crypto-subtitle">Top 5 criptomoedasem tempo real</p>
                </div>

                <div class="crypto-table-wrapper" id="cryptoTable">
                    <div class="loading-skeleton">
                        ${Array(5).fill(0).map(() => `
                            <div class="skeleton-row"></div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <style>
                .crypto-container {
                    padding: 20px;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    border-radius: 12px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
                    color: #eaeaea;
                }

                .crypto-header {
                    margin-bottom: 20px;
                }

                .crypto-header h3 {
                    font-size: 20px;
                    margin: 0 0 8px 0;
                    color: #f39c12;
                }

                .crypto-subtitle {
                    margin: 0;
                    font-size: 13px;
                    color: #bdc3c7;
                }

                .crypto-table-wrapper {
                    overflow-x: auto;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 13px;
                }

                thead {
                    background: rgba(243, 156, 18, 0.1);
                    border-bottom: 2px solid #f39c12;
                }

                th {
                    padding: 12px;
                    text-align: left;
                    color: #f39c12;
                    font-weight: 600;
                }

                tr {
                    border-bottom: 1px solid #27374d;
                    transition: background 0.2s;
                }

                tbody tr:hover {
                    background: rgba(243, 156, 18, 0.05);
                }

                td {
                    padding: 12px;
                }

                .crypto-name {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 500;
                    color: #ffffff;
                }

                .crypto-icon {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(243, 156, 18, 0.2);
                    font-size: 14px;
                }

                .crypto-price {
                    color: #f39c12;
                    font-weight: 600;
                    font-family: 'Monaco', 'Courier New', monospace;
                }

                .change-positive {
                    color: #2ecc71;
                }

                .change-negative {
                    color: #e74c3c;
                }

                .change-icon {
                    display: inline-block;
                    margin-right: 4px;
                }

                .market-cap {
                    color: #95a5a6;
                    font-family: 'Monaco', 'Courier New', monospace;
                }

                .loading-skeleton {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .skeleton-row {
                    background: linear-gradient(90deg, #27374d 25%, #2d3e50 50%, #27374d 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                    height: 40px;
                    border-radius: 6px;
                }

                @keyframes loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                .error-message {
                    background: rgba(231, 76, 60, 0.1);
                    border: 1px solid #e74c3c;
                    color: #e74c3c;
                    padding: 12px;
                    border-radius: 6px;
                    font-size: 13px;
                }

                .update-info {
                    font-size: 11px;
                    color: #7f8c8d;
                    margin-top: 12px;
                    text-align: right;
                }

                @media (max-width: 600px) {
                    table {
                        font-size: 11px;
                    }

                    th, td {
                        padding: 8px;
                    }

                    .crypto-name {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                }
            </style>
        `;
    }

    async loadCryptos() {
        try {
            const ids = 'bitcoin,ethereum,cardano,solana,ripple';
            const endpoint = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${this.currency}&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&order=market_cap_desc`;

            const data = await this.apiClient.request(endpoint);

            const cryptos = [
                { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', icon: '₿' },
                { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', icon: 'Ξ' },
                { id: 'cardano', name: 'Cardano', symbol: 'ADA', icon: '◆' },
                { id: 'solana', name: 'Solana', symbol: 'SOL', icon: '◈' },
                { id: 'ripple', name: 'Ripple', symbol: 'XRP', icon: '✕' }
            ].map(crypto => ({
                ...crypto,
                price: data[crypto.id]?.[this.currency] || 0,
                marketCap: data[crypto.id]?.[`${this.currency}_market_cap`] || 0,
                change24h: data[crypto.id]?.[`${this.currency}_24h_change`] || 0
            }));

            this.cryptos = cryptos;
            this.renderCryptos(cryptos);

            this.eventBus?.publish('crypto:loaded', {
                count: cryptos.length,
                timestamp: Date.now()
            });

        } catch (error) {
            this.renderError(error);
            this.eventBus?.publish('crypto:error', {
                error: error.message
            });
        }
    }

    renderCryptos(cryptos) {
        const tableWrapper = this.container.querySelector('#cryptoTable');
        
        const html = `
            <table>
                <thead>
                    <tr>
                        <th>Criptomoreda</th>
                        <th>Preço</th>
                        <th>24h Change</th>
                        <th>Market Cap</th>
                    </tr>
                </thead>
                <tbody>
                    ${cryptos.map(crypto => `
                        <tr>
                            <td>
                                <div class="crypto-name">
                                    <div class="crypto-icon">${crypto.icon}</div>
                                    <span>${crypto.name} (${crypto.symbol})</span>
                                </div>
                            </td>
                            <td>
                                <span class="crypto-price">${this.formatPrice(crypto.price)}</span>
                            </td>
                            <td>
                                <span class="change-${crypto.change24h >= 0 ? 'positive' : 'negative'}">
                                    <span class="change-icon">
                                        ${crypto.change24h >= 0 ? '📈' : '📉'}
                                    </span>
                                    ${crypto.change24h.toFixed(2)}%
                                </span>
                            </td>
                            <td>
                                <span class="market-cap">${this.formatMarketCap(crypto.marketCap)}</span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="update-info">
                Atualizado em: ${new Date().toLocaleTimeString('pt-BR')}
            </div>
        `;

        tableWrapper.innerHTML = html;
    }

    renderError(error) {
        const tableWrapper = this.container.querySelector('#cryptoTable');
        tableWrapper.innerHTML = `
            <div class="error-message">
                ⚠️ Erro ao carregar criptomoedasas: ${error.message}
            </div>
        `;
    }

    formatPrice(price) {
        const symbol = this.currency === 'usd' ? '$' : '€';
        return symbol + price.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    formatMarketCap(marketCap) {
        if (marketCap === 0) return 'N/A';
        if (marketCap >= 1e12) return '$' + (marketCap / 1e12).toFixed(2) + 'T';
        if (marketCap >= 1e9) return '$' + (marketCap / 1e9).toFixed(2) + 'B';
        if (marketCap >= 1e6) return '$' + (marketCap / 1e6).toFixed(2) + 'M';
        return '$' + marketCap.toLocaleString('pt-BR');
    }

    destroy() {
        this.apiClient.destroy();
        super.destroy();
    }
}

export default CryptoComponent;
