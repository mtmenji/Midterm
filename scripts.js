document.getElementById('searchForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const place = document.getElementById('place').value;
    const date = document.getElementById('date').value;

    // Get place ID from the place name
    const placeResponse = await fetch(`https://api.inaturalist.org/v1/places/autocomplete?q=${place}`);
    const placeData = await placeResponse.json();
    if (!placeData.results.length) {
        alert('Place not found');
        return;
    }

    // Get identifications based on place ID and optional date
    const placeId = placeData.results[0].id;
    let idUrl = `https://api.inaturalist.org/v1/observations?place_id=${placeId}&order_by=observed_on`;
    if (date) {
        idUrl += `&observed_on=${date}`;
    }
    const idResponse = await fetch(idUrl);
    const idData = await idResponse.json();

    // Remove duplictes
    const uniqueResults = [];
    const seenSpecies = new Set();
    for (const result of idData.results) {
        const speciesName = result.taxon ? result.taxon.name : 'Unknown Species';
        if (!seenSpecies.has(speciesName)) {
            seenSpecies.add(speciesName);
            uniqueResults.push(result);
        }
    }

    // Display results
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';
    uniqueResults.forEach(result => {
        const speciesName = result.taxon ? result.taxon.name : 'Unknown Species';
        const imageUrl = result.taxon && result.taxon.default_photo ? result.taxon.default_photo.medium_url : '';

        const resultDiv = document.createElement('div');
        resultDiv.classList.add('result');

        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = speciesName;

        const nameDiv = document.createElement('div');
        nameDiv.textContent = speciesName;

        resultDiv.appendChild(img);
        resultDiv.appendChild(nameDiv);
        resultsContainer.appendChild(resultDiv);
    });
});
