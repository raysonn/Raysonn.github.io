function getLanguage() {
    var language = navigator.language;
    return language;
}

function loadSections() {
    $("#portfolio").load("html/sections/sportifolio.html");
    $("#about").load("html/sections/sabout.html");
    $("#contact").load("html/sections/scontacts.html");
    $("#resume").load("html/sections/sresume.html");
}

function loadGames() {
    $(window).on('load', function () {
        $("#games").load("html/sections/sgames.html");
    });
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
