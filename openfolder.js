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

    //console.log('Assigned pap data:', assignedPapData);
    return assignedPapData;
}

function findAssignedGroup(jsonObjects, papName) {
    const groups = [];
    for (const { jsonData } of jsonObjects) {
        if (!jsonData.Options || !Array.isArray(jsonData.Options)) continue;

        const topLevelName = Array.isArray(jsonData)
            ? jsonData[0]?.Name
            : jsonData.Name || "Unnamed Group";

        for (const option of jsonData.Options) {
            if (!option.Files) continue;

            for (const [pathKey, assignedValue] of Object.entries(option.Files)) {
                const values = Array.isArray(assignedValue) ? assignedValue : [assignedValue];
                if (values.some(val => normalizePath(val).includes(normalizePath(papName)))) {
                    groups.push(topLevelName);
                }
            }
        }
    }
    return groups;
}




function normalizePath(path) {
    path = String(path); // Ensure path is a string
    return path.replace(/c\d{4}/, 'c0101');
}

function drag(event) {
    const tr = event.target.closest('tr'); // ensures you always get the row
    event.dataTransfer.setData("text/plain", tr.dataset.id);
}

function allowDrop(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/plain");
    const draggedRow = document.querySelector(`[data-id="${id}"]`)
    if (draggedRow) {
        event.currentTarget.appendChild(draggedRow);
    }
}

let jsonnamesonly = [];
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

        jsonnamesonly = jsonnames.filter(name => name.endsWith('.json'));
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
        //console.log('Assigned paths:', assignedPathNames);
        //console.log(papnames);

        //actually showing the json content on the page
        document.getElementById('jsonnames').textContent = jsonnames.join('\n');
        document.getElementById('jsoncontent').textContent = jsoncontent;
        //console.log(jsonObjects);

        //mod author header
        jsonObjects.forEach(({ jsonData, filePath }) => {
            if (filePath.endsWith('meta.json')) {
                const modName = jsonData.Name || 'Unknown Mod';
                const author = jsonData.Author || 'Unknown Author';
                const website = jsonData.Website || '#';

                const modlink = document.getElementById('modlink');
                const modinfo = document.getElementById('modinfo');
                if (modName !== 'Unknown Mod') {
                    document.getElementById('modinfo').style.display = "block";
                    document.getElementById('pmodinfo').style.display = "block";

                } else {
                    document.getElementById('unk_modinfo').style.display = "block";
                }

                // Set the link URL
                modlink.href = website;

                // Set the visible text
                modinfo.textContent = `${author} – ${modName}`;

            }
        });


    }
    catch (error) {
        console.error('Error opening folder:', error);
        document.getElementById('btnfolder_errmsg').style.display = 'block';
        document.getElementById('btnfolder_errmsg').textContent = 'Error: ' + error.message;
    }


    //list of groups
    document.getElementById('groups').style.display = 'block';
    //console.log('jsonObjects:', jsonObjects);
    //console.log('jsonData:', jsonObjects.map(obj => obj.jsonData));

    document.getElementById('groups').style.display = 'block';
    let id = 0;
    const groupMap = {};
    const groupTableMap = {}; // Store tables for each group



    jsonnamesonly.forEach((filename, index) => {
        if (['default_mod.json', 'meta.json'].includes(filename)) {
            //console.log(`Skipping ${filename}`);
            return; // skip this iteration
        }

        id++;
        // Find the corresponding json object
        const jsonObj = jsonObjects.find(o => o.filePath.endsWith(filename));
        const groupName = Array.isArray(jsonObj.jsonData)
            ? jsonObj.jsonData.find(item => item?.Name)?.Name || `Group ${id}`
            : jsonObj.jsonData.Name || `Group ${id}`;


        // Create the main drag-box div
        const dragBox = document.createElement('div');
        dragBox.className = 'drag-box';

        // Create the header div
        const header = document.createElement('div');
        header.className = 'drag-box-header';

        // Create the group name span
        const groupData = Array.isArray(jsonObj.jsonData)
            ? jsonObj.jsonData.find(item => item?.Name)
            : jsonObj.jsonData;


        // spanName = document.createElement('span');
        //spanName.id = `grp${id}`;
        //spanName.textContent = groupData?.Name || `Group ${id}`;;

        inputtextName = document.createElement('input');
        inputtextName.type = 'text';
        inputtextName.id = `grp${id}`;
        inputtextName.value = groupData?.Name || `Group ${id}`;

        if (!groupMap[groupData?.Name || `Group ${id}`]) {
            groupMap[groupData?.Name || `Group ${id}`] = {
                id: `grp${id}`,
                name: groupData?.Name || `Group ${id}`,
                jsonData: jsonObj.jsonData, //store json data for this group
            }
        }

        // Create the select element
        const spanSelect = document.createElement('span');
        const select = document.createElement('select');
        select.style.cssText = 'border-radius:6px;padding:2px 8px;font-size:0.98em;';
        select.innerHTML = `
        <option>Single</option>
        <option>Multi</option>
    `;
        const selectData = Array.isArray(jsonObj.jsonData)
            ? jsonObj.jsonData.find(item => item?.Type)
            : jsonObj.jsonData;

        select.value = selectData?.Type || 'single group'; // Set the value based on jsonData
        spanSelect.appendChild(select);

        // Append spans to header
        //header.appendChild(spanName);
        header.appendChild(inputtextName);
        header.appendChild(spanSelect);

        // Create drag-box-space div
        const dragSpace = document.createElement('div');

        const table = document.createElement('table');
        table.id = `table${groupName.replace(/\s+/g, '_')}`;

        const tbody = document.createElement('tbody');
        document.getElementById('defaultTable').addEventListener("dragover", allowDrop);
        document.getElementById('defaultTable').addEventListener("drop", drop);
        document.getElementById('unassignedTable').addEventListener("dragover", allowDrop);
        document.getElementById('unassignedTable').addEventListener("drop", drop);
        tbody.addEventListener("dragover", allowDrop);
        tbody.addEventListener("drop", drop);


        table.style.borderCollapse = 'collapse';
        table.style.minHeight = '40px'; // make empty tables visible

        //placeholders for empty group
        const placeholder = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 5; // number of columns
        td.class = "tddrop";
        //td.style.textAlign = 'center';
        //td.style.color = '#7fb3df';
        td.textContent = 'Drop file(s) here';
        placeholder.appendChild(td);
        tbody.appendChild(placeholder);



        table.appendChild(tbody);
        dragSpace.appendChild(table);

        groupTableMap[groupName] = tbody; // Store the table for this group

        // Append header and drag space to main box
        dragBox.appendChild(header);
        dragBox.appendChild(dragSpace);

        // Append drag-box to groups container
        document.getElementById('groups').appendChild(dragBox);
    });

    if (id === 0) {
        console.warn('No groups found in jsonnamesonly');
    }




    let trid = 0;
    //building the pap table visible on website
    if (document.getElementById('unassignedTable').style.display === 'none') {
        document.getElementById('unassignedTable').style.display = 'table';
    }
    if (papnames.length > 0) {

        const tbody = document.querySelector('#unassignedTable tbody');
        tbody.innerHTML = '';
        const tru = document.createElement('tr');
        const tdu = document.createElement('td');
        tdu.colSpan = 5;
        tdu.className = 'tddrop';
        tdu.style.textAlign = 'center';
        tdu.textContent = 'Drop file(s) here';

        tru.appendChild(tdu);
        tbody.appendChild(tru);
        //.innerHTML = ''; // Clear existing rows


        let targetTbody;


        papnames.forEach(pap => {
            //const assignedGroups = findAssignedGroup(jsonObjects, pap);
            const assignedGroups = [...new Set(findAssignedGroup(jsonObjects, pap))]; // remove duplicates

            //const tr = document.createElement('tr');
            const buildRow = (pap) => {
                const tr = document.createElement('tr');
                tr.id = trid++;
                // Name
                const tdName = document.createElement('td');
                tdName.textContent = pap;
                tr.appendChild(tdName);

                // Checkbox
                const tdCheckbox = document.createElement('td');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                tdCheckbox.appendChild(checkbox);
                tr.appendChild(tdCheckbox);

                // Method select
                const tdSelectMethod = document.createElement('td');
                const selectMethod = document.createElement('select');
                for (const key in method_map) {
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = key;

                    const keywords = Array.isArray(method_map[key]) ? method_map[key] : [method_map[key]];
                    if (keywords.some(k => pap.toLowerCase().includes(k.toLowerCase()))) option.selected = true;

                    selectMethod.appendChild(option);
                }
                tdSelectMethod.appendChild(selectMethod);
                tr.appendChild(tdSelectMethod);

                // Emote select
                const tdSelectEmote = document.createElement('td');
                const selectEmote = document.createElement('select');

                const assignedFileName = findAssignedPapNames(jsonObjects);
                let assignedfound = '';
                for (const assigned of assignedFileName) {
                    if (assigned.assignedValue.includes(pap)) {
                        assignedfound = assigned.pathKey;
                        break;
                    }
                }

                for (const key in emote_map) {
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = emote_map[key][0];

                    const keyword = normalizePath(key);
                    if (assignedfound && normalizePath(assignedfound.toLowerCase()).includes(keyword.toLowerCase())) {
                        option.selected = true;
                    } else if (normalizePath(pap.toLowerCase()).includes(keyword.toLowerCase())) {
                        option.selected = true;
                    }

                    selectEmote.appendChild(option);
                }

                tdSelectEmote.appendChild(selectEmote);
                tr.appendChild(tdSelectEmote);

                const tdButton = document.createElement('td');
                const delBtn = document.createElement('button');

                // edit button
                const editButton = document.createElement('button');
                editButton.className = 'smolbutton';
                const editIcon = document.createElement('img');
                editIcon.src = 'img/edit_icon.png'; // Path to your edit icon
                editIcon.alt = 'Edit';
                editIcon.style.width = '16px';
                editIcon.style.height = '16px';
                editButton.appendChild(editIcon);
                tdButton.appendChild(editButton);
                tr.appendChild(tdButton);

                // Clone button

                const cloneButton = document.createElement('button');
                cloneButton.className = 'smolbutton';
                const icon = document.createElement('img');
                icon.src = 'img/clone_icon.png'; // Path to your clone icon
                icon.alt = 'Clone';
                icon.style.width = '16px';
                icon.style.height = '16px';
                cloneButton.appendChild(icon);

                cloneButton.addEventListener('click', () => {
                    const clone = tr.cloneNode(true);
                    clone.dataset.id = ++trid; // give it a unique id
                    clone.addEventListener("dragstart", drag); // reattach drag listener
                    tdButton.parentElement.appendChild(clone); // append to the same tbody
                });

                tdButton.appendChild(cloneButton);
                tr.appendChild(tdButton);

                // Delete button

                delBtn.className = 'smolbutton';
                const delIcon = document.createElement('img');
                delIcon.src = 'img/delete_icon.png'; // Path to your delete icon
                delIcon.alt = 'Delete';
                delIcon.style.width = '16px';
                delIcon.style.height = '16px';
                delBtn.appendChild(delIcon);
                delBtn.addEventListener('click', () => tr.remove());
                tdButton.appendChild(delBtn);
                tr.appendChild(tdButton);


                tr.draggable = "true";
                tr.addEventListener("dragstart", drag)
                tr.dataset.id = trid;

                return tr;
            };

            if (assignedGroups.length > 0) {
                assignedGroups.forEach(group => {
                    const groupTbody = groupTableMap[group];
                    if (groupTbody) {
                        const placeholder = tbody.querySelector('tr td[colspan="5"]');
                        if (placeholder) placeholder.parentElement.remove();
                        groupTbody.appendChild(buildRow(pap));
                    } else {
                        console.warn(`No table found for group: ${group}`);
                    }
                });
            } else {
                document.querySelector('#unassignedTable tbody').appendChild(buildRow(pap));
                const placeholder = unassignedTbody.querySelector('tr td[colspan="5"]');
                if (placeholder) placeholder.parentElement.remove();

                const tbody = document.querySelector('#unassignedTable tbody');
                tbody.innerHTML = '';
                const tru = document.createElement('tr');
                const tdu = document.createElement('td');
                tdu.colSpan = 5;
                tdu.className = 'tddrop';
                tdu.style.textAlign = 'center';
                tdu.textContent = 'Drop file(s) here';

                tru.appendChild(tdu);
                tbody.appendChild(tru);

                //unassignedTbody.appendChild(buildRow(pap));
            }

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
