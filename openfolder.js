let papnames = []; //papnames being used later for the pap table

async function readFolderRecursive(dirHandle, path = '', namesArray = [], contentArray = []) {
    // page visual adjustments
    document.getElementById('intro').style.display = 'none';
    document.getElementById('btnfolder').textContent = 'Replace folder';
    jsonObjects = [];
    //open files in the folder
    for await (const [name, handle] of dirHandle.entries()) {
        if (handle.kind === 'file') {
            let filePath = `${path}${name}`;
            namesArray.push(`${path}${name}`);
            const file = await handle.getFile();
            const text = await file.text();

            if (name.endsWith('.json')) {
                try {
                    const jsonData = JSON.parse(text);
                    jsonObjects.push({ filePath, jsonData }); //jsonData is gone after iteration finishes
                } catch (error) {
                    console.error(`Error parsing JSON from ${name}:`, error);
                    document.getElementById('btnfolder_errmsg').style.display = 'block';
                    document.getElementById('btnfolder_errmsg').textContent = `Error parsing JSON from ${name}: ${error.message}`;
                }
            }


            contentArray.push(`--- ${path}${name} ---\n${text}\n\n`);
        } else if (handle.kind === 'directory') {
            await readFolderRecursive(handle, `${path}${name}/`, namesArray, contentArray);
        }
    }

}

function findAssignedPapNames(jsonObjects) {
    const assignedPapData = [];

    for (const { jsonData } of jsonObjects) {
        if (!jsonData.Options || !Array.isArray(jsonData.Options)) continue;

        for (const option of jsonData.Options) {
            if (!option.Files) continue;

            for (const [pathKey, assignedValue] of Object.entries(option.Files)) {

                assignedPapData.push({ pathKey, assignedValue });
            }
        }
    }

    console.log('Assigned pap data:', assignedPapData);
    return assignedPapData;
}

function normalizePath(path) {
    path = String(path); // Ensure path is a string
    return path.replace(/c\d{4}/, 'c0101');
}

document.getElementById('btnfolder').addEventListener('click', async function () {
    try {
        const folderPath = await window.showDirectoryPicker();
        document.getElementById('btnfolder_errmsg').style.display = 'none';

        let jsoncontent = [];
        let jsonnames = [];

        // json names with funcion and jsoncontent with for (wasn't working with function)
        await readFolderRecursive(folderPath, '', jsonnames);
        for await (const [name, handle] of folderPath.entries()) {
            if (handle.kind === 'file') {
                const file = await handle.getFile();
                const text = await file.text();
                jsoncontent.push(`--- ${name} ---\n${text}\n\n`);
            }
        }
        // Filter out .json files and keep only .pap files
        papnames = jsonnames.filter(name => name.endsWith('.pap'));
        papnames = papnames.map(name => {
            const parts = name.split('/');
            return parts[parts.length - 1];

        });
        // trying to find assigned paths in jsoncontent
        let assignedPathNames = []
        jsonObjects.forEach(({ jsonData }) => {
            for (const key of Object.keys(jsonData)) {
                if (key.endsWith('.pap')) {
                    assignedPathNames.push(key);
                }
            }
        });
        //test logs
        console.log('Assigned paths:', assignedPathNames);
        console.log(papnames);

        //actually showing the json content on the page
        document.getElementById('jsonnames').textContent = jsonnames.join('\n');
        document.getElementById('jsoncontent').textContent = jsoncontent;
        console.log(jsonObjects);
    }
    catch (error) {
        console.error('Error opening folder:', error);
        document.getElementById('btnfolder_errmsg').style.display = 'block';
        document.getElementById('btnfolder_errmsg').textContent = 'Error: ' + error.message;
    }

    //building the pap table visible on website
    if (document.getElementById('papTable').style.display === 'none') {
        document.getElementById('papTable').style.display = 'table';
    }
    if (papnames.length > 0) {
        const tbody = document.querySelector('#papTable tbody');
        tbody.innerHTML = ''; // Clear existing rows

        papnames.forEach(pap => {
            const tr = document.createElement('tr');

            //papnames
            const tdName = document.createElement('td');
            tdName.textContent = pap;
            tr.appendChild(tdName);

            //checkbox
            const tdCheckbox = document.createElement('td');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            tdCheckbox.appendChild(checkbox);
            tr.appendChild(tdCheckbox);

            //select method
            const tdSelectMethod = document.createElement('td');
            const selectMethod = document.createElement('select');

            for (const key in method_map) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = key;
                selectMethod.appendChild(option);

                let keywords = method_map[key];
                if (!Array.isArray(keywords)) {
                    keywords = [keywords];
                }
                const papLower = pap.toLowerCase();
                const found = keywords.some(keywords => papLower.includes(keywords.toLowerCase()));

                if (found) {
                    option.selected = true; // Select the option if keywords match
                }
            }
            tdSelectMethod.appendChild(selectMethod)
            tr.appendChild(tdSelectMethod);

            //select emote
            const tdSelectEmote = document.createElement('td');
            const selectEmote = document.createElement('select');
            selectEmote.innerHTML = ''; // Clear existing options
            const assignedFileName = findAssignedPapNames(jsonObjects, pap);
            let assignedfound = '';
            for (const assigned of assignedFileName) {
                if (assigned.assignedValue.includes(pap)) {
                    assignedfound = assigned.pathKey;
                    console.log(`Found assigned pap name: ${assigned.pathKey} for ${pap}`);
                    break; // Stop after finding the first match
                }
            }
            for (const key in emote_map) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = emote_map[key];
                selectEmote.appendChild(option);

                let keywords = [normalizePath(key)];
                if (!Array.isArray(keywords)) {
                    keywords = [keywords];
                }
                
                

                const found = assignedfound && keywords.some(keyword =>
                    normalizePath(assignedfound.toLowerCase()).includes(keyword.toLowerCase()));
                //const emoteLower = pap.toLowerCase();
                //const found = keywords.some(keywords => emoteLower.includes(keywords.toLowerCase()));
                if (found) {
                    option.selected = true; // Select the option if keywords match
                }
                else {
                    const found = keywords.some(keyword =>
                        normalizePath(pap.toLowerCase()).includes(keyword.toLowerCase()));
                    if (found) {
                    option.selected = true; // Select the option if keywords match
                    }
                    else {
                        // If no match found, you can handle it here if needed
                    console.log(`No match found for ${assignedFileName} in papnames`);
                    //create a new option for original path
                    const newOption = document.createElement('option');
                    newOption.value = assignedFileName;
                    }
                }

            }
            tdSelectEmote.appendChild(selectEmote);
            tr.appendChild(tdSelectEmote);

            //delete button
            const tdButton = document.createElement('td');
            const delBtn = document.createElement('button');
            delBtn.textContent = '✕';
            delBtn.addEventListener('click', () => {
                tr.remove(); // Remove the row
            });
            tdButton.appendChild(delBtn);
            tr.appendChild(tdButton);

            tbody.appendChild(tr);

        });


    } else {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 5; // Adjust based on the number of columns
        td.textContent = 'No .pap files found';
        tr.appendChild(td);
        tbody.appendChild(tr);
    }

}
);
