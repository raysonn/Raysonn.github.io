var apiConstructors = {};
var apiInstances = {};
var apiEventBus = null;

function getLanguage() {
    var language = navigator.language;
    return language;
}

function loadSections() {
    $("#portfolio").load("html/sections/portfolio.html");
    $("#about").load("html/sections/sabout.html");
    $("#contact").load("html/sections/scontacts.html");
    $("#resume").load("html/sections/sresume.html");
    $("#api-exemplos").load("html/sections/sapi-exemplos.html", function () {
        loadApiExemplos();
    });
}

function loadGames() {
    $(window).on('load', function () {
        $("#games").load("html/sections/sgames.html");
    });
}

function loadInteractions() {
    $(window).on('load', function () {
        $("#interactions").load("html/sections/sinteractions.html", function() {
            // Callback após o HTML ser carregado - inicializa o quiz
            if (typeof initializeInteractions === 'function') {
                initializeInteractions();
            }
        });
    });
}

async function loadApiExemplos() {
    try {
        const [GitHubModule, CountriesModule, CryptoModule, EventBusModule] = await Promise.all([
            import('./interacoes-module/src/components/GitHubStatsComponent.js'),
            import('./interacoes-module/src/components/CountriesComponent.js'),
            import('./interacoes-module/src/components/CryptoComponent.js'),
            import('./interacoes-module/src/infrastructure/EventBus.js')
        ]);

        apiConstructors = {
            github: GitHubModule.default,
            countries: CountriesModule.default,
            crypto: CryptoModule.default
        };

        apiEventBus = new EventBusModule.default();

        $('#api-exemplos .api-card').on('click', function () {
            const apiKey = $(this).data('api');
            if (apiKey) {
                openApiModal(apiKey);
            }
        });
    } catch (error) {
        console.error('Erro ao inicializar seção API Exemplos:', error);
    }
}

async function openApiModal(apiKey) {
    const titles = {
        github: 'GitHub Repositories',
        countries: 'REST Countries',
        crypto: 'CoinGecko'
    };

    const title = titles[apiKey] || 'API Demo';
    $('#apiModalLabel').text(title);

    const container = document.querySelector('#api-component-container');
    if (!container) {
        return;
    }

    if ($('#apiModal').hasClass('show')) {
        return;
    }

    container.innerHTML = '';
    if (apiInstances[apiKey] && typeof apiInstances[apiKey].destroy === 'function') {
        apiInstances[apiKey].destroy();
    }

    const Constructor = apiConstructors[apiKey];
    if (!Constructor) {
        return;
    }

    const displayCount = apiKey === 'countries' ? 4 : 3;
    const instance = new Constructor(container, {
        displayCount,
        eventBus: apiEventBus
    });

    apiInstances[apiKey] = instance;

    try {
        await instance.init();
        $('#apiModal').modal('show');
    } catch (error) {
        console.error('Erro ao abrir modal API:', error);
    }
}

function printPdf(data, title) {
    const byteCharacters = atob(data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const file = new Blob([byteArray], { type: 'application/pdf;base64' });
    const fileURL = URL.createObjectURL(file);
    const winPDF = window.open(fileURL, title);
    // Open PDF
    winPDF.onload = (() => {
        setTimeout(() => winPDF.document.title = title, 1000);
    });
}

function konamiCode() {
    let cursor = 0;
    //const KONAMI_CODE = [38];
    const KONAMI_CODE = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    document.addEventListener('keydown', (e) => {
        cursor = (e.keyCode == KONAMI_CODE[cursor]) ? cursor + 1 : 0;
        if (cursor == KONAMI_CODE.length) CheatsActivated();
    });
}

function CheatsActivated() {
    InverterCores();
    GetRotated();
}

function InverterCores() {
    var css = 'html {-webkit-filter: invert(100%);' +
        '-moz-filter: invert(100%);' +
        '-o-filter: invert(100%);' +
        '-ms-filter: invert(100%); }',

        head = document.getElementsByTagName('head')[0],
        style = document.createElement('style');

    if (!window.counter) { window.counter = 1; } else {
        window.counter++;
        if (window.counter % 2 == 0) { var css = 'html {-webkit-filter: invert(0%); -moz-filter:    invert(0%); -o-filter: invert(0%); -ms-filter: invert(0%); }' }
    };

    style.type = 'text/css';
    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }

    head.appendChild(style);
}

function GetRotated() {
    console.log("GetRotated");
    $("*").toggleClass('rot');
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}
