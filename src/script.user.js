// ==UserScript==
// @name         Fetch App Details from Package Name on Revanced
// @namespace    ByManab
// @version      1.1
// @description  Automatically fetch app name and icon from Google Play Store using the package name extracted from the URL. Watches for URL changes.
// @author       Manab Bala
// @match        https://revanced.app/patches*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    // Add custom styles for the UI
    GM_addStyle(`
        #app-details-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            border: 1px solid #ccc;
            padding: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            font-family: Arial, sans-serif;
        }
        #app-details-container img {
            width: 50px;
            height: 50px;
            margin-right: 10px;
        }
        #app-details-container div {
            display: flex;
            align-items: center;
        }
    `);

    // Function to extract package name from URL
    function getPackageNameFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('pkg'); // Extract the 'pkg' parameter from the URL
    }

    // Function to fetch app details
    function fetchAppDetails(packageName) {
        const url = `https://play.google.com/store/apps/details?id=${packageName}`;

        // Use GM_xmlhttpRequest to fetch the Play Store page
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function (response) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(response.responseText, 'text/html');

                // Extract app name and icon URL
                const appName = doc.querySelector('span[itemprop="name"]')?.textContent.trim();
                const iconUrl = doc.querySelector('img[alt="Icon image"]')?.src;

                if (appName && iconUrl) {
                    // Display the result
                    document.getElementById('app-name').textContent = appName;
                    document.getElementById('app-icon').src = iconUrl;
                    document.getElementById('result').style.display = 'flex';
                    // TODO: improve on this
                    document.getElementById('app-details-container').style.display = 'flex';
                } else {
                    console.error('App details not found. Please check the package name.');
                    // TODO: improve on this
                    document.getElementById('app-details-container').style.display = 'none';
                }
            },
            onerror: function (error) {
                console.error('Failed to fetch app details. Please try again.', error);
                // TODO: improve on this
                document.getElementById('app-details-container').style.display = 'none';
            },
        });
    }

    // Create the UI container
    const container = document.createElement('div');
    container.id = 'app-details-container';
    container.innerHTML = `
        <div id="result" style="display: none;">
            <img id="app-icon" src="" alt="App Icon" />
            <span id="app-name"></span>
        </div>
    `;
    document.body.appendChild(container);

    // Function to initialize the script
    function initialize() {
        const packageName = getPackageNameFromURL();
        if (packageName) {
            fetchAppDetails(packageName);
        } else {
            console.error('No package name found in the URL.');
        }
    }

    // Watch for URL changes
    let lastURL = window.location.href;
    const observer = new MutationObserver(() => {
        if (window.location.href !== lastURL) {
            lastURL = window.location.href;
            initialize(); // Re-run the script when the URL changes
        }
    });

    // Start observing the document body for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Initialize the script on page load
    initialize();
})();